import mqttPacket, { type Packet } from 'mqtt-packet'
import { setTimeout as sleep } from 'timers/promises'

import PersistentWS, { WebSocketClientOptions } from '@textshq/platform-sdk/dist/PersistentWS'
import { InboxName } from '@textshq/platform-sdk'
import mqtt from 'mqtt-packet'
import {
  AutoIncrementStore,
  getMqttSid,
  getTimeValues,
  metaJSONStringify,
} from './util'
import { getLogger, type Logger } from './logger'
import type PlatformMetaMessenger from './api'
import { SyncChannel, SocketRequestResolverType, MMSocketTask } from './types'
import MetaMessengerPayloadHandler, { MetaMessengerPayloadHandlerResponse } from './payload-handler'
import EnvOptions from './env'
// import { MqttErrors } from './MetaMQTTErrors'
import { PromiseStore } from './PromiseStore'
import { NEVER_SYNC_TIMESTAMP } from './constants'

export const enum ThreadRemoveType {
  DELETE = 0,
  ARCHIVE = 1,
}

// instagram.com does it every 10 seconds
const PING_INTERVAL_MS = 10_000 - 100

export default class MetaMessengerWebSocket {
  private logger: Logger

  private get lsAppSettings() {
    return {
      qos: 1,
      topic: '/ls_app_settings',
      payload: JSON.stringify({
        ls_fdid: '',
        ls_sv: EnvOptions[this.papi.env].defaultVersionId,
      }),
    } as const
  }

  private packetAckPromises: PromiseStore<void>

  private isInitialConnection = true

  private isMQTTConnected = false

  private subscribedTopics = new Set<string>()

  readonly taskIds = new AutoIncrementStore()

  readonly requestIds = new AutoIncrementStore()

  readonly requestResolvers: PromiseStore<MetaMessengerPayloadHandlerResponse>

  private packetQueue: Packet[] = []

  constructor(private readonly papi: PlatformMetaMessenger) {
    this.logger = getLogger(this.papi.env, 'socket')
    this.requestResolvers = new PromiseStore(0, this.requestIds)
    this.packetAckPromises = new PromiseStore(0, new AutoIncrementStore(2))
    this.mqttParser.on('packet', packet => this.onPacket(packet))
    this.mqttParser.on('error', error => {
      this.logger.error(error, {}, '[ws] mqtt parser error')
    })
  }

  private generateMQTTConfig = () => {
    const mqttSid = getMqttSid()
    const endpoint = new URL(this.papi.api.config.mqttEndpoint)
    const endpointParams = new URLSearchParams(endpoint.searchParams)
    endpointParams.append('sid', mqttSid.toString())
    endpointParams.append('cid', this.papi.api.config.clientId)
    endpoint.search = endpointParams.toString()
    const { domain } = this.papi.envOpts
    const origin = `https://${domain}`
    const username = JSON.stringify({
      // u: "17841418030588216", // doesnt seem to matter
      u: this.papi.api.config.fbid,
      s: mqttSid,
      cp: Number(this.papi.api.config.mqttClientCapabilities),
      ecp: Number(this.papi.api.config.mqttCapabilities),
      chat_on: true,
      // fg: typeof document === "object" && document && document.hasFocus && document.hasFocus(), (original)
      fg: true,
      d: this.papi.api.config.clientId,
      ct: this.papi.api.envSwitch<string>('cookie_auth', 'websocket'),
      mqtt_sid: '',
      aid: Number(this.papi.api.config.appId),
      st: [...this.subscribedTopics],
      pm: this.isInitialConnection ? [] as const : [{ ...this.lsAppSettings, messageId: 2 ** 16, isBase64Publish: false }],
      dc: '',
      no_auto_fg: true,
      gas: null,
      pack: [],
      php_override: '',
      p: null,
      a: this.papi.api.ua, // user agent
      aids: null,
    })
    const config = {
      endpoint,
      wsOptions: {
        origin,
        headers: {
          Host: endpoint.host,
          Connection: 'Upgrade',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          Upgrade: 'websocket',
          Origin: origin,
          'Sec-WebSocket-Version': '13',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en', // @TODO: fix this
          'User-Agent': this.papi.api.ua,
          Cookie: this.papi.api.getCookies(),
        },
      },
      username,
      mqttSid,
    }
    this.mqttConfig = config
    return config
  }

  private mqttConfig: ReturnType<typeof this.generateMQTTConfig> = null

  private mqttParser: mqtt.Parser = mqtt.parser({ protocolVersion: 3 })

  private readonly onWSMessage = (data: Buffer) => {
    this.mqttParser.parse(data)
  }

  private readonly onWSClose = () => {
    this.isMQTTConnected = false
  }

  private readonly onWSOpen = async () => {
    this.logger.debug('[ws] after connect', {
      isInitialConnection: this.isInitialConnection,
      subscribedTopics: this.subscribedTopics,
    })

    await this.wsSend({
      cmd: 'connect',
      protocolId: 'MQIsdp',
      clientId: 'mqttwsclient',
      protocolVersion: 3,
      clean: true,
      keepalive: 10,
      username: this.mqttConfig.username,
    })

    if (this.isInitialConnection) {
      await this.wsSend({
        cmd: 'publish',
        messageId: 1,
        qos: 1,
        dup: false,
        retain: false,
        ...this.lsAppSettings,
      })
    }
  }

  private ws = new PersistentWS(this.getConnectionInfo.bind(this), this.onWSMessage, this.onWSOpen, this.onWSClose)

  private getConnectionInfo(): { endpoint: string, options?: WebSocketClientOptions } {
    const config = this.generateMQTTConfig()
    return { endpoint: config.endpoint.toString(), options: config.wsOptions }
  }

  // ig web on reconnections does not reset last task id and last request id
  // but on initial connection (page load) they are 0, since we keep these in memory
  // just not resetting mirrors the ig web behavior
  // this.lastTaskId = 0
  // this.lastRequestId = 0
  readonly connect = () => {
    this.isMQTTConnected = false
    return this.ws.connect()
  }

  dispose() {
    this.isMQTTConnected = false
    this.sendBrowserClosed()
    this.ws.dispose()
  }

  readonly wsSend = async (packet: Packet) => {
    this.logger.debug('sending', packet)
    await this.ws.send(mqttPacket.generate(packet))
  }

  readonly send = async (packet: Packet) => {
    if (this.isMQTTConnected) return this.wsSend(packet)
    this.logger.debug('enqueuing', packet)
    this.packetQueue.push(packet)
  }

  private pingInterval: NodeJS.Timeout

  private lastReceivedMessageAt: number

  private startPing() {
    if (this.pingInterval) throw new Error('pingInterval already exists')
    this.logger.debug('ping started')
    this.pingInterval = setInterval(() => {
      if (!this.ws.connected) return
      const timeSinceLastMsg = Date.now() - this.lastReceivedMessageAt
      if (timeSinceLastMsg > PING_INTERVAL_MS) {
        this.send({ cmd: 'pingreq' })
      }
    }, PING_INTERVAL_MS)
  }

  private clearPing() {
    this.logger.debug('ping cleared')
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private resetPing() {
    this.logger.debug('ping reset')
    this.clearPing()
    this.startPing()
  }

  private async subscribeToTopicsIfNotSubscribed(...topics: string[]) {
    const promises: Promise<void>[] = []
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      if (this.subscribedTopics.has(topic)) continue
      const { promise, id: messageId } = this.packetAckPromises.create()
      promise.then(() => {
        this.logger.debug(`suback for ${topic} (${messageId})`)
        this.subscribedTopics.add(topic)
      })
      promises.push(promise)
      await this.send({
        cmd: 'subscribe',
        qos: 1,
        subscriptions: [
          {
            topic,
            qos: 0,
          },
        ],
        messageId,
      } as any)
    }

    await Promise.all(promises)
  }

  private async onPacket(packet: Packet) {
    if (!packet) {
      this.logger.debug('empty packet', packet)
      return
    }

    this.lastReceivedMessageAt = Date.now()

    switch (packet.cmd) {
      case 'connack':
        this.resetPing()
        this.isMQTTConnected = true
        await this.runPacketQueue()
        await this.subscribeToTopicsIfNotSubscribed('/ls_foreground_state', '/ls_resp')
        await this.afterInitialHandshake()
        break
      case 'publish':
        if (packet.topic === '/ls_resp') {
          const payload = JSON.parse(packet.payload.toString())
          await new MetaMessengerPayloadHandler(this.papi, payload.payload, payload.request_id ? Number(payload.request_id) : null).__handle()
        }
        break
      case 'puback':
      case 'suback':
        if (this.packetAckPromises.has(packet.messageId)) {
          this.packetAckPromises.resolve(packet.messageId)
        }
        break
      case 'pingresp':
        this.logger.debug('pingresp')
        break
      default: {
        this.logger.debug('unhandled packet', packet)
      }
    }
  }

  private async runPacketQueue() {
    if (!this.packetQueue.length) return
    const packet = this.packetQueue.shift()
    await this.send(packet)
    await sleep(Math.floor(Math.random() * (70 - 30 + 1)) + 30)
    await this.runPacketQueue()
  }

  // runs after
  // - we get ack for requesting app settings
  // - we subscribe to /ls_foreground_state, /ls_resp
  private async afterInitialHandshake() {
    await Promise.all([
      this.subscribeToAllDatabases(),
      this.papi.envOpts.isFacebook ? this.papi.api.fetchMoreThreadsV3(InboxName.NORMAL) : undefined,
    ])
    this.isInitialConnection = false
  }

  async publishLightspeedRequest(reqData: {
    payload: string
    type: number
  }, {
    waitForResponse = true,
    type,
    timeoutMs,
  }: {
    waitForResponse?: boolean
    type?: SocketRequestResolverType
    timeoutMs?: number
  }) {
    const { promise, id: request_id } = waitForResponse
      ? this.requestResolvers.create(undefined, {
        type,
      }, timeoutMs) : { promise: null, id: this.requestIds.gen() }
    const { promise: packetAckPromise, id: messageId } = this.packetAckPromises.create()

    await this.send({
      cmd: 'publish',
      messageId,
      qos: 1,
      dup: false,
      retain: false,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: this.papi.api.config.appId,
        payload: reqData.payload,
        request_id,
        type: reqData.type,
      }),
    })

    await packetAckPromise

    if (promise) return promise
  }

  async publishTask(type: SocketRequestResolverType, tasks: MMSocketTask[], {
    timeoutMs,
  }: {
    timeoutMs?: number // defaults to never
  } = {}): Promise<MetaMessengerPayloadHandlerResponse> {
    const { epoch_id } = getTimeValues(this.requestIds)
    return this.publishLightspeedRequest({
      payload: metaJSONStringify({
        tasks,
        epoch_id,
        version_id: EnvOptions[this.papi.env].defaultVersionId,
      }),
      type: 3,
    }, { waitForResponse: true, timeoutMs })
  }

  private sendBrowserClosed() {
    return this.send({
      cmd: 'publish',
      messageId: this.packetAckPromises.createId(),
      payload: '{}',
      qos: 1,
      dup: false,
      retain: false,
      topic: '/browser_close',
    })
  }

  private async subscribeToAllDatabases() {
    const syncGroups = this.papi.api.getDefaultSyncGroups()
    const syncGroupsForEnv = this.papi.env === 'IG' ? syncGroups.igdSyncGroups : syncGroups.defaultSyncGroups

    const promises: Promise<unknown>[] = []

    for (let i = 0; i < syncGroupsForEnv.length; i++) {
      const syncGroup = syncGroupsForEnv[i]
      if (!syncGroup?.groupId || syncGroup?.minTimeToSyncTimestampMs === NEVER_SYNC_TIMESTAMP) continue

      let last_applied_cursor = null
      let sync_params = syncGroup.syncParams ?? null
      let requestType = 1

      if (syncGroup.groupId === SyncChannel.MAILBOX) {
        last_applied_cursor = this.papi.kv.get('cursor-1-1')
        requestType = 2
      } else if (syncGroup.groupId === SyncChannel.CONTACT) {
        last_applied_cursor = this.papi.kv.get('cursor-1-2')
        sync_params = JSON.stringify(this.papi.api.config.syncParams.contact)
        requestType = 2
      } else if (syncGroup.groupId === SyncChannel.E2EE) {
        last_applied_cursor = this.papi.kv.get('cursor-1-95')
        sync_params = this.papi.api.config.syncParams.e2ee ?? '{}'
        requestType = 2
      }

      promises.push(this.publishLightspeedRequest({
        payload: metaJSONStringify({
          database: syncGroup.groupId,
          epoch_id: getTimeValues(this.papi.socket.requestIds).epoch_id,
          failure_count: null,
          last_applied_cursor,
          sync_params,
          version: this.papi.envOpts.defaultVersionId,
        }),
        type: requestType,
      }, { waitForResponse: false }))
    }
    await Promise.allSettled(promises)
  }
}
