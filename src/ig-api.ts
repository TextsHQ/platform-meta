import { CookieJar } from 'tough-cookie'
import axios, { type AxiosInstance } from 'axios'
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http'
import { texts, type User, ServerEventType } from '@textshq/platform-sdk'
import { desc, eq, type InferModel } from 'drizzle-orm'

import { readFile } from 'fs/promises'
// import pick from 'lodash/pick'

import * as schema from './store/schema'
import type Instagram from './api'
import { parseRawPayload } from './parsers'
import { mapMessage, mapThread } from './mapper'
import { getLogger } from './logger'
import type { SerializedSession } from './types'

const INSTAGRAM_BASE_URL = 'https://www.instagram.com/' as const

const fixUrl = (url: string) =>
  url && decodeURIComponent(url.replace(/\\u0026/g, '&'))

interface InstagramParsedViewerConfig {
  biography: string
  business_address_json: null
  business_contact_method: string
  business_email: null
  business_phone_number: null
  can_see_organic_insights: boolean
  category_name: null
  external_url: null
  fbid: string
  full_name: string
  has_phone_number: boolean
  has_profile_pic: boolean
  has_tabbed_inbox: boolean
  hide_like_and_view_counts: boolean
  id: string
  is_business_account: boolean
  is_joined_recently: boolean
  is_supervised_user: boolean
  guardian_id: null
  is_private: boolean
  is_professional_account: boolean
  is_supervision_enabled: boolean
  profile_pic_url: string
  profile_pic_url_hd: string
  should_show_category: boolean
  should_show_public_contacts: boolean
  username: string
}

const commonHeaders = {
  authority: 'www.instagram.com',
  'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
  'sec-ch-prefers-color-scheme': 'light',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-ch-ua-platform-version': '"13.2.1"',
  'sec-ch-ua':
    '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
  'sec-fetch-site': 'same-origin',
  'sec-ch-ua-full-version-list':
    '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.133", "Google Chrome";v="114.0.5735.133"',
} as const

export default class InstagramAPI {
  viewerConfig: InstagramParsedViewerConfig

  private logger = getLogger('ig-api')

  constructor(private readonly papi: Instagram) {}

  authMethod: 'login-window' | 'extension' = 'login-window'

  jar: CookieJar

  ua: SerializedSession['ua'] = texts.constants.USER_AGENT

  clientId: SerializedSession['clientId']

  dtsg: SerializedSession['dtsg']

  fbid: SerializedSession['fbid']

  get cursor(): string {
    return this.cursorCache?.cursor
  }

  cursorCache: Awaited<ReturnType<typeof parseRawPayload>> = null

  private _axios: AxiosInstance

  get axios() {
    if (this._axios) return this._axios
    this._axios = axios.create({
      baseURL: 'https://www.instagram.com/',
      headers: {
        ...commonHeaders,
      },
      httpAgent: new HttpCookieAgent({ cookies: { jar: this.jar } }),
      httpsAgent: new HttpsCookieAgent({ cookies: { jar: this.jar } }),
    })

    this._axios.interceptors.request.use(
      async config => {
        config.headers.set('user-agent', this.ua)
        return config
      },
      error => Promise.reject(error),
    )

    return this._axios
  }

  async init() {
    const { clientId, dtsg, fbid, config } = await this.getClientId()
    this.clientId = clientId
    this.dtsg = dtsg
    this.fbid = fbid

    this.papi.currentUser = {
      id: config.id,
      fullName: config.full_name,
      imgURL: fixUrl(config.profile_pic_url_hd),
      username: config.username,
    }
    await this.getCursor()
  }

  async getClientId() {
    const response = await this.axios.get('https://www.instagram.com/direct/', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'cache-control': 'max-age=0',
        'sec-ch-ua':
          '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'viewport-width': '558',
      },
    })
    const resp = response.data
    const clientId = resp.slice(resp.indexOf('{"clientID":')).split('"')[3]
    const dtsg = resp.slice(resp.indexOf('DTSGInitialData')).split('"')[4]
    const fbid = resp.match(/"IG_USER_EIMU":"([^"]+)"/)?.[1] // fbid
    const sharedData = resp.match(/"XIGSharedData",\[\],({.*?})/s)[1]
    // @TODO: this is disgusting
    const config: InstagramParsedViewerConfig = JSON.parse(
      `${
        sharedData.split('"viewer\\":')[1].split(',\\"badge_count')[0]
      // eslint-disable-next-line no-useless-escape
      }}`.replace(/\\\"/g, '"'),
    )
    return { clientId, dtsg, fbid, config }
  }

  getCookies() {
    // @TODO:use our http client for requests
    return this.jar.getCookieStringSync(INSTAGRAM_BASE_URL)
  }

  // they have different gql endpoints will merge these later
  async getUserByUsername(username: string) {
    const response = await this.axios.get(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'sec-ch-prefers-color-scheme': 'dark',
          'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114"',
          'sec-ch-ua-full-version-list':
            '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-ch-ua-platform-version': '"13.5.0"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'viewport-width': '881',
          'x-asbd-id': '129477',
          'x-csrftoken': this.getCSRFToken(),
          'x-ig-app-id': '936619743392459',
          'x-ig-www-claim':
            'hmac.AR2iCvyZhuDG-oJQ0b4-4DlKN9a9bGK2Ovat6h04VbnVxuUU',
          'x-requested-with': 'XMLHttpRequest',
          Referer: `https://www.instagram.com/${username}/`,
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      },
    )
    // const json = JSON.parse(req.body)
    const data = await response.data
    const userInfo = data?.data?.user
    const user: User = {
      id: userInfo?.id,
      fullName: userInfo?.full_name,
      username: userInfo?.username,
    }
    this.logger.info(
      `getUserByUsername ${username} response: ${JSON.stringify(user, null, 2)}`,
    )
    return user
  }

  async apiCall<T extends {}>(doc_id: string, variables: T) {
    const response = await this.axios.post(
      'https://www.instagram.com/api/graphql/',
      `fb_dtsg=${this.dtsg}&variables=${JSON.stringify(variables)}&doc_id=${doc_id}`,
      {
        headers: {
          authority: 'www.instagram.com',
          'content-type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      },
    )
    // texts.log(
    //   `apiCall ${doc_id} response: ${JSON.stringify(response.data, null, 2)}`
    // );
    return response
  }

  // get username from here
  async getUserById(userID: string) {
    this.logger.info(`getUser ${userID}`)
    const response = await this.apiCall('6083412141754133', {
      userID,
    })
    this.logger.info(`getUser ${userID} response: ${JSON.stringify(response.data)}`)
    const data = response.data as {
      data: {
        userInfo: {
          user: {
            username: string
            show_ig_app_switcher_badge: boolean
            id: string
          }
        }
      }
      extensions: {
        is_final: boolean
      }
    }
    return {
      id: data?.data?.userInfo?.user?.id,
      username: data?.data?.userInfo?.user?.username,
      fullName: data?.data?.userInfo?.user?.username, // @TODO
    }
  }

  async getMe() {
    if (!this.viewerConfig) return
    const data = await this.getUserById(this.viewerConfig.id)
    const { username } = data
    if (!username) return
    const user = await this.getUserByUsername(username)
    return user
  }

  getCSRFToken() {
    return this.jar
      .getCookiesSync(INSTAGRAM_BASE_URL)
      .find(c => c.key === 'csrftoken')?.value
  }

  async getCursor() {
    const response = await this.apiCall('6195354443842040', {
      deviceId: this.clientId,
      requestId: 0,
      requestPayload: JSON.stringify({
        database: 1,
        epoch_id: 0,
        last_applied_cursor: this.cursor,
        sync_params: JSON.stringify({}),
        version: 9477666248971112,
      }),
      requestType: 1,
    })

    // @TODO:remove
    // const cursorResponse = parsePayload(
    //   this.fbid,
    //   response.data.data.lightspeed_web_request_for_igd.payload,
    // )

    // this.cursorCache = cursorResponse

    this.handlePayload(response.data.data.lightspeed_web_request_for_igd.payload)

    // const { newConversations, newMessages } = cursorResponse
    // const mappedNewConversations = newConversations?.map(mapThread)

    // const mappedNewMessages = newMessages?.map(message => this.mapMessage(message))
    // this.papi.onEvent?.([{
    //   type: ServerEventType.STATE_SYNC,
    //   objectName: 'thread',
    //   objectIDs: {},
    //   mutationType: 'upsert',
    //   entries: mappedNewConversations,
    // }])
    // for (const message of mappedNewMessages) {
    //   this.papi.onEvent?.([{
    //     type: ServerEventType.STATE_SYNC,
    //     objectName: 'message',
    //     objectIDs: { threadID: message.threadID },
    //     mutationType: 'upsert',
    //     entries: [message],
    //   }])
    // }
    // return cursorResponse
  }

  handlePayload(payload: any) {
    const rawd = parseRawPayload(payload)
    this.logger.info('rawd', rawd)
    if (rawd.deleteThenInsertThread) {
      // try {
      //   rawd.deleteThenInsertThread.forEach(t => schema.insertThreadSchema.parse(t))
      // } catch (err) {
      //   this.logger.error('handlePayload error', JSON.stringify(err, null, 2))
      //   return
      // }
      const threads = rawd.deleteThenInsertThread.map(t => ({
        ...t,
        threadKey: t.threadKey!,
      }))
      this.addThreads(threads)
    }
    if (rawd.verifyContactRowExists) this.addUsers(rawd.verifyContactRowExists)
    if (rawd.addParticipantIdToGroupThread) {
      const participants = rawd.addParticipantIdToGroupThread.map(p => ({
        ...p,
        threadKey: p.threadKey!,
        userId: p.userId!,
      }))
      this.addParticipants(participants)
    }
    if (rawd.upsertMessage) {
      const messages = rawd.upsertMessage.map(m => ({
        ...m,
        threadKey: m.threadKey!,
        messageId: m.messageId!,
        senderId: m.senderId!,
      }))
      this.addMessages(messages)
    }
    if (rawd.upsertReaction) {
      this.addReactions(rawd.upsertReaction)
    }
  }

  addThreads(threads: InferModel<typeof schema['threads'], 'insert'>[]) {
    this.logger.info('addThreads', threads)
    this.papi.onEvent?.([{
      type: ServerEventType.STATE_SYNC,
      objectName: 'thread',
      objectIDs: {},
      mutationType: 'upsert',
      entries: threads.map(mapThread as any), // @TODO remove any
    }])
    const threadsWithNoBool = threads.map(thread => {
      const newThread = { ...thread }
      for (const key in newThread) {
        if (typeof newThread[key] === 'boolean') {
          newThread[key] = newThread[key] ? 1 : 0
        }
      }
      return newThread
    })
    this.logger.info('addThreads (threadsWithNoBool)', threadsWithNoBool)

    return this.papi.db.insert(schema.threads).values(threadsWithNoBool).onConflictDoNothing().run()
  }

  addUsers(users: InferModel<typeof schema['users'], 'insert'>[]) {
    this.logger.info('addUsers', users)
    return this.papi.db.insert(schema.users).values(users).onConflictDoNothing().run()
  }

  addParticipants(participants: InferModel<typeof schema['participants'], 'insert'>[]) {
    this.logger.info('addParticipants', participants)
    return this.papi.db.insert(schema.participants).values(participants).onConflictDoNothing().run()
  }

  addMessages(messages: InferModel<typeof schema['messages'], 'insert'>[]) {
    this.logger.info('addMessages', messages)
    for (const message of messages) {
      this.papi.onEvent?.([{
        type: ServerEventType.STATE_SYNC,
        objectName: 'message',
        objectIDs: { threadID: message.threadKey },
        mutationType: 'upsert',
        entries: [message].map(mapMessage as any), // @TODO remove any
      }])
    }

    const messagesWithNoBool = messages.filter(m => m?.threadKey !== null).map(message => {
      const newMessage = { ...message }
      for (const key in newMessage) {
        if (typeof newMessage[key] === 'boolean') {
          newMessage[key] = newMessage[key] ? 1 : 0
        }
      }
      return newMessage
    })

    this.logger.info('addMessages (messagesWithNoBool)', messagesWithNoBool)

    return this.papi.db
      .insert(schema.messages)
      .values(messagesWithNoBool)
      .onConflictDoNothing()
      .run()
  }

  addReactions(reactions: InferModel<typeof schema['reactions'], 'insert'>[]) {
    this.logger.info('addReactions', reactions)
    return this.papi.db
      .insert(schema.reactions)
      .values(reactions)
      .onConflictDoNothing()
      .run()
  }

  mapMessage(message: any) {
    return mapMessage(this.fbid, message)
  }

  // private addThread(thread: InferModel<typeof schema['threads'], 'insert'>) {
  //   texts.log(`addThread ${thread.id} ${JSON.stringify(thread, null, 2)}`)
  //   const response = this.papi.db.insert(schema.threads).values(thread).run()
  //   texts.log(`addThread ${thread.id} response: ${JSON.stringify(response, null, 2)}`)
  // }

  // private upsertThread(thread: ExtendedIGThread) {
  //   const mapped = mapThread(thread)
  //   const threads = mapped.id ? this.papi.db.select({ id: schema.threads.id }).from(schema.threads).where(eq(schema.threads.id, mapped.id)).all() : []

  //   this.logger.info('upsertThread', { id: mapped.id || 'unknown id', mapped, threads })

  //   if (threads.length === 0) {
  //     return this.addThread({
  //       original: thread,
  //       _original_parsed: JSON.stringify(thread),
  //       title: mapped.title,
  //       id: mapped.id,
  //       type: mapped.type,
  //       mutedUntil: mapped.mutedUntil === 'forever' ? new Date(FOREVER) : mapped.mutedUntil,
  //     })
  //   }

  //   return this.papi.db.update(schema.threads).set({
  //     original: thread,
  //     _original_parsed: JSON.stringify(thread),
  //     title: mapped.title,
  //     id: mapped.id,
  //     type: mapped.type,
  //     mutedUntil: mapped.mutedUntil === 'forever' ? new Date(FOREVER) : mapped.mutedUntil,
  //   }).where(eq(schema.threads.id, mapped.id)).run()
  // }

  // upsertThreads(threads: ExtendedIGThread[]) {
  //   if (threads?.length < 1) return
  //   return threads.map(thread => this.upsertThread(thread))
  // }

  // private addMessage(threadID: string, message: InferModel<typeof schema['messages'], 'insert'>) {
  //   return this.papi.db.insert(schema.messages).values(message).run()
  // }

  // private addMessages(threadID: string, messages: InferModel<typeof schema['messages'], 'insert'>[]) {
  //   return messages.map(message => this.upsertMessage(threadID, {
  //     ...message,
  //     action: null,
  //   }))
  // }

  // private upsertMessage(threadID: string, message: Message) {
  //   const messages = message.id ? this.papi.db.select().from(schema.messages).where(eq(schema.messages.id, schema.messages.id)).all() : []
  //   if (messages.length === 0) {
  //     return this.papi.db.insert(schema.messages).values({
  //       original: message._original as any,
  //       id: message.id,
  //       senderID: message.senderID,
  //       text: message.text,
  //       timestamp: message.timestamp,
  //       isSender: message.isSender,
  //       threadID,
  //       seen: new Date(),
  //       action: null,
  //       sortKey: null,
  //     }).run()
  //   }

  //   return this.papi.db.update(schema.messages).set({
  //     threadID,
  //     seen: new Date(),
  //     action: null,
  //     sortKey: null,
  //     original: message._original as any,
  //     id: message.id,
  //     senderID: message.senderID,
  //     text: message.text,
  //     timestamp: message.timestamp,
  //     isSender: message.isSender,
  //   }).where(eq(schema.messages.id, message.id)).run()
  // }

  // upsertMessages(messages: Message[]) {
  //   return messages.map(message => this.upsertMessage(message.threadID, message))
  // }

  getLastMessage(threadKey: string) {
    return this.papi.db
      .select({
        threadKey: schema.messages.threadKey,
        messageId: schema.messages.messageId,
        timestampMs: schema.messages.timestampMs,
      })
      .from(schema.messages)
      .limit(1)
      .where(eq(schema.messages.threadKey, threadKey))
      .orderBy(desc(schema.messages.timestampMs))
      .get()
  }

  // private addParticipant(participant: InferModel<typeof schema['participants'], 'insert'>) {
  //   texts.log(`addParticipant ${participant.id} ${JSON.stringify(participant, null, 2)}`)
  //   this.papi.db.insert(schema.participants).values(participant).run()
  // }

  // private upsertParticipant(threadID: string, participant: Participant) {
  //   this.logger.info('upsertParticipant', { id: participant.id || 'unknown id', threadID, participant })
  //   if (!participant.id) return

  //   const participants = this.papi.db.select({ id: schema.participants.id })
  //     .from(schema.participants)
  //     .where(eq(schema.participants.id, participant.id))
  //     .where(eq(schema.participants.threadID, threadID))
  //     .all()

  //   if (participants.length === 0) {
  //     return this.addParticipant({
  //       original: participant,
  //       threadID,
  //       id: participant.id,
  //       username: participant.username,
  //       name: participant.fullName,
  //     })
  //   }

  //   return this.papi.db.update(schema.participants).set({
  //     original: participant,
  //     threadID,
  //     id: participant.id,
  //     username: participant.username,
  //     name: participant.fullName,
  //   }).where(eq(schema.participants.id, participant.id)).run()
  // }

  // upsertParticipants(threadID: string, participants: Participant[]) {
  //   if (participants?.length < 1) return
  //   return participants.map(participant => this.upsertParticipant(threadID, participant))
  // }

  private async uploadPhoto(filePath: string, fileName?: string) {
    const file = await readFile(filePath)
    const blob = new Blob([file], { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('farr', blob, fileName || 'image.jpg')
    const res = await this.axios.post('https://www.instagram.com/ajax/mercury/upload.php', formData, {
      params: {
        __a: '1',
        fb_dtsg: this.dtsg,
      },
      headers: {
        authority: 'www.instagram.com',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type':
          'multipart/form-data; boundary=----WebKitFormBoundaryK8furxKOo3188usO',
        cookie: this.getCookies(),
        origin: 'https://www.instagram.com',
        referer: 'https://www.instagram.com/direct/t/100428318021025/',
        'sec-ch-prefers-color-scheme': 'dark',
        'sec-ch-ua':
          '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-full-version-list':
          '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198", "Google Chrome";v="114.0.5735.198"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"13.4.1"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': this.ua,
        'viewport-width': '1280',
        'x-asbd-id': '129477',
        'x-fb-lsd': 'khvBZW0GBGHjqubNqNUMn2',
      },
    })

    const response = res.data
    const jsonStartIndex = response.indexOf('{')
    const jsonResponse = response.substring(jsonStartIndex)

    // Parse the JSON object
    const parsedData = JSON.parse(jsonResponse)
    return parsedData
  }

  async sendImage(threadID: string, { filePath, fileName }: { filePath: string, fileName: string }) {
    this.logger.info('sendImage about to call uploadPhoto')
    try {
      const res = await this.uploadPhoto(filePath, fileName)
      this.logger.info('sendImage', res)
      const imageId = res.payload.metadata[0].image_id
      this.papi.socket.sendImage(threadID, imageId)
    } catch (err) {
      this.logger.error('ig-api sendImage error', err)
    }
  }

  // private addThread(thread: InferModel<typeof schema['threads'], 'insert'>): Omit<Thread, 'messages' | 'participants'> {
  //   return this.papi.db.insert(schema.threads).values(thread).returning().get()
  // }

  // private upsertThread(thread: Thread) {
  //   const threads = thread.id ? this.papi.db.select({ id: schema.threads.id }).from(schema.threads).where(eq(schema.threads.id, thread.id)).all() : []
  //   if (threads.length === 0) {
  //     return this.addThread({
  //       ...thread,
  //       mutedUntil: thread.mutedUntil === 'forever' ? new Date(FOREVER) : thread.mutedUntil,
  //     })
  //   }

  //   return this.papi.db.update(schema.threads).set({
  //     ...thread,
  //     mutedUntil: thread.mutedUntil === 'forever' ? new Date(FOREVER) : thread.mutedUntil,
  //   }).where(eq(schema.threads.id, thread.id)).returning().get()
  // }

  // upsertThreads(threads: Thread[]) {
  //   return threads.map(thread => this.upsertThread(thread))
  // }

  // private addMessage(threadID: string, message: InferModel<typeof schema['messages'], 'insert'>) {
  //   return this.papi.db.insert(schema.messages).values({
  //     ...message,
  //     threadID,
  //   }).returning().get()
  // }

  // private addMessages(threadID: string, messages: InferModel<typeof schema['messages'], 'insert'>[]) {
  //   return messages.map(message => this.upsertMessage(threadID, {
  //     ...message,
  //     action: null,
  //   }))
  // }

  // private upsertMessage(threadID: string, message: Message) {
  //   const messages = message.id ? this.papi.db.select().from(schema.messages).where(eq(schema.messages.id, schema.messages.id)).all() : []
  //   if (messages.length === 0) {
  //     return this.addMessage(threadID, {
  //       ...message,
  //       threadID,
  //       seen: new Date(),
  //       action: null,
  //       sortKey: null,
  //     })
  //   }

  //   return this.papi.db.update(schema.messages).set({
  //     ...message,
  //     threadID,
  //     seen: new Date(),
  //     action: null,
  //     sortKey: null,
  //   }).where(eq(schema.messages.id, message.id)).returning().get()
  // }

  // upsertMessages(messages: Message[]) {
  //   return messages.map(message => this.upsertMessage(message.threadID, message))
  // }

  // getLastMessage(threadID: string): Message {
  //   const msg = this.papi.db.select({
  //     threadID: schema.messages.threadKey,
  //     id: schema.messages.messageId,
  //     timestamp: schema.messages.timestamp,
  //   }).from(schema.messages).limit(1).where(eq(schema.messages.thread, threadID)).orderBy(desc(schema.messages.timestampMs)).get()
  // }
}
