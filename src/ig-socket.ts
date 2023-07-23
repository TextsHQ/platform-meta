import WebSocket from 'ws'
import mqtt from 'mqtt-packet'
import { ServerEventType, texts } from '@textshq/platform-sdk'

import { getMqttSid, getTimeValues, parseMqttPacket } from './util'
import { parseMessagePayload } from './parsers'
import type PlatformInstagram from './api'
import { mapThread } from './mapper'

export default class InstagramWebSocket {
  ws: WebSocket

  private mqttSid = getMqttSid()

  constructor(private readonly papi: PlatformInstagram) {
    if (!this.papi.api?.cursor) throw new Error('ig socket: cursor is required')

    this.ws = new WebSocket(
      `wss://edge-chat.instagram.com/chat?sid=${this.mqttSid}&cid=${this.papi.api.session.clientId}`,
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
    this.ws.on('error', err => this.onError(err))
    this.ws.on('open', () => this.onOpen())
    this.ws.on('close', () => this.onClose())
    this.ws.on('message', data => this.onMessage(data))
    process.on('SIGINT', () => {
      this.ws.close()
    })
  }

  // eslint-disable-next-line class-methods-use-this
  private onError(event: Error) {
    texts.log('ig socket: error', event)
  }

  private onOpen() {
    texts.log('ig socket: open')
    this.connect()
    this.sendAppSettings()
    this.startPing()
  }

  // initiate connection
  private connect() {
    const ws = this.getWS()
    if (!ws) return

    ws.send(
      mqtt.generate({
        cmd: 'connect',
        protocolId: 'MQIsdp',
        clientId: 'mqttwsclient',
        protocolVersion: 3,
        clean: true,
        keepalive: 10,
        username: JSON.stringify({
          // u: "17841418030588216", // doesnt seem to matter
          u: this.papi.api.session.fbid,
          s: this.mqttSid,
          cp: 3,
          ecp: 10,
          chat_on: true,
          fg: false,
          d: this.papi.api.session.clientId, // client id
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
    this.ws?.send(
      mqtt.generate({
        cmd: 'pingreq',
      }),
    )
  }

  private sendAppSettings() {
    // send app settings
    // need to wait for the ack before sending the subscribe
    this.ws.send(
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

  private onClose() {
    clearInterval(this.pingInterval)
    this.pingInterval = null
    texts.log('ig socket: close')
  }

  private onMessage(data: WebSocket.RawData) {
    if (data.toString('hex') === '42020001') {
      // ack for app settings

      // subscribe to /ls_resp
      this.ws.send(
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
      this.getThreads()
    } else if (data[0] !== 0x42) {
      this.parseNon0x42Data(data)
    } else {
      texts.log('ig socket: unhandled message (1)', data)
    }
  }

  private async parseNon0x42Data(data: any) {
    // for some reason fb sends wrongly formatted packets for PUBACK.
    // this causes mqtt-packet to throw an error.
    // this is a hacky way to fix it.
    const payload = (await parseMqttPacket(data)) as any
    if (!payload) {
      texts.log('ig socket: empty message (1.1)', data)
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
      texts.log('ig socket: request_id is not null', payload)
      return
    }
    if (payload.payload.includes('upsertMessage')) {
      await this.processUpsertMessage(data)
    } else if (payload.payload.includes('deleteThenInsertThread')) {
      await this.processDeleteThenInsertThread(data)
    } else {
      texts.log('ig socket: unhandled message (2)', data, JSON.stringify(payload, null, 2))
    }
  }

  private async processDeleteThenInsertThread(data: any) {
    texts.log('ig socket: deleteThenInsertThread')
    const payload = (await parseMqttPacket(data)) as any
    const { newConversations, newReactions } = parseMessagePayload(this.papi.api.session.fbid, payload.payload)
    texts.log('ig socket: deleteThenInsertThread, newConversations', JSON.stringify(newConversations, null, 2))

    const mappedNewConversations = newConversations.map(mapThread)
    this.papi.api.db.addThreads(mappedNewConversations)
    this.papi.onEvent?.([{
      type: ServerEventType.STATE_SYNC,
      objectName: 'thread',
      objectIDs: {},
      mutationType: 'upsert',
      entries: mappedNewConversations,
    }])

    texts.log(`ig socket: got reactions ${JSON.stringify(newReactions, null, 2)}`)

    this.publishTask({
      label: '145',
      payload: JSON.stringify({
        ...this.getLastThreadReference(newConversations),
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
  }

  private async processUpsertMessage(data: any) {
    texts.log('ig socket: upsertMessage')

    const payload = (await parseMqttPacket(data)) as any
    if (!payload) {
      texts.log('ig socket: empty message (2.1)', data)
      return
    }

    const { newMessages, newReactions, newConversations } = parseMessagePayload(this.papi.api.session.fbid, payload.payload)
    texts.log('ig socket:', 'upsertMessage', JSON.stringify({ newMessages, newReactions, newConversations }, null, 2))

    const mappedMessages = newMessages.map(m => this.papi.api.mapMessage(m))
    this.papi.api.db.addMessages(mappedMessages)

    for (const message of mappedMessages) {
      this.papi.onEvent?.([{
        type: ServerEventType.STATE_SYNC,
        objectName: 'message',
        objectIDs: { threadID: message.threadID },
        mutationType: 'upsert',
        entries: [message],
      }])
    }
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
    this.ws.send(
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

    this.ws.send(
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

  private getWS() {
    if (!this.ws) throw new Error('WebSocket not initialized')
    switch (this.ws.readyState) {
      case WebSocket.CLOSING:
      case WebSocket.CLOSED: {
        throw new Error('WebSocket is closing or closed')
      }
      case WebSocket.CONNECTING: {
        throw new Error('WebSocket is connecting')
      }
      case WebSocket.OPEN:
        return this.ws
      default: {
        texts.log(`ig socket: unknown readyState ${this.ws.readyState}`)
        return null
      }
    }
  }

  // used for get messages and get threads
  publishTask(_tasks: any) {
    const ws = this.getWS()
    if (!ws) return

    const tasks = Array.isArray(_tasks) ? _tasks : [_tasks]
    const { epoch_id } = getTimeValues()

    ws.send(
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

  getMessages(threadID: string) {
    const messages = this.papi.api.db.getMessages(threadID)
    const lastMessage = Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1] : null
    this.publishTask({
      label: '228',
      payload: JSON.stringify({
        thread_key: Number(threadID),
        direction: 0,
        reference_timestamp_ms: Number(lastMessage.timestamp.getTime()),
        reference_message_id: lastMessage.id,
        sync_group: 1,
        cursor: this.papi.api.cursor,
      }),
      queue_name: `mrq.${threadID}`,
      task_id: 1,
      failure_count: null,
    })
  }

  getThreads() {
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
  }

  private getLastThreadReference(conversations: any[] = this.papi.api.cursorCache?.newConversations ?? []) {
    const lastConversationInCursor = conversations?.[conversations.length - 1]
    return {
      reference_thread_key: Number(lastConversationInCursor.threadId),
      reference_activity_timestamp: lastConversationInCursor.lastSentTime,
      cursor: this.papi.api.cursor,
    }
  }

  // not sure exactly what this does but it's required.
  // my guess is it "subscribes to database 1"?
  // may need similar code to get messages.
  private maybeSubscribeToDatabaseOne() {
    const { epoch_id } = getTimeValues()
    this.ws.send(
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
