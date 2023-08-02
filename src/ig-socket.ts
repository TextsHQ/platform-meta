import WebSocket from 'ws'
import { debounce } from 'lodash'
import mqtt, { type Packet } from 'mqtt-packet'
import type { Message } from '@textshq/platform-sdk'

import { createPromise, getMqttSid, getTimeValues, parseMqttPacket, sleep } from './util'
import { getLogger } from './logger'
import type PlatformInstagram from './api'

const MAX_RETRY_ATTEMPTS = 12
const VERSION_ID = 6552526831451374

const getRetryTimeout = (attempt: number) =>
  Math.min(100 + (2 ** attempt + Math.random() * 100), 2000)

type IGSocketTask = {
  label: string
  payload: string
  queue_name: string
  failure_count: null
  task_id: number
}

const lsAppSettings = {
  qos: 1,
  topic: '/ls_app_settings',
  payload: JSON.stringify({
    ls_fdid: '',
    ls_sv: VERSION_ID, // version id
  }),
} as const

export default class InstagramWebSocket {
  private retryAttempt = 0

  private stop = false

  private ws: WebSocket

  private logger = getLogger('ig-socket')

  private mqttSid: number

  private isInitialConnection = true

  constructor(private readonly papi: PlatformInstagram) {}

  readonly connect = async () => {
    this.logger.info('connecting')
    await this.papi.initPromise // wait for api to be ready
    this.logger.info('connecting to ws')
    try {
      this.ws?.close()
    } catch (err) {
      this.logger.error('ws transport: connect error', err)
    }

    this.mqttSid = getMqttSid()
    this.lastTaskId = 0
    this.lastRequestId = 0

    this.ws = new WebSocket(
      `wss://edge-chat.instagram.com/chat?sid=${this.mqttSid}&cid=${this.papi.api.clientId}`,
      {
        origin: 'https://www.instagram.com',
        headers: {
          Host: 'edge-chat.instagram.com',
          Connection: 'Upgrade',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          Upgrade: 'websocket',
          Origin: 'https://www.instagram.com',
          'Sec-WebSocket-Version': '13',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
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
      this.logger.info('ws: onopen', {
        retryAttempt: this.retryAttempt,
      })
      if (this.retryAttempt) this.onReconnected()
      this.retryAttempt = 0
      this.onOpen()
    }

    this.ws.onerror = ev => {
      this.logger.error('ws: onerror', ev)
      if (!this.stop) retry()
    }

    this.ws.onclose = ev => {
      this.logger.info('ws: onclose', ev)
      clearInterval(this.pingInterval)
      this.pingInterval = null
      if (!this.stop) retry()
    }
  }

  private dispose() {
    this.logger.info('ws: disposing')
    this.stop = true
    this.ws?.close()
    clearTimeout(this.connectTimeout)
  }

  private onReconnected() {
    this.logger.info('ws: reconnected')
  }

  private connectTimeout: ReturnType<typeof setTimeout>

  private readonly waitAndSend = async (p: Packet) => {
    while (this.ws?.readyState !== WebSocket.OPEN) {
      this.logger.info('waiting 5ms to send')
      await sleep(5)
    }
    return this.send(p)
  }

  readonly send = (p: Packet) => {
    if (this.ws?.readyState !== WebSocket.OPEN) return this.waitAndSend(p)
    this.logger.debug('sending', p)
    this.ws.send(mqtt.generate(p))
  }

  private async onOpen() {
    await this.afterConnect()
    await this.sendAppSettings()
    this.startPing()
  }

  private afterConnect() {
    const st = this.isInitialConnection ? [] as const : [
      '/ls_foreground_state',
      '/ls_resp',
    ] as const
    const pm = this.isInitialConnection ? [] as const : [
      {
        ...lsAppSettings,
        messageId: 65536,
      } as const,
    ]

    const p = this.send({
      cmd: 'connect',
      protocolId: 'MQIsdp',
      clientId: 'mqttwsclient',
      protocolVersion: 3,
      clean: true,
      keepalive: 10,
      username: JSON.stringify({
        // u: "17841418030588216", // doesnt seem to matter
        u: this.papi.api.fbid,
        s: this.mqttSid,
        cp: 3,
        ecp: 10,
        chat_on: true,
        fg: false,
        d: this.papi.api.clientId, // client id
        ct: 'cookie_auth',
        mqtt_sid: '', // @TODO: should we use the one from the cookie?
        aid: 936619743392459, // app id
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
      ...lsAppSettings,
    } as any)
  }

  private async onMessage(data: WebSocket.RawData) {
    if (data.toString('hex') === '42020001') {
      // ack for app settings

      if (this.isInitialConnection) {
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
      }

      await this.maybeSubscribeToDatabaseOne()
      // this.getThreads()
    } else if (data[0] !== 0x42) {
      await this.parseNon0x42Data(data)
    } else {
      this.logger.info('unhandled message (1)', data)
    }
  }

  private async parseNon0x42Data(data: any) {
    // for some reason fb sends wrongly formatted packets for PUBACK.
    // this causes mqtt-packet to throw an error.
    // this is a hacky way to fix it.
    const payload = (await parseMqttPacket(data)) as any
    if (!payload) {
      this.logger.info('empty message (1.1)', data)
      return
    }

    // the broker sends 4 responses to the get messages command (request_id = 6)
    // 1. ack
    // 2. a response with a new cursor, the official client uses the new cursor to get more messages
    // however, the new cursor is not needed to get more messages, as the old cursor still works
    // not sure exactly what the new cursor is for, but it's not needed. the request_id is null
    // 3. unknown response with a request_id of 6. has no information
    // 4. the thread information. this is the only response that is needed. this packet has the text deleteThenInsertThread

    if (payload.request_id !== null) {
      this.requestResolvers?.get(Number(payload.request_id))?.(payload)
    }

    await this.papi.api.handlePayload(payload.payload)
  }

  loadMoreMessages(threadId: string, lastMessage?: { sentTs: string, messageId: string }) {
    if (!threadId || !lastMessage) throw new Error('threadId, lastMessage is required')
    return this.publishTask('load more messages', {
      label: '228',
      payload: JSON.stringify({
        thread_key: Number(threadId),
        direction: 0,
        reference_timestamp_ms: Number(lastMessage.sentTs),
        reference_message_id: lastMessage.messageId,
        sync_group: 1,
        cursor: this.papi.api.cursor,
      }),
      queue_name: `mrq.${threadId}`,
      task_id: this.genTaskId(),
      failure_count: null,
    })
  }

  async sendTypingIndicator(threadID: string) {
    const { promise, request_id } = this.createRequest('send typing indicator')

    await this.send({
      cmd: 'publish',
      messageId: 9,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: '936619743392459',
        payload: JSON.stringify({
          label: '3',
          payload: JSON.stringify({
            thread_key: threadID,
            is_group_thread: 0,
            is_typing: 1,
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

  async sendMessage(threadID: string, text: string) {
    if (this.papi.sendPromiseMap.has('sendmessage')) {
      return Promise.reject(new Error('already sending messages'))
    }
    const { promise, request_id } = this.createRequest('send message')

    const sendPromise = new Promise<Message[]>((resolve, reject) => {
      this.papi.sendPromiseMap.set('sendmessage', [resolve, reject])
    })
    const { epoch_id, otid, timestamp } = getTimeValues()
    const hmm = JSON.stringify({
      app_id: '936619743392459',
      payload: JSON.stringify({
        tasks: [
          {
            label: '46',
            payload: JSON.stringify({
              thread_id: threadID,
              otid: otid.toString(),
              source: 0,
              send_type: 1,
              sync_group: 1,
              text,
              initiating_source: 1,
              skip_url_preview_gen: 0,
              text_has_links: 0,
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
        ],
        epoch_id: Number(epoch_id),
        version_id: '6243569662359088',
      }),
      request_id,
      type: 3,
    })

    await this.send({
      cmd: 'publish',
      dup: false,
      qos: 1,
      retain: false,
      topic: '/ls_req',
      messageId: 4,
      payload: hmm,
    })
    return sendPromise
  }

  sendImage(threadID: string, imageID: string) {
    const { otid } = getTimeValues()
    return this.publishTask('send image', {
      label: '46',
      payload: JSON.stringify({
        thread_id: Number(threadID),
        otid: otid.toString(),
        source: 65537,
        send_type: 3,
        sync_group: 1,
        text: null,
        attachment_fbids: [imageID],
      }),
      queue_name: threadID.toString(),
      task_id: this.genTaskId(),
      failure_count: null,
    })
  }

  addReaction(threadID: string, messageID: string, reaction: string) {
    const message = this.papi.api.getMessage(threadID, messageID)
    return this.publishTask('add reaction', {
      label: '29',
      payload: JSON.stringify({
        thread_key: threadID,
        timestamp_ms: Number(message.timestampMs.getTime()),
        message_id: messageID,
        actor_id: this.papi.api.fbid,
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
    })
  }

  private lastTaskId = 0

  private genTaskId() {
    return ++this.lastTaskId
  }

  // private taskResolvers: Map<[number, number], () => void> = new Map()

  private lastRequestId = 0

  private genRequestId() {
    return ++this.lastRequestId
  }

  private requestResolvers: Map<number, (value?: any) => void> = new Map()

  private createRequest(tag: string) {
    const request_id = this.genRequestId()
    const { promise, resolve } = createPromise()
    this.logger.info(`[REQUEST #${request_id}][${tag}] create `)
    this.requestResolvers.set(request_id, response => {
      this.logger.info(`[REQUEST #${request_id}][${tag}] got response`, response)
      resolve(response)
    })
    return { request_id, promise }
  }

  // used for get messages and get threads
  async publishTask(tag: string, _tasks: IGSocketTask | IGSocketTask[]) {
    const tasks = Array.isArray(_tasks) ? _tasks : [_tasks]
    const { epoch_id } = getTimeValues()
    const { promise, request_id } = this.createRequest(`publish task: ${tag}`)

    await this.send({
      cmd: 'publish',
      messageId: 6,
      qos: 1,
      dup: false,
      retain: false,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: '936619743392459',
        payload: JSON.stringify({
          tasks,
          epoch_id,
          version_id: VERSION_ID,
        }),
        request_id,
        type: 3,
      }),
    })

    return promise
  }

  async fetchMessages(threadID: string) {
    if (this.papi.sendPromiseMap.has(`messages-${threadID}`)) {
      this.logger.info('already fetching messages')
      return Promise.reject(new Error('already fetching messages'))
    }
    const sendPromise = new Promise((resolve, reject) => {
      this.papi.sendPromiseMap.set(`messages-${threadID}`, [resolve, reject])
    })
    const lastMessage = this.papi.api.getLastMessage(threadID)
    this.logger.info('fetchMessages', { threadID, lastMessage })
    await this.publishTask('fetch messages', {
      label: '228',
      payload: JSON.stringify({
        thread_key: Number(threadID),
        direction: 0,
        reference_timestamp_ms: Number(lastMessage.timestampMs.getTime()),
        reference_message_id: lastMessage.messageId,
        sync_group: 1,
        cursor: this.papi.api.cursor,
      }),
      queue_name: `mrq.${threadID}`,
      task_id: this.genTaskId(),
      failure_count: null,
    })
    this.logger.info(`promising messages-${threadID}`)
    return sendPromise
  }

  getThreads() {
    if (this.papi.sendPromiseMap.has('threads')) {
      this.logger.error('already fetching threads')
      return Promise.reject(new Error('already fetching threads'))
    }

    const sendPromise = new Promise((resolve, reject) => {
      this.papi.sendPromiseMap.set('threads', [resolve, reject])
    })
    this.publishTask('get threads', {
      label: '145',
      payload: JSON.stringify({
        ...this.getLastThreadReference(),
        is_after: 0,
        parent_thread_key: 0,
        additional_pages_to_fetch: 0,
        messaging_tag: null,
        sync_group: 1,
      }),
      queue_name: 'trq',
      task_id: this.genTaskId(),
      failure_count: null,
    })
    this.logger.info('promising threads')
    return sendPromise
  }

  private getLastThreadReference() {
    return {
      ...this.papi.api.lastThreadReference,
      cursor: this.papi.api.cursor,
    }
  }

  // not sure exactly what this does but it's required.
  // my guess is it "subscribes to database 1"?
  // may need similar code to get messages.
  private maybeSubscribeToDatabaseOne() {
    const { epoch_id } = getTimeValues()
    return this.send({
      cmd: 'publish',
      messageId: 5,
      qos: 1,
      dup: false,
      retain: false,
      topic: '/ls_req',
      payload: JSON.stringify({
        app_id: '936619743392459',
        payload: JSON.stringify({
          database: 1,
          epoch_id,
          failure_count: null,
          last_applied_cursor: this.papi.api.cursor,
          sync_params: null,
          version: VERSION_ID,
        }),
        request_id: 5,
        type: 2,
      }),
    })
  }
}
