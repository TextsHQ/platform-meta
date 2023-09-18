import WebSocket from 'ws'
import { debounce } from 'lodash'
import mqtt, { type Packet } from 'mqtt-packet'

import type { MessageContent, MessageSendOptions } from '@textshq/platform-sdk'
import { eq } from 'drizzle-orm'
import {
  createPromise,
  genClientContext,
  getMqttSid,
  getRetryTimeout,
  getTimeValues,
  INT64_MAX_AS_STRING,
  parseMqttPacket,
  sleep,
  timeoutOrPromise,
} from './util'
import { getLogger, type Logger } from './logger'
import type PlatformMetaMessenger from './api'
import { IGMessageRanges, MetaThreadRanges, ParentThreadKey, SyncGroup, ThreadFilter } from './types'
import MetaMessengerPayloadHandler, { MetaMessengerPayloadHandlerResponse } from './payload-handler'
import * as schema from './store/schema'
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

export enum RequestResolverType {
  CREATE_THREAD = 'CREATE_THREAD',
  CREATE_GROUP_THREAD = 'CREATE_GROUP_THREAD',
  SEND_MESSAGE = 'SEND_MESSAGE',
  UNSEND_MESSAGE = 'UNSEND_MESSAGE',
  FETCH_MESSAGES = 'FETCH_MESSAGES',
  FETCH_INITIAL_THREADS = 'FETCH_INITIAL_THREADS',
  FETCH_MORE_THREADS = 'FETCH_MORE_THREADS',
  FETCH_MORE_INBOX_THREADS = 'FETCH_MORE_INBOX_THREADS',
  REQUEST_CONTACTS = 'REQUEST_CONTACTS',
  MUTE_THREAD = 'MUTE_THREAD',
  SET_THREAD_NAME = 'SET_THREAD_NAME',
  SET_THREAD_FOLDER = 'SET_THREAD_FOLDER',
  SET_ADMIN_STATUS = 'SET_ADMIN_STATUS',
  MOVE_OUT_OF_MESSAGE_REQUESTS = 'MOVE_OUT_OF_MESSAGE_REQUESTS',
  ADD_PARTICIPANTS = 'ADD_PARTICIPANTS',
  REMOVE_PARTICIPANT = 'REMOVE_PARTICIPANT',
  GET_THREAD = 'GET_THREAD',
  GET_NEW_THREAD = 'GET_NEW_THREAD',
  DELETE_THREAD = 'DELETE_THREAD',
  SEARCH_USERS_PRIMARY = 'SEARCH_USERS_PRIMARY',
  SEARCH_USERS_SECONDARY = 'SEARCH_USERS_SECONDARY',
  SEND_READ_RECEIPT = 'SEND_READ_RECEIPT',
  FORWARD_MESSAGE = 'FORWARD_MESSAGE',
  SEND_TYPING_INDICATOR = 'SEND_TYPING_INDICATOR',
  ADD_REACTION = 'ADD_REACTION',
}

export type RequestResolverResolve = (response?: MetaMessengerPayloadHandlerResponse) => void
export type RequestResolverReject = (response?: MetaMessengerPayloadHandlerResponse | MetaMessengerError) => void

export default class MetaMessengerWebSocket {
  private retryAttempt = 0

  private stop = false

  private ws: WebSocket

  private logger: Logger

  private readonly lsAppSettings: {
    qos: 1
    topic: '/ls_app_settings'
    payload: string
  }

  constructor(private readonly papi: PlatformMetaMessenger) {
    this.logger = getLogger(this.papi.env, 'socket')
    this.lsAppSettings = {
      qos: 1,
      topic: '/ls_app_settings',
      payload: JSON.stringify({
        ls_fdid: '',
        ls_sv: EnvOptions[this.papi.env].defaultVersionId,
      }),
    } as const
  }

  private mqttSid: number

  private isInitialConnection = true

  private isSubscribedToLsResp = false

  readonly connect = async () => {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      this.logger.warn('[ws] already connected')
      return
    }
    this.logger.info('[ws] connecting (will wait for api to be ready)')
    // await this.papi.api.initPromise // wait for api to be ready
    this.logger.debug('[ws]', 'connecting to ws', {
      mqttSid: this.mqttSid,
      lastTaskId: this.lastTaskId,
      lastRequestId: this.lastRequestId,
    })

    try {
      this.ws?.close()
    } catch (err) {
      this.logger.error(err, {
        mqttSid: this.mqttSid,
        lastTaskId: this.lastTaskId,
        lastRequestId: this.lastRequestId,
      }, '[ws]', 'failed to close previous on connect error')
    }

    this.mqttSid = getMqttSid()

    // ig web on reconnections does not reset last task id and last request id
    // but on initial connection (page load) they are 0, since we keep these in memory
    // just not resetting mirrors the ig web behavior
    // this.lastTaskId = 0
    // this.lastRequestId = 0

    const endpoint = new URL(this.papi.api.config.mqttEndpoint)
    const endpointParams = new URLSearchParams(endpoint.searchParams)
    endpointParams.append('sid', this.mqttSid.toString())
    endpointParams.append('cid', this.papi.kv.get('clientId'))
    endpoint.search = endpointParams.toString()
    const { domain } = this.papi.envOpts
    const origin = `https://${domain}`
    this.ws = new WebSocket(
      endpoint.toString(),
      {
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
    )

    this.ws.on('message', data => this.onMessage(data))

    process.on('SIGINT', () => {
      this.dispose()
    })

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
    this.ws.send(mqtt.generate(p))
  }

  private async onOpen() {
    await this.afterConnect()
    // @TODO: need to send rtc_multi
    await this.sendAppSettings()
    this.startPing()
  }

  private afterConnect() {
    const isFacebook = this.papi.env === 'FB' || this.papi.env === 'MESSENGER'
    this.logger.debug('[ws] after connect', {
      isInitialConnection: this.isInitialConnection,
      isSubscribedToLsResp: this.isSubscribedToLsResp,
      isFacebook,
    })

    const st = this.isInitialConnection ? [] as const : [
      '/ls_foreground_state',
      '/ls_resp',
    ] as const
    // this.isSubscribedToLsResp && '/ls_resp',
    // ].filter(Boolean) as const

    const pm = this.isInitialConnection ? [] as const : [
      {
        ...this.lsAppSettings,
        messageId: 65536,
      } as const,
    ]

    const depends = <T>(valueForInstagram: T, valueForFacebookOrMessenger: T, defaultValue?: T) => {
      switch (this.papi.env) {
        case 'IG':
          return valueForInstagram
        case 'FB':
        case 'MESSENGER':
          return valueForFacebookOrMessenger
        default:
          if (defaultValue) return defaultValue
          throw new Error('Invalid environment')
      }
    }

    const p = this.send({
      cmd: 'connect',
      protocolId: 'MQIsdp',
      clientId: 'mqttwsclient',
      protocolVersion: 3,
      clean: true,
      keepalive: 10,
      username: JSON.stringify({
        // u: "17841418030588216", // doesnt seem to matter
        u: this.papi.kv.get('fbid'),
        s: this.mqttSid,
        cp: Number(this.papi.kv.get('mqttClientCapabilities')),
        ecp: Number(this.papi.kv.get('mqttCapabilities')),
        chat_on: depends<boolean>(true, false),
        fg: depends<boolean>(true, false),
        d: this.papi.kv.get('clientId'),
        ct: depends<string>('cookie_auth', 'websocket'),
        mqtt_sid: '', // this is empty in Mercury too // @TODO: should we use the one from the cookie?
        aid: Number(this.papi.kv.get('appId')),
        st,
        pm,
        dc: '',
        no_auto_fg: true,
        gas: null,
        pack: [],
        php_override: '',
        p: null,
        a: this.papi.api.ua, // user agent
        aids: null,
      }),
    })

    this.isInitialConnection = false
    return p
  }

  private pingInterval: NodeJS.Timeout

  private startPing() {
    this.logger.debug('ping started')
    // instagram.com does it every 10 seconds
    this.pingInterval = setInterval(() => this.sendPing(), 10000 - 100)
  }

  private sendPing() {
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

  private async onMessage(data: WebSocket.RawData) {
    if (data.toString('hex') === '42020001') {
      // ack for app settings

      if (!this.isSubscribedToLsResp) {
        // subscribe to /ls_foreground_state
        await this.send({
          cmd: 'subscribe',
          qos: 1,
          subscriptions: [
            {
              topic: '/ls_foreground_state',
              qos: 0,
            },
          ],
          messageId: 3, // TODO: Auto increment messageID
        } as any)
        // subscribe to /ls_resp
        await this.send({
          cmd: 'subscribe',
          qos: 1,
          subscriptions: [
            {
              topic: '/ls_resp',
              qos: 0,
            },
          ],
          messageId: 3,
        } as any)
        this.isSubscribedToLsResp = true
      }

      await this.subscribeToAllDatabases()
      // this.getThreads()
    } else if ((data as any)[0] !== 0x42) {
      await this.parseNon0x42Data(data)
    } else {
      this.logger.debug('unhandled message (1)', data)
    }
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

  async sendTypingIndicator(threadID: string, isTyping: boolean) {
    const { promise, request_id } = this.createRequest(RequestResolverType.SEND_TYPING_INDICATOR)
    this.logger.debug(`sending typing indicator ${threadID}`)
    await this.send({
      cmd: 'publish',
      messageId: 9,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: this.papi.kv.get('appId'),
        payload: JSON.stringify({
          label: '3',
          payload: JSON.stringify({
            thread_key: threadID,
            is_group_thread: 0,
            is_typing: isTyping ? 1 : 0,
            attribution: 0,
          }),
          version: '6243569662359088',
        }),
        request_id,
        type: 4,
      }),
    } as any)

    await promise
  }

  async sendMessage(threadID: string, { text }: MessageContent, { quotedMessageID }: MessageSendOptions, attachmentFbids: string[] = []) {
    const { otid, timestamp, now } = getTimeValues()

    const reply_metadata = quotedMessageID && {
      reply_source_id: quotedMessageID,
      reply_source_type: 1,
      reply_type: 0,
    }

    const hasAttachment = attachmentFbids.length > 0

    const result = await this.publishTask(RequestResolverType.SEND_MESSAGE, [
      {
        label: '46',
        payload: JSON.stringify({
          thread_id: threadID,
          otid: otid.toString(),
          source: (2 ** 16) + 1,
          send_type: hasAttachment ? 3 : 1,
          sync_group: 1,
          text: !hasAttachment ? text : null,
          initiating_source: hasAttachment ? undefined : 1,
          skip_url_preview_gen: hasAttachment ? undefined : 0,
          text_has_links: hasAttachment ? undefined : 0,
          reply_metadata,
          attachment_fbids: hasAttachment ? attachmentFbids : undefined,
        }),
        queue_name: threadID.toString(),
        task_id: this.genTaskId(),
        failure_count: null,
      },
      {
        label: '21',
        payload: JSON.stringify({
          thread_id: threadID,
          last_read_watermark_ts: Number(timestamp),
          sync_group: 1,
        }),
        queue_name: threadID.toString(),
        task_id: this.genTaskId(),
        failure_count: null,
      },
    ])

    return {
      timestamp: new Date(now),
      offlineThreadingId: String(otid),
      messageId: result?.replaceOptimsiticMessage.messageId,
    }
  }

  async addReaction(threadID: string, messageID: string, reaction: string) {
    const message = this.papi.db
      .select({
        threadKey: schema.messages.threadKey,
        messageId: schema.messages.messageId,
        timestampMs: schema.messages.timestampMs,
      })
      .from(schema.messages)
      .limit(1)
      .where(eq(schema.messages.threadKey, threadID))
      .where(eq(schema.messages.messageId, messageID))
      .get()

    // @TODO: check `replaceOptimisticReaction` in response (not parsed atm)
    await this.publishTask(RequestResolverType.ADD_REACTION, [{
      label: '29',
      payload: JSON.stringify({
        thread_key: threadID,
        timestamp_ms: Number(message.timestampMs.getTime()),
        message_id: messageID,
        actor_id: this.papi.kv.get('fbid'),
        reaction,
        reaction_style: null,
        sync_group: 1,
      }),
      queue_name: JSON.stringify([
        'reaction',
        messageID,
      ]),
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  // async createThread(userId: string) {
  //   const response = await this.publishTask(RequestResolverType.CREATE_THREAD, {
  //     label: '209',
  //     payload: JSON.stringify({
  //       // thread_fbid: BigInt(userId),
  //       thread_fbid: userId,
  //     }),
  //     queue_name: userId,
  //     task_id: this.genTaskId(),
  //     failure_count: null,
  //   })
  //   this.logger.info('create thread response', response)
  // }

  async createGroupThread(participants: string[]) {
    const { otid, now } = getTimeValues()
    const thread_id = genClientContext()
    const response = await this.publishTask(RequestResolverType.CREATE_GROUP_THREAD, [{
      label: '130',
      payload: JSON.stringify({
        participants,
        send_payload: {
          thread_id: thread_id.toString(),
          otid: otid.toString(),
          source: 0,
          send_type: 8,
        },
      }),
      queue_name: thread_id.toString(),
      task_id: this.genTaskId(),
      failure_count: null,
    }])
    this.logger.debug('create group thread response', response)
    return { now, offlineThreadingId: response?.replaceOptimisticThread?.offlineThreadingId, threadId: response?.replaceOptimisticThread?.threadId }
  }

  private lastTaskId = 0

  private genTaskId() {
    return ++this.lastTaskId
  }

  private lastRequestId = 0

  private genRequestId() {
    return ++this.lastRequestId
  }

  requestResolvers = new Map<number, [RequestResolverType, RequestResolverResolve, RequestResolverReject]>()

  messageRangesResolver = new Map<`messageRanges-${string}`, {
    promise: Promise<unknown>
    resolve:((r: IGMessageRanges) => void)
    reject: RequestResolverReject
  }[]>()

  private createRequest(type: RequestResolverType) {
    const request_id = this.genRequestId()
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

  // used for get messages and get threads
  async publishTask(type: RequestResolverType, tasks: MMSocketTask[]) {
    const { epoch_id } = getTimeValues()
    const { promise, request_id } = this.createRequest(type)

    await this.send({
      cmd: 'publish',
      messageId: 6,
      qos: 1,
      dup: false,
      retain: false,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: this.papi.kv.get('appId'),
        payload: JSON.stringify({
          tasks,
          epoch_id,
          version_id: EnvOptions[this.papi.env].defaultVersionId,
        }),
        request_id,
        type: 3,
      }),
    })

    return promise
  }

  async fetchMessages(threadID: string, _ranges?: Awaited<ReturnType<typeof this.papi.api.getMessageRanges>>) {
    const ranges = _ranges || await this.papi.api.getMessageRanges(threadID)

    this.logger.debug('fetchMessages', {
      threadID,
      ranges,
    })

    if (!ranges) return

    return this.publishTask(RequestResolverType.FETCH_MESSAGES, [{
      label: '228',
      payload: JSON.stringify({
        thread_key: threadID,
        direction: 0,
        reference_timestamp_ms: Number(ranges.minTimestamp),
        reference_message_id: ranges.minMessageId,
        sync_group: 1,
        cursor: this.papi.kv.get('cursor-1-1'),
      }),
      queue_name: `mrq.${threadID}`,
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  private fetchMoreThreadsV3Promises = new Map<'inbox' | 'requests', Promise<unknown>>()

  fetchMoreThreadsV3 = async (folder: 'inbox' | 'requests') => {
    if (this.fetchMoreThreadsV3Promises.has(folder)) {
      return this.fetchMoreThreadsV3Promises.get(folder)
    }

    const syncGroups: [SyncGroup, ParentThreadKey][] = []
    if (folder === 'requests') {
      syncGroups.push([SyncGroup.MAIN, ParentThreadKey.SPAM])
    } else if (this.papi.env === 'FB' || this.papi.env === 'MESSENGER') {
      syncGroups.push(
        [SyncGroup.MAIN, ParentThreadKey.GENERAL],
        [SyncGroup.MAIN, ParentThreadKey.PRIMARY],
        [SyncGroup.UNKNOWN, ParentThreadKey.GENERAL],
        [SyncGroup.UNKNOWN, ParentThreadKey.PRIMARY],
      )
    }

    this.logger.debug('fetchMoreThreadsV3', {
      folder,
      syncGroups,
    })

    const tasks = syncGroups.map(([syncGroup, parentThreadKey]) => {
      const range = this.papi.api.getSyncGroupThreadsRange(syncGroup, parentThreadKey)
      if (typeof range?.hasMoreBefore === 'boolean' && !range.hasMoreBefore) return
      const parent_thread_key = parentThreadKey
      const reference_thread_key = range?.minThreadKey || 0
      const reference_activity_timestamp = typeof range?.minLastActivityTimestampMs === 'number' ? range.minLastActivityTimestampMs : 9999999999999
      const cursor = this.papi.kv.get(`cursor-1-${syncGroup}`)
      return {
        label: '145',
        payload: JSON.stringify({
          is_after: 0,
          parent_thread_key,
          reference_thread_key,
          reference_activity_timestamp,
          additional_pages_to_fetch: 0,
          cursor,
          messaging_tag: null,
          sync_group: syncGroup,
        }),
        queue_name: 'trq',
        task_id: this.genTaskId(),
        failure_count: null,
      }
    }).filter(Boolean)

    // if there are no more threads to load
    if (tasks.length === 0) return
    const task = this.publishTask(RequestResolverType.FETCH_MORE_THREADS, tasks)
    const promiseWithTimeout = timeoutOrPromise(task, 15000)
    this.fetchMoreThreadsV3Promises.set(folder, promiseWithTimeout)
    return promiseWithTimeout.finally(() => this.fetchMoreThreadsV3Promises.delete(folder))
  }

  fetchInitialThreadsForIG = () => this.publishTask(RequestResolverType.FETCH_INITIAL_THREADS, [
    {
      label: '145',
      payload: JSON.stringify({
        is_after: 0,
        parent_thread_key: ParentThreadKey.GENERAL,
        reference_thread_key: 0,
        reference_activity_timestamp: 9999999999999,
        additional_pages_to_fetch: 0,
        cursor: this.papi.kv.get('cursor-1-1'),
        messaging_tag: null,
        sync_group: SyncGroup.MAIN,
      }),
      queue_name: 'trq',
      task_id: this.genTaskId(),
      failure_count: null,
    },
    {
      label: '145',
      payload: JSON.stringify({
        is_after: 0,
        parent_thread_key: ParentThreadKey.GENERAL,
        reference_thread_key: 0,
        reference_activity_timestamp: 9999999999999,
        additional_pages_to_fetch: 0,
        cursor: this.papi.kv.get('cursor-1-95'),
        messaging_tag: null,
        sync_group: SyncGroup.UNKNOWN,
      }),
      queue_name: 'trq',
      task_id: this.genTaskId(),
      failure_count: null,
    },
    this.papi.env === 'IG' && this.papi.kv.get('hasTabbedInbox') && {
      label: '313',
      payload: JSON.stringify({
        cursor: this.papi.kv.get('cursor-1-1'),
        filter: ThreadFilter.PRIMARY,
        is_after: 0,
        parent_thread_key: ParentThreadKey.GENERAL,
        reference_activity_timestamp: INT64_MAX_AS_STRING,
        reference_thread_key: INT64_MAX_AS_STRING,
        secondary_filter: 0,
        filter_value: '',
        sync_group: SyncGroup.MAIN,
      }),
      queue_name: 'trq',
      task_id: this.genTaskId(),
      failure_count: null,
    },
  ])

  fetchMoreThreads = async (parentThreadKey: ParentThreadKey) => {
    // if (
    //   (this.papi.env === 'IG' && this.papi.kv.get('hasTabbedInbox'))
    //   // || this.papi.env === 'MESSENGER'
    //   // || this.papi.env === 'FB'
    // ) {
    //   await this.fetchMoreInboxThreads(ThreadFilter.PRIMARY)
    //   await this.fetchMoreInboxThreads(ThreadFilter.GENERAL)
    //   return
    // }
    const sg1Primary = this.papi.api.getSyncGroupThreadsRange(SyncGroup.MAIN, parentThreadKey)
    const sg95Primary = this.papi.api.getSyncGroupThreadsRange(SyncGroup.UNKNOWN, parentThreadKey) || sg1Primary
    return this.publishTask(RequestResolverType.FETCH_MORE_THREADS, [
      {
        label: '145',
        payload: JSON.stringify({
          is_after: 0,
          parent_thread_key: parentThreadKey,
          reference_thread_key: sg1Primary.minThreadKey,
          reference_activity_timestamp: Number(sg1Primary.minLastActivityTimestampMs),
          additional_pages_to_fetch: 0,
          cursor: this.papi.kv.get('cursor-1-1'),
          messaging_tag: null,
          sync_group: SyncGroup.MAIN,
        }),
        queue_name: 'trq',
        task_id: this.genTaskId(),
        failure_count: null,
      },
      {
        label: '145',
        payload: JSON.stringify({
          is_after: 0,
          parent_thread_key: parentThreadKey,
          reference_thread_key: sg95Primary.minThreadKey,
          reference_activity_timestamp: Number(sg95Primary.minLastActivityTimestampMs),
          additional_pages_to_fetch: 0,
          cursor: null,
          messaging_tag: null,
          sync_group: SyncGroup.UNKNOWN,
        }),
        queue_name: 'trq',
        task_id: this.genTaskId(),
        failure_count: null,
      },
    ])
  }

  fetchMoreInboxThreads = (filter: ThreadFilter) => {
    const sg1Primary = this.papi.api.getSyncGroupThreadsRange(SyncGroup.MAIN, ParentThreadKey.PRIMARY)

    return this.publishTask(RequestResolverType.FETCH_MORE_INBOX_THREADS, [
      {
        label: '313',
        payload: JSON.stringify({
          cursor: this.papi.kv.get('cursor-1-1'),
          filter,
          is_after: 0,
          parent_thread_key: 0,
          reference_activity_timestamp: sg1Primary.minLastActivityTimestampMs,
          reference_thread_key: sg1Primary.minThreadKey,
          secondary_filter: 0,
          filter_value: '',
          sync_group: SyncGroup.MAIN,
        }),
        queue_name: 'trq',
        task_id: this.genTaskId(),
        failure_count: null,
      },
    ])
  }

  fetchSpamThreads = () => {
    const group1 = this.papi.api.getSyncGroupThreadsRange(SyncGroup.MAIN, ParentThreadKey.SPAM)
    const group95 = this.papi.api.getSyncGroupThreadsRange(SyncGroup.UNKNOWN, ParentThreadKey.SPAM)
    this.logger.debug('fetchRequestThreads', {
      group1,
      group95,
    })
    return this.publishTask(RequestResolverType.FETCH_INITIAL_THREADS, [
      {
        label: '145',
        payload: JSON.stringify({
          is_after: 0,
          parent_thread_key: ParentThreadKey.SPAM,
          reference_thread_key: INT64_MAX_AS_STRING,
          reference_activity_timestamp: INT64_MAX_AS_STRING,
          additional_pages_to_fetch: 0,
          cursor: this.papi.kv.get('cursor-1-1'),
          messaging_tag: null,
          sync_group: SyncGroup.MAIN,
        }),
        queue_name: 'trq',
        task_id: this.genTaskId(),
        failure_count: null,
      },
      {
        label: '145',
        payload: JSON.stringify({
          is_after: 0,
          parent_thread_key: ParentThreadKey.SPAM,
          reference_thread_key: INT64_MAX_AS_STRING,
          reference_activity_timestamp: INT64_MAX_AS_STRING,
          additional_pages_to_fetch: 0,
          cursor: this.papi.kv.get('cursor-1-95'),
          messaging_tag: null,
          sync_group: SyncGroup.UNKNOWN,
        }),
        queue_name: 'trq',
        task_id: this.genTaskId(),
        failure_count: null,
      },
    ])
  }

  async requestContacts(contactIDs: string[]) {
    return this.publishTask(RequestResolverType.REQUEST_CONTACTS, contactIDs.map(contact_id => ({
      label: '207',
      payload: JSON.stringify({
        contact_id,
      }),
      queue_name: 'cpq_v2',
      task_id: this.genTaskId(),
      failure_count: null,
    })))
    // @TODO: code above seems to work for messenger (it was made for ig)
    // but messenger.com uses `/send_additional_contacts`
  }

  async muteThread(thread_key: string, mute_expiration_time_ms: -1 | 0) {
    await this.publishTask(RequestResolverType.MUTE_THREAD, [{
      label: '144',
      payload: JSON.stringify({
        thread_key: Number(thread_key),
        mailbox_type: 0, // 0 = inbox
        mute_expire_time_ms: mute_expiration_time_ms,
        sync_group: 1,
      }),
      queue_name: thread_key.toString(),
      task_id: this.genTaskId(),
      failure_count: null,
    }])
    // listen for the response updateThreadMuteSetting
  }

  async setThreadName(thread_key: string, thread_name: string) {
    await this.publishTask(RequestResolverType.SET_THREAD_NAME, [{
      label: '32',
      payload: JSON.stringify({
        thread_key,
        thread_name,
      }),
      queue_name: thread_key.toString(),
      task_id: this.genTaskId(),
      failure_count: null,
    }])
    // listen for the response syncUpdateThreadName
  }

  async changeAdminStatus(thread_key: string, contact_id: string, is_admin: boolean) {
    await this.publishTask(RequestResolverType.SET_ADMIN_STATUS, [{
      label: '25',
      payload: JSON.stringify({
        thread_key,
        contact_id,
        is_admin: is_admin ? 1 : 0,
      }),
      queue_name: 'admin_status',
      task_id: this.genTaskId(),
      failure_count: null,
    }])

    // listen for the response updateThreadParticipantAdminStatus
  }

  async addParticipants(thread_key: string, contact_ids: string[]) {
    await this.publishTask(RequestResolverType.ADD_PARTICIPANTS, [{
      label: '23',
      payload: JSON.stringify({
        thread_key,
        contact_ids,
        sync_group: 1,
      }),
      queue_name: thread_key.toString(),
      task_id: this.genTaskId(),
      failure_count: null,
    }])
    // listen for the response addParticipantIdToGroupThread
  }

  async removeParticipant(threadID: string, userID: string) {
    await this.publishTask(RequestResolverType.REMOVE_PARTICIPANT, [{
      label: '140',
      payload: JSON.stringify({
        thread_id: threadID,
        contact_id: userID,
      }),
      queue_name: 'remove_participant_v2',
      task_id: this.genTaskId(),
      failure_count: null,
    }])
    // listen for the response removeParticipantFromThread
  }

  async unsendMessage(messageId: string) {
    await this.publishTask(RequestResolverType.UNSEND_MESSAGE, [{
      label: '33',
      payload: JSON.stringify({
        message_id: messageId,
      }),
      queue_name: 'unsend_message',
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  async getThread(threadKey: string) {
    return this.publishTask(RequestResolverType.GET_NEW_THREAD, [{
      label: '209',
      payload: JSON.stringify({
        thread_fbid: threadKey,
        force_upsert: 0,
        use_open_messenger_transport: 0,
        sync_group: 1,
        metadata_only: 0,
        preview_only: 0,
      }),
      queue_name: threadKey.toString(),
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  async deleteThread(thread_key: string) {
    return this.publishTask(RequestResolverType.DELETE_THREAD, [{
      label: '146',
      payload: JSON.stringify({
        thread_key,
        remove_type: 0,
        sync_group: 1,
      }),
      queue_name: thread_key.toString(),
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  async searchUsers(query: string) {
    const { timestamp } = getTimeValues()
    const payload = JSON.stringify({
      query,
      supported_types: [1, 3, 4, 2, 6, 7, 8, 9, 14],
      session_id: null,
      surface_type: this.papi.env === 'IG' ? 15 : 1,
      group_id: null,
      community_id: this.papi.env !== 'IG' ? null : undefined,
      thread_id: null,
    })

    const [primary, secondary] = await Promise.all([
      this.publishTask(RequestResolverType.SEARCH_USERS_PRIMARY, [{
        label: '30',
        payload,
        queue_name: JSON.stringify(['search_primary', timestamp.toString()]),
        task_id: this.genTaskId(),
        failure_count: null,
      }]),
      this.publishTask(RequestResolverType.SEARCH_USERS_SECONDARY, [{
        label: '31',
        payload,
        queue_name: JSON.stringify(['search_secondary']),
        task_id: this.genTaskId(),
        failure_count: null,
      }]),
    ])

    return [
      ...(primary?.insertSearchResult ?? []),
      ...(secondary?.insertSearchResult ?? []),
    ].filter(user => user.type === 'user')
  }

  async sendReadReceipt(thread_id: string, last_read_watermark_ts: number) {
    await this.publishTask(RequestResolverType.SEND_READ_RECEIPT, [{
      label: '21',
      payload: JSON.stringify({
        thread_id,
        last_read_watermark_ts,
        sync_group: 1,
      }),
      queue_name: thread_id,
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  // not sure exactly what this does, but it's required.
  // my guess is it "subscribes to database 1"?
  // may need similar code to get messages.
  private subscribeToDB(database: number, cursor: `cursor-${number}-${SyncGroup}` = null, syncParams: string = null) {
    const request_id = this.genRequestId()
    return this.send({
      cmd: 'publish',
      messageId: 6, // @TODO: pretty sure this is wrong
      qos: 1,
      dup: false,
      retain: false,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: this.papi.kv.get('appId'),
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
      }),
    })
  }

  private async subscribeToAllDatabases() {
    // this.subscribeToDB(1, 'cursor-1-1', null)
    await this.send({
      cmd: 'publish',
      messageId: 5,
      qos: 1,
      dup: false,
      retain: false,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: Number(this.papi.kv.get('appId')),
        payload: JSON.stringify({
          database: 1,
          epoch_id: getTimeValues().epoch_id,
          failure_count: null,
          last_applied_cursor: this.papi.kv.get('cursor-1-1'),
          sync_params: null,
          version: EnvOptions[this.papi.env].defaultVersionId,
        }),
        request_id: this.genRequestId(),
        type: 2,
      }),
    })
    const isFacebook = this.papi.env === 'FB' || this.papi.env === 'MESSENGER'
    // this.subscribeToDB(2, 'cursor-2') // @TODO add
    const syncParamsString = this.papi.kv.get('syncParams-1')
    if (this.papi.env === 'IG') {
      await this.subscribeToDB(6, null, syncParamsString)
      await this.subscribeToDB(7, null, JSON.stringify({
        mnet_rank_types: [44],
      }))
      await this.subscribeToDB(16, null, syncParamsString)
      await this.subscribeToDB(28, null, syncParamsString)
      await this.subscribeToDB(196, null, syncParamsString)
      await this.subscribeToDB(198, null, syncParamsString)
    } else if (isFacebook) {
      await this.subscribeToDB(2, 'cursor-1-1', null)
      await this.subscribeToDB(5, null, syncParamsString)
      await this.subscribeToDB(16, null, syncParamsString)
      await this.subscribeToDB(26, null, syncParamsString)
      await this.subscribeToDB(28, null, syncParamsString)
      await this.subscribeToDB(95, 'cursor-1-1', syncParamsString)
      await this.subscribeToDB(104, null, syncParamsString)
      await this.subscribeToDB(140, null, syncParamsString)
      await this.subscribeToDB(141, null, syncParamsString)
      await this.subscribeToDB(142, null, syncParamsString)
      await this.subscribeToDB(143, null, syncParamsString)
      await this.subscribeToDB(196, null, syncParamsString)
      await this.subscribeToDB(198, null, syncParamsString)
    }
  }

  // does not work for moving threads out of the message requests folder
  // prefer this.approveThread
  // since we pretend General and Primary are the same, this method is unused
  async changeThreadFolder(thread_key: string, old_ig_folder: number, new_ig_folder: number) {
    await this.publishTask(RequestResolverType.SET_THREAD_FOLDER, [{
      label: '511',
      payload: JSON.stringify({
        thread_key,
        old_ig_folder,
        new_ig_folder,
        sync_group: 1,
      }),
      queue_name: thread_key,
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  async approveThread(thread_key: string) {
    await this.publishTask(RequestResolverType.MOVE_OUT_OF_MESSAGE_REQUESTS, [{
      label: '66',
      payload: JSON.stringify({
        thread_key,
        sync_group: 1,
        ig_folder: 1,
      }),
      queue_name: 'message_request',
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  /**
   * @param thread_id thread id to forward to
   * @param forwarded_msg_id message id to forward
   */
  async forwardMessage(thread_id: string, forwarded_msg_id: string) {
    if (!thread_id) throw new Error('thread_id is required')
    if (!forwarded_msg_id || !forwarded_msg_id.startsWith('mid.')) throw new Error('messageID is required')

    const { otid } = getTimeValues()
    await this.publishTask(RequestResolverType.FORWARD_MESSAGE, [{
      label: '46',
      payload: JSON.stringify({
        thread_id,
        otid: otid.toString(),
        source: (2 ** 16) + 8,
        send_type: 5,
        sync_group: 1,
        forwarded_msg_id,
        strip_forwarded_msg_caption: 0,
        initiating_source: 1,
      }),
      queue_name: thread_id,
      task_id: this.genTaskId(),
      failure_count: null,
    }])
  }

  waitForMessageRange(threadKey: string) {
    const resolverKey = `messageRanges-${threadKey}` as const

    const p = createPromise()

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('WAIT_FOR_MESSAGE_RANGE_TIMEOUT'))
        // Optionally remove the promise from the array if it times out
        const existingPromises = this.messageRangesResolver.get(resolverKey) || []
        const index = existingPromises.findIndex(entry => entry.promise === p.promise)
        if (index !== -1) {
          existingPromises.splice(index, 1)
        }
      }, 10000)
    })

    const racedPromise = Promise.race([p.promise, timeoutPromise])

    const promiseEntry = {
      promise: racedPromise,
      resolve: p.resolve,
      reject: p.reject,
    }

    if (this.messageRangesResolver.has(resolverKey)) {
      this.messageRangesResolver.get(resolverKey).push(promiseEntry)
    } else {
      this.messageRangesResolver.set(resolverKey, [promiseEntry])
    }

    return racedPromise
  }
}
