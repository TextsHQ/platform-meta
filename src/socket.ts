import WebSocket from 'ws'
import { debounce } from 'lodash'
import mqttPacket, { type Packet } from 'mqtt-packet'
import { setTimeout as sleep } from 'timers/promises'

import { InboxName } from '@textshq/platform-sdk'
import {
  AutoIncrementStore,
  createPromise,
  getMqttSid,
  getRetryTimeout,
  getTimeValues,
  parseMqttPacket,
} from './util'
import { getLogger, type Logger } from './logger'
import type PlatformMetaMessenger from './api'
import { SyncGroup } from './types'
import MetaMessengerPayloadHandler, { MetaMessengerPayloadHandlerResponse } from './payload-handler'
import { MetaMessengerError } from './errors'
import EnvOptions from './env'

const MAX_RETRY_ATTEMPTS = 12

type MMSocketTask = {
  label: string
  payload: string
  queue_name: string
  failure_count: null
  task_id: number
}

export const enum RequestResolverType {
  ADD_PARTICIPANTS = 'ADD_PARTICIPANTS',
  ADD_REACTION = 'ADD_REACTION',
  ARCHIVE_THREAD = 'ARCHIVE_THREAD',
  CREATE_GROUP_THREAD = 'CREATE_GROUP_THREAD',
  CREATE_THREAD = 'CREATE_THREAD',
  DELETE_THREAD = 'DELETE_THREAD',
  FETCH_INITIAL_THREADS = 'FETCH_INITIAL_THREADS',
  FETCH_MESSAGES = 'FETCH_MESSAGES',
  FETCH_MORE_INBOX_THREADS = 'FETCH_MORE_INBOX_THREADS',
  FETCH_MORE_THREADS = 'FETCH_MORE_THREADS',
  FORWARD_MESSAGE = 'FORWARD_MESSAGE',
  GET_NEW_THREAD = 'GET_NEW_THREAD',
  GET_THREAD = 'GET_THREAD',
  MOVE_OUT_OF_MESSAGE_REQUESTS = 'MOVE_OUT_OF_MESSAGE_REQUESTS',
  MUTE_THREAD = 'MUTE_THREAD',
  REMOVE_PARTICIPANT = 'REMOVE_PARTICIPANT',
  REMOVE_THREAD = 'REMOVE_THREAD',
  REQUEST_CONTACTS = 'REQUEST_CONTACTS',
  SEARCH_USERS_PRIMARY = 'SEARCH_USERS_PRIMARY',
  SEARCH_USERS_SECONDARY = 'SEARCH_USERS_SECONDARY',
  SEND_MESSAGE = 'SEND_MESSAGE',
  SEND_READ_RECEIPT = 'SEND_READ_RECEIPT',
  SEND_TYPING_INDICATOR = 'SEND_TYPING_INDICATOR',
  SET_ADMIN_STATUS = 'SET_ADMIN_STATUS',
  SET_THREAD_FOLDER = 'SET_THREAD_FOLDER',
  SET_THREAD_NAME = 'SET_THREAD_NAME',
  UNARCHIVE_THREAD = 'UNARCHIVE_THREAD',
  UNSEND_MESSAGE = 'UNSEND_MESSAGE',
}

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
  }

  private isInitialConnection = true

  private subscribedTopics = new Set<string>()

  taskIds = new AutoIncrementStore()

  private requestIds = new AutoIncrementStore()

  private messageIds = new AutoIncrementStore(2) // this appears to be Math.random() in meta's code

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
      chat_on: this.papi.api.envSwitch<boolean>(true, false),
      fg: this.papi.api.envSwitch<boolean>(true, false),
      d: this.papi.api.config.clientId,
      ct: this.papi.api.envSwitch<string>('cookie_auth', 'websocket'),
      mqtt_sid: '', // this is empty in Mercury too // @TODO: should we use the one from the cookie?
      aid: Number(this.papi.api.config.appId),
      st: [...this.subscribedTopics],
      pm: this.isInitialConnection ? [] as const : [{ ...this.lsAppSettings, messageId: 65536 }],
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

    this.ws.on('message', data => this.onMessage(data))

    const retry = debounce(() => {
      this.logger.debug('[ws]', {
        retryAttempt: this.retryAttempt,
        MAX_RETRY_ATTEMPTS,
        stop: this.stop,
      })
      if (++this.retryAttempt <= MAX_RETRY_ATTEMPTS) {
        clearTimeout(this.connectTimeout)
        this.connectTimeout = setTimeout(this.connect, getRetryTimeout(this.retryAttempt))
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
      if (this.retryAttempt) this.onReconnected()
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
      clearInterval(this.pingInterval)
      this.pingInterval = null
      if (!this.stop) retry()
    }
  }

  dispose() {
    this.logger.info('[ws] disposing', {
      stop: this.stop,
    })
    this.stop = true
    try {
      this.ws?.close()
    } catch (err) {
      this.logger.error(err, {
        stop: this.stop,
      }, '[ws] failed to close on dispose')
    }
    clearTimeout(this.connectTimeout)
  }

  private onReconnected() {
    this.logger.info('[ws] reconnected')
  }

  private connectTimeout: ReturnType<typeof setTimeout>

  private readonly waitAndSend = async (p: Packet) => {
    // @TODO: there should be a queue for this
    while (this.ws?.readyState !== WebSocket.OPEN && !this.stop) {
      this.logger.debug('[ws] waiting 5ms to send')
      await sleep(5)
    }
    if (this.stop) {
      this.logger.debug('[ws] stop is true, not sending', p.cmd.toString())
      return
    }
    return this.send(p)
  }

  readonly send = (p: Packet): Promise<void> | void => {
    if (this.ws?.readyState !== WebSocket.OPEN) return this.waitAndSend(p)
    this.logger.debug('sending', p)
    this.ws.send(mqttPacket.generate(p))
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
    })

    // @TODO: need to send rtc_multi
    await this.sendAppSettings()
    this.startPing()
  }

  private pingInterval: NodeJS.Timeout

  private startPing() {
    this.logger.debug('ping started')
    // instagram.com does it every 10 seconds
    this.pingInterval = setInterval(() => this.sendPing(), 10000 - 100)
  }

  private sendPing() {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    return this.send({
      cmd: 'pingreq',
    })
  }

  private sendAppSettings() {
    // send app settings
    // need to wait for the ack before sending the subscribe
    return this.send({
      cmd: 'publish',
      messageId: 1,
      ...this.lsAppSettings,
    } as any)
  }

  private async subscribeToTopicsIfNotSubscribed(...topics: string[]) {
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      if (this.subscribedTopics.has(topic)) continue
      await this.send({
        cmd: 'subscribe',
        qos: 1,
        subscriptions: [
          {
            topic,
            qos: 0,
          },
        ],
        messageId: this.messageIds.gen(),
      } as any)
      this.subscribedTopics.add(topic)
    }
  }

  private async onMessage(data: WebSocket.RawData) {
    if (data.toString('hex') === '42020001') {
      // ack for app settings

      await this.subscribeToTopicsIfNotSubscribed('/ls_foreground_state', '/ls_resp')
      if (this.isInitialConnection) {
        await this.afterInitialHandshake()
      }
    } else if ((data as any)[0] !== 0x42) {
      await this.parseNon0x42Data(data)
    } else {
      this.logger.debug('unhandled message (1)', data)
    }
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

  private async parseNon0x42Data(data: any) {
    // for some reason, fb sends wrongly formatted packets for PUBACK.
    // this causes mqtt-packet to throw an error.
    // this is a hacky way to fix it.
    const payload = (await parseMqttPacket(data)) as any
    if (!payload) {
      this.logger.debug('empty message (1.1)', data)
      return
    }

    // the broker sends 4 responses to the get messages command (request_id = 6)
    // 1. ack
    // 2. a response with a new cursor, the official client uses the new cursor to get more messages
    // however, the new cursor is not needed to get more messages, as the old cursor still works
    // not sure exactly what the new cursor is for, but it's not needed. the request_id is null
    // 3. unknown response with a request_id of 6. has no information
    // 4. the thread information. this is the only response that is needed. this packet has the text deleteThenInsertThread
    await new MetaMessengerPayloadHandler(this.papi, payload.payload, payload.request_id ? Number(payload.request_id) : null).__handle()
  }

  requestResolvers = new Map<number, [RequestResolverType, RequestResolverResolve, RequestResolverReject]>()

  createRequest(type: RequestResolverType) {
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
    return this.send({
      cmd: 'publish',
      messageId: this.messageIds.gen(),
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
  }

  async publishTask(type: RequestResolverType, tasks: MMSocketTask[], {
    timeout,
    throwOnTimeout,
  }: {
    timeout?: number // defaults to never
    throwOnTimeout?: boolean // defaults to false
  } = {}): Promise<MetaMessengerPayloadHandlerResponse> {
    const { epoch_id } = getTimeValues()
    const { promise, request_id } = this.createRequest(type)

    await this.publishLightspeedRequest({
      payload: JSON.stringify({
        tasks,
        epoch_id,
        version_id: EnvOptions[this.papi.env].defaultVersionId,
      }),
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

  private async subscribeToAllDatabases() {
    // this.subscribeToDB(1, 'cursor-1-1', null)
    const promises = [
      this.publishLightspeedRequest({
        payload: JSON.stringify({
          database: 1,
          epoch_id: getTimeValues().epoch_id,
          failure_count: null,
          last_applied_cursor: this.papi.kv.get('cursor-1-1'),
          sync_params: null,
          version: EnvOptions[this.papi.env].defaultVersionId,
        }),
        request_id: this.requestIds.gen(),
        type: 2,
      }),
    ]

    // this.subscribeToDB(2, 'cursor-2') // @TODO add

    const syncParamsString = this.papi.kv.get('syncParams-1')
    const subs: [number, `cursor-${number}-${SyncGroup}`, string][] = this.papi.api.envSwitch([
      [6, null, syncParamsString],
      [7, null, JSON.stringify({
        mnet_rank_types: [44],
      })],
      [16, null, syncParamsString],
      [28, null, syncParamsString],
      [196, null, syncParamsString],
      [198, null, syncParamsString],
    ], [
      [2, 'cursor-1-1', null],
      [5, null, syncParamsString],
      [16, null, syncParamsString],
      [26, null, syncParamsString],
      [28, null, syncParamsString],
      [95, 'cursor-1-1', syncParamsString],
      [104, null, syncParamsString],
      [140, null, syncParamsString],
      [141, null, syncParamsString],
      [142, null, syncParamsString],
      [143, null, syncParamsString],
      [196, null, syncParamsString],
      [198, null, syncParamsString],
    ])

    for (let i = 0; i < subs.length; i++) {
      const [database, cursor, syncParams] = subs[i]
      const request_id = this.requestIds.gen()
      promises.push(this.publishLightspeedRequest({
        payload: JSON.stringify({
          database,
          epoch_id: getTimeValues().epoch_id,
          failure_count: null,
          last_applied_cursor: cursor ? this.papi.kv.get(cursor) : null,
          sync_params: syncParams,
          version: EnvOptions[this.papi.env].defaultVersionId,
        }),
        request_id,
        type: 1,
      }))
    }
    await Promise.allSettled(promises)
  }
}
