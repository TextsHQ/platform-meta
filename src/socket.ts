import WebSocket from 'ws'
import { debounce } from 'lodash'
import mqttPacket, { type Packet } from 'mqtt-packet'
import { setTimeout as sleep } from 'timers/promises'

import { InboxName } from '@textshq/platform-sdk'
import mqtt from 'mqtt-packet'
import {
  AutoIncrementStore,
  createPromise,
  getMqttSid,
  getRetryTimeout,
  getTimeValues,
  metaJSONStringify,
} from './util'
import { getLogger, type Logger } from './logger'
import type PlatformMetaMessenger from './api'
import { SyncChannel, SocketRequestResolverType, MMSocketTask } from './types'
import MetaMessengerPayloadHandler, { MetaMessengerPayloadHandlerResponse } from './payload-handler'
import { MetaMessengerError } from './errors'
import EnvOptions from './env'
import { MqttErrors } from './MetaMQTTErrors'
import { PromiseStore } from './PromiseStore'
import { NEVER_SYNC_TIMESTAMP } from './constants'
import { PlatformRequestScheduler } from './PlatformRequestScheduler'

const MAX_RETRY_ATTEMPTS = 12
const SOCKET_CONNECTION_TIMEOUT_MS = 20 * 1e3

export const enum ThreadRemoveType {
  DELETE = 0,
  ARCHIVE = 1,
}

export type RequestResolverResolve = (response?: MetaMessengerPayloadHandlerResponse) => void
export type RequestResolverReject = (response?: MetaMessengerPayloadHandlerResponse | MetaMessengerError) => void

export default class MetaMessengerWebSocket {
  private retryAttempt = 0

  private stop = false

  private ws: WebSocket

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

  constructor(private readonly papi: PlatformMetaMessenger) {
    this.logger = getLogger(this.papi.env, 'socket')
    this.packetAckPromises = new PromiseStore({
      startAt: 2,
      env: this.papi.env,
      timeoutMs: 0,
    })
  }

  private isInitialConnection = true

  private isConnected = false

  private subscribedTopics = new Set<string>()

  taskIds = new AutoIncrementStore()

  requestIds = new AutoIncrementStore()

  requestScheduler = new PlatformRequestScheduler()

  private packetAckPromises: PromiseStore<void>

  private packetQueue: Packet[] = []

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
      pm: this.isInitialConnection ? [] as const : [{ ...this.lsAppSettings, messageId: 65536, isBase64Publish: false }],
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

  private mqttParser: mqtt.Parser = null

  readonly connect = async () => {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      this.logger.warn('[ws] already connected')
      return
    }

    this.logger.debug('[ws]', 'connecting to ws', {
      lastTaskId: this.taskIds.current,
      lastRequestId: this.requestIds.current,
    })

    try {
      this.ws?.close()
    } catch (err) {
      this.logger.error(err, {
        lastTaskId: this.taskIds.current,
        lastRequestId: this.requestIds.current,
      }, '[ws]', 'failed to close previous on connect error')
    }

    this.isConnected = false

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }

    // @TODO: does not yet does anything
    this.connectionTimeout = setTimeout(() => {
      this.logger.error(MqttErrors.CONNECT_TIMEOUT)
    }, SOCKET_CONNECTION_TIMEOUT_MS)

    if (this.mqttParser) {
      this.mqttParser.removeAllListeners()
      this.mqttParser = null
    }

    this.mqttParser = mqtt.parser({
      protocolVersion: 3,
    })

    this.mqttParser.on('packet', packet => this.onPacket(packet))

    this.mqttParser.on('error', error => {
      this.logger.error(error, {}, '[ws] mqtt parser error')
    })

    // ig web on reconnections does not reset last task id and last request id
    // but on initial connection (page load) they are 0, since we keep these in memory
    // just not resetting mirrors the ig web behavior
    // this.lastTaskId = 0
    // this.lastRequestId = 0

    const { endpoint, wsOptions } = this.generateMQTTConfig()
    this.ws = new WebSocket(
      endpoint.toString(),
      wsOptions,
    )

    this.ws.binaryType = 'arraybuffer'

    this.ws.addEventListener('message', data => {
      const wsData = data.data
      if (!(wsData instanceof ArrayBuffer)) {
        this.logger.error('[ws] message is not an array buffer')
        return
      }
      this.mqttParser.parse(Buffer.from(wsData))
    })

    const retry = debounce(() => {
      this.logger.debug('[ws]', {
        retryAttempt: this.retryAttempt,
        MAX_RETRY_ATTEMPTS,
        stop: this.stop,
      })
      if (++this.retryAttempt <= MAX_RETRY_ATTEMPTS) {
        clearTimeout(this.connectTimeout)
        this.connectTimeout = setTimeout(() => this.connect(), getRetryTimeout(this.retryAttempt))
      } else {
        this.stop = true
        // trackEvent('error', {
        //   context: 'ws-error',
        //   message: 'Lost connection',
        // })
        // Sentry.captureMessage('Lost connection')
      }
    }, 25)

    this.ws.onopen = () => {
      this.logger.debug('[ws] onopen', {
        retryAttempt: this.retryAttempt,
      })
      if (this.retryAttempt) {
        this.logger.info('[ws] reconnected')
      }
      this.retryAttempt = 0
      this.onOpen()
    }

    this.ws.onerror = ev => {
      this.logger.error(ev, {}, '[ws] onerror', {
        error: ev.error,
        type: ev.type,
        message: ev.message,
      })
      if (!this.stop) retry()
    }

    this.ws.onclose = ev => {
      this.logger.debug('[ws] onclose', ev)
      this.isConnected = false

      if (this.pingInterval) {
        clearInterval(this.pingInterval)
      }
      if (!this.stop) retry()
    }
  }

  dispose() {
    this.logger.info('[ws] disposing', {
      stop: this.stop,
    })
    this.stop = true
    try {
      if (this.ws?.readyState === WebSocket.OPEN) this.sendBrowserClosed()
      this.ws?.close()
    } catch (err) {
      this.logger.error(err, {
        stop: this.stop,
      }, '[ws] failed to close on dispose')
    }
    clearTimeout(this.connectTimeout)
  }

  private connectTimeout: ReturnType<typeof setTimeout>

  readonly send = async (p: Packet, forceSend = false) => {
    if (this.isConnected || forceSend) {
      this.logger.debug('sending', p)
      this.ws.send(mqttPacket.generate(p))
      return
    }

    this.logger.debug('enqueuing', p)
    this.packetQueue.push(p)
  }

  private async onOpen() {
    this.logger.debug('[ws] after connect', {
      isInitialConnection: this.isInitialConnection,
      subscribedTopics: this.subscribedTopics,
    })

    await this.send({
      cmd: 'connect',
      protocolId: 'MQIsdp',
      clientId: 'mqttwsclient',
      protocolVersion: 3,
      clean: true,
      keepalive: 10,
      username: this.mqttConfig.username,
    }, true)

    if (this.isInitialConnection) {
      await this.send({
        cmd: 'publish',
        messageId: 1,
        qos: 1,
        dup: false,
        retain: false,
        ...this.lsAppSettings,
      }, true)
    }

    this.startPing()
  }

  private connectionTimeout: NodeJS.Timeout

  private pingInterval: NodeJS.Timeout

  private lastReceivedMessageAt: number

  private startPing() {
    this.logger.debug('ping started')
    // instagram.com does it every 10 seconds
    if (this.pingInterval) clearInterval(this.pingInterval)
    const intervalMs = 10000 - 100
    this.pingInterval = setInterval(() => {
      const timeSinceLastMsg = Date.now() - this.lastReceivedMessageAt
      if (timeSinceLastMsg > intervalMs) {
        this.send({ cmd: 'pingreq' })
      }
    }, intervalMs)
  }

  private async subscribeToTopicsIfNotSubscribed(...topics: string[]) {
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      if (this.subscribedTopics.has(topic)) continue
      const { promise, id: messageId } = this.packetAckPromises.create()
      promise.then(() => {
        this.logger.debug(`suback for ${topic} (${messageId})`)
        this.subscribedTopics.add(topic)
      })

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
  }

  private async onPacket(packet: Packet) {
    if (!packet) {
      this.logger.debug('empty packet', packet)
      return
    }

    this.lastReceivedMessageAt = Date.now()

    switch (packet.cmd) {
      case 'connack':
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
          this.connectionTimeout = null
        }
        this.isConnected = true
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

  requestResolvers = new Map<number, [SocketRequestResolverType, RequestResolverResolve, RequestResolverReject]>()

  createRequest(type: SocketRequestResolverType) {
    const request_id = this.requestIds.gen()
    const { promise, resolve, reject } = createPromise<MetaMessengerPayloadHandlerResponse>()
    const logPrefix = `[REQUEST #${request_id}][${type}]`
    this.logger.debug(logPrefix, 'sent')
    const resolver = (response: MetaMessengerPayloadHandlerResponse) => {
      this.logger.debug(logPrefix, 'got response', response)
      resolve(response)
      this.requestResolvers.delete(request_id)
    }
    const _reject = (response: MetaMessengerPayloadHandlerResponse | MetaMessengerError) => {
      if (!(response instanceof MetaMessengerError)) {
        this.logger.error(new MetaMessengerError(this.papi.env, -1, 'request resolver rejected', `payload: ${JSON.stringify(response)}`))
      }
      reject(response)
      this.requestResolvers.delete(request_id)
    }
    this.requestResolvers.set(request_id, [type, resolver, _reject])
    return { request_id, promise }
  }

  async publishLightspeedRequest({
    payload,
    request_id,
    type,
  }: {
    payload: string
    request_id: number
    type: number
  }) {
    const { promise, id: messageId } = this.packetAckPromises.create()

    await this.send({
      cmd: 'publish',
      messageId,
      qos: 1,
      dup: false,
      retain: false,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: this.papi.api.config.appId,
        payload,
        request_id,
        type,
      }),
    })

    await promise
  }

  async publishTask(type: SocketRequestResolverType, tasks: MMSocketTask[], {
    timeout,
    throwOnTimeout,
  }: {
    timeout?: number // defaults to never
    throwOnTimeout?: boolean // defaults to false
  } = {}): Promise<MetaMessengerPayloadHandlerResponse> {
    const { epoch_id } = getTimeValues(this.requestIds)
    const { promise, request_id } = this.createRequest(type)
    const payload = metaJSONStringify({
      tasks,
      epoch_id,
      version_id: EnvOptions[this.papi.env].defaultVersionId,
    })
    await this.publishLightspeedRequest({
      payload,
      request_id,
      type: 3,
    })

    if (typeof timeout === 'number' && timeout > 0) {
      const timeoutPromise = sleep(timeout).then(() => {
        if (throwOnTimeout) {
          throw new MetaMessengerError(this.papi.env, -1, `publishTask/${type} timed out`)
        }
        return {}
      })

      return Promise.race([promise, timeoutPromise])
    }

    return promise
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

    const promises: Promise<void>[] = []

    for (let i = 0; i < syncGroupsForEnv.length; i++) {
      const syncGroup = syncGroupsForEnv[i]
      if (!syncGroup?.groupId || syncGroup?.minTimeToSyncTimestampMs === NEVER_SYNC_TIMESTAMP) continue

      const request_id = this.requestIds.gen()
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
        request_id,
        type: requestType,
      }))
    }
    await Promise.allSettled(promises)
  }

  private clearTimeouts() {
    clearTimeout(this.connectTimeout)
  }
}
