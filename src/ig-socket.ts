import WebSocket from 'ws'
import { debounce } from 'lodash'
import mqtt from 'mqtt-packet'
// import type { Logger } from 'pino'
// import { ServerEventType } from '@textshq/platform-sdk'

import { getMqttSid, getTimeValues, parseMqttPacket, sleep } from './util'
// import { parsePayload } from './parsers'
// import { MessageReaction, ServerEventType, texts } from '@textshq/platform-sdk'
// import { parsePayload } from './parsers'
import { getLogger } from './logger'
import type PlatformInstagram from './api'
// import { mapThread } from './mapper'

const MAX_RETRY_ATTEMPTS = 12

const getRetryTimeout = (attempt: number) =>
  Math.min(100 + (2 ** attempt + Math.random() * 100), 2000)

export default class InstagramWebSocket {
  private retryAttempt = 0

  private stop = false

  private ws: WebSocket

  private logger = getLogger('ig-socket')

  private mqttSid = getMqttSid()

  constructor(private readonly papi: PlatformInstagram) {}

  readonly connect = async () => {
    this.logger.info('connecting')
    await this.papi.initPromise // wait for api to be ready
    this.logger.info('connecting to ws')
    try {
      this.ws?.close()
    } catch (err) {
      this.logger.error('ws transport: connect', err)
    }
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

  private readonly waitAndSend = async (data: any) => {
    while (this.ws?.readyState !== WebSocket.OPEN) {
      this.logger.info('waiting 5ms to send')
      await sleep(5)
    }
    this.send(data)
  }

  readonly send = (data: ArrayBufferLike) => {
    if (this.ws?.readyState !== WebSocket.OPEN) return this.waitAndSend(data)
    this.ws.send(data)
  }

  private onOpen() {
    this.afterConnect()
    this.sendAppSettings()
    this.startPing()
  }

  // initiate connection
  private afterConnect() {
    this.send(
      mqtt.generate({
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
          st: [],
          pm: [],
          dc: '',
          no_auto_fg: true,
          gas: null,
          pack: [],
          php_override: '',
          p: null,
          a: this.papi.api.ua, // user agent
          aids: null,
        }),
      }),
    )
  }

  private pingInterval: NodeJS.Timeout

  private startPing() {
    this.pingInterval = setInterval(() => this.sendPing(), 5000)
  }

  private sendPing() {
    this.send(
      mqtt.generate({
        cmd: 'pingreq',
      }),
    )
  }

  private sendAppSettings() {
    // send app settings
    // need to wait for the ack before sending the subscribe
    this.send(
      mqtt.generate({
        cmd: 'publish',
        messageId: 1,
        qos: 1,
        topic: '/ls_app_settings',
        payload: JSON.stringify({
          ls_fdid: '',
          ls_sv: '9477666248971112', // version id
        }),
      } as any), // @TODO: fix mqtt-packet types
    )
  }

  private onMessage(data: WebSocket.RawData) {
    if (data.toString('hex') === '42020001') {
      // ack for app settings

      // subscribe to /ls_resp
      this.send(
        mqtt.generate({
          cmd: 'subscribe',
          qos: 1,
          subscriptions: [
            {
              topic: '/ls_resp',
              qos: 0,
            },
          ],
          messageId: 3,
        } as any), // @TODO: fix mqtt-packet types
      )

      this.maybeSubscribeToDatabaseOne()
      // this.getThreads()
    } else if (data[0] !== 0x42) {
      this.parseNon0x42Data(data)
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
      this.logger.info('request_id is not null', payload)
    }

    this.logger.info('INSTAGRAM', { payload })

    this.papi.api.handlePayload(payload.payload)
  }

  loadMoreMessages(threadId: string, lastMessage?: { sentTs: string, messageId: string }) {
    if (!threadId || !lastMessage) throw new Error('threadId, lastMessage is required')
    this.publishTask({
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
      task_id: 1,
      failure_count: null,
    })
  }

  sendTypingIndicator(threadID: string) {
    this.send(
      mqtt.generate({
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
          request_id: 45,
          type: 4,
        }),
      } as any),
    ) // @TODO: fix mqtt-packet types
  }

  sendMessage(threadID: string, text: string) {
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
            task_id: 0,
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
            task_id: 1,
            failure_count: null,
          },
        ],
        epoch_id: Number(epoch_id),
        version_id: '6243569662359088',
      }),
      request_id: 4,
      type: 3,
    })

    this.send(
      mqtt.generate({
        cmd: 'publish',
        dup: false,
        qos: 1,
        retain: false,
        topic: '/ls_req',
        messageId: 4,
        payload: hmm,
      }),
    )
  }

  sendImage(threadID: string, imageID: string) {
    const { otid } = getTimeValues()
    this.publishTask({
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
      task_id: 2,
      failure_count: null,
    })
  }

  // addReaction(threadID: string, messageID: string, reaction: string) {
  //   const message = this.papi.api.db.getMessage(threadID, messageID)

  //   this.publishTask({
  //     label: '29',
  //     payload: JSON.stringify({
  //       thread_key: threadID,
  //       timestamp_ms: Number(message.timestamp.getTime()),
  //       message_id: messageID,
  //       actor_id: this.papi.api.session.fbid,
  //       reaction,
  //       reacion_style: null,
  //       sync_group: 1,
  //     }),
  //     queue_name: JSON.stringify([
  //       'reaction',
  //       messageID,
  //     ]),
  //     task_id: 0,
  //     failure_count: null,
  //   })
  // }

  // used for get messages and get threads
  publishTask(_tasks: any) {
    const tasks = Array.isArray(_tasks) ? _tasks : [_tasks]
    const { epoch_id } = getTimeValues()

    this.send(
      mqtt.generate({
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
            version_id: '9477666248971112',
          }),
          request_id: 6,
          type: 3,
        }),
      }),
    )
  }

  fetchMessages(threadID: string) {
    const lastMessage = this.papi.api.getLastMessage(threadID)
    this.logger.info('fetchMessages', { threadID, lastMessage })
    this.publishTask({
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
      task_id: 1,
      failure_count: null,
    })
  }

  getThreads() {
    if (this.papi.sendPromiseMap.has('threads')) {
      this.logger.info('already fetching threads')
      return this.papi.sendPromiseMap.get('threads')[0]
    }

    const sendPromise = new Promise((resolve, reject) => {
      // this.sendPromiseMap.set(offlineThreadingId, [resolve, reject])
      this.papi.sendPromiseMap.set('threads', [resolve, reject])
    })
    this.publishTask({
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
      task_id: 1,
      failure_count: null,
    })
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
    this.send(
      mqtt.generate({
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
            version: 9477666248971112,
          }),
          request_id: 5,
          type: 2,
        }),
      }),
    )
  }
}
