import fs from 'fs/promises'
import { CookieJar } from 'tough-cookie'
import FormData from 'form-data'
import { type FetchOptions, type MessageSendOptions, texts, type User } from '@textshq/platform-sdk'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { ExpectedJSONGotHTMLError } from '@textshq/platform-sdk/dist/json'
import { type QueryMessagesArgs, QueryThreadsArgs, QueryWhereSpecial } from './store/helpers'

import * as schema from './store/schema'
import { messages as messagesSchema, threads as threadsSchema } from './store/schema'
import { getLogger } from './logger'
import { INSTAGRAM_BASE_URL, SHARED_HEADERS } from './constants'
import type Instagram from './api'
import type { SerializedSession } from './types'
import type { IGAttachment, IGMessage, IGMessageRanges } from './ig-types'
import { IGThreadRanges, ParentThreadKey, SyncGroup } from './ig-types'
import { createPromise, parseMessageRanges, parseUnicodeEscapeSequences } from './util'
import { mapMessages, mapThread } from './mappers'
import { queryMessages, queryThreads } from './store/queries'
import { getMessengerConfig } from './parsers/messenger-config'
import InstagramPayloadHandler from './ig-payload-handler'

const fixUrl = (url: string) =>
  url && decodeURIComponent(url.replace(/\\u0026/g, '&'))

const commonHeaders = {
  authority: 'www.instagram.com',
  'accept-language': 'en',
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
  private _initPromise = createPromise<void>()

  get initPromise() {
    return this._initPromise.promise
  }

  private logger = getLogger('ig-api')

  constructor(private readonly papi: Instagram) {}

  authMethod: 'login-window' | 'extension' = 'login-window'

  jar: CookieJar

  ua: SerializedSession['ua'] = texts.constants.USER_AGENT

  private readonly http = texts.createHttpClient()

  private async httpRequest(url: string, opts: FetchOptions) {
    const res = await this.http.requestAsString(url, {
      cookieJar: this.jar,
      ...opts,
      headers: {
        'user-agent': this.ua,
        ...commonHeaders,
        ...opts.headers,
      },
    })
    const wwwClaim = res.headers['x-ig-set-www-claim']
    if (wwwClaim) this.papi.kv.set('wwwClaim', String(wwwClaim))
    return res
  }

  private async httpJSONRequest(url: string, opts: FetchOptions) {
    const res = await this.httpRequest(url, opts)
    if (res.body[0] === '<') {
      console.log(res.statusCode, url, res.body)
      throw new ExpectedJSONGotHTMLError(res.statusCode, res.body)
    }
    return { statusCode: res.statusCode, headers: res.headers, json: JSON.parse(res.body) }
  }

  async init(triggeredFrom: 'login' | 'init') {
    this.logger.debug(`init triggered from ${triggeredFrom}`)
    const { body } = await this.httpRequest(INSTAGRAM_BASE_URL + 'direct/', {
      // todo: refactor headers
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
        'viewport-width': '1280',
      },
    })
    // @TODO: there is an initial payload that needs to be parsed in body
    const config = getMessengerConfig(body)

    this.papi.kv.setMany({
      'syncParams-1': JSON.stringify(config.syncParams),
      _fullConfig: JSON.stringify(config),
      appId: String(config.appId),
      clientId: config.clientID,
      fb_dtsg: config.fbDTSG,
      fbid: config.fbid,
      hasTabbedInbox: config.igViewerConfig.has_tabbed_inbox,
      igUserId: config.igViewerConfig.id,
      lsd: config.lsdToken,
      mqttCapabilities: String(config.mqttCapabilities),
      mqttClientCapabilities: String(config.mqttClientCapabilities),
    })

    this.papi.currentUser = {
      // id: config.id, // this is the instagram id but fbid is instead used for chat
      id: config.fbid,
      fullName: config.igViewerConfig.full_name?.length > 0 && parseUnicodeEscapeSequences(config.igViewerConfig.full_name),
      imgURL: fixUrl(config.igViewerConfig.profile_pic_url_hd),
      username: config.igViewerConfig.username,
    }
    await this.getInitialPayload()
  }

  getCookies() {
    return this.jar.getCookieStringSync(INSTAGRAM_BASE_URL)
  }

  // they have different gql endpoints will merge these later
  async getUserByUsername(username: string) {
    const { json } = await this.httpJSONRequest(INSTAGRAM_BASE_URL + 'api/v1/users/web_profile_info/?' + new URLSearchParams({ username }).toString(), {
      // @TODO: refactor headers
      headers: {
        accept: '*/*',
        ...SHARED_HEADERS,
        'x-asbd-id': '129477',
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': this.papi.kv.get('appId'),
        'x-ig-www-claim': this.papi.kv.get('wwwClaim'),
        'x-requested-with': 'XMLHttpRequest',
        Referer: `${INSTAGRAM_BASE_URL}${username}/`,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
    const data = await json.data
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

  async graphqlCall<T extends {}>(doc_id: string, variables: T) {
    const { json } = await this.httpJSONRequest(INSTAGRAM_BASE_URL + 'api/graphql/', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      // todo: maybe use FormData instead:
      body: new URLSearchParams({ fb_dtsg: this.papi.kv.get('fb_dtsg'), variables: JSON.stringify(variables), doc_id }).toString(),
    })
    // texts.log(`graphqlCall ${doc_id} response: ${JSON.stringify(json, null, 2)}`)
    return { data: json }
  }

  async logout() {
    const { json } = await this.httpJSONRequest(INSTAGRAM_BASE_URL + 'api/v1/web/accounts/logout/ajax/', {
      // todo: refactor headers
      method: 'POST',
      body: `one_tap_app_login=1&user_id=${this.papi.kv.get('igUserId')}`,
      headers: {
        accept: '*/*',
        ...SHARED_HEADERS,
        'x-asbd-id': '129477',
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': this.papi.kv.get('appId'),
        'x-ig-www-claim': this.papi.kv.get('wwwClaim'),
        'x-requested-with': 'XMLHttpRequest',
        Referer: INSTAGRAM_BASE_URL,
        'x-instagram-ajax': '1007993177',
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
    if (json.status !== 'ok') {
      throw new Error(`logout ${this.papi.kv.get('igUserId')} failed: ${JSON.stringify(json, null, 2)}`)
    }
  }

  // get username from here
  async getUserById(userID: string) {
    this.logger.info(`getUser ${userID}`)
    const response = await this.graphqlCall('6083412141754133', { userID })
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

  // async getMe() {
  //   if (!this.viewerConfig) return
  //   const data = await this.getUserById(this.viewerConfig.id)
  //   const { username } = data
  //   if (!username) return
  //   const user = await this.getUserByUsername(username)
  //   return user
  // }

  getCSRFToken() {
    return this.jar
      .getCookiesSync(INSTAGRAM_BASE_URL)
      .find(c => c.key === 'csrftoken')?.value
  }

  async getInitialPayload() {
    const response = await this.graphqlCall('6195354443842040', {
      deviceId: this.papi.kv.get('clientId'),
      requestId: 0,
      requestPayload: JSON.stringify({
        database: 1,
        epoch_id: 0,
        last_applied_cursor: this.papi.kv.get('cursor-1-1'),
        sync_params: JSON.stringify({}),
        version: 9477666248971112,
      }),
      requestType: 1,
    })
    await new InstagramPayloadHandler(this.papi, response.data.data.lightspeed_web_request_for_igd.payload, 'initial').handle()
    this._initPromise?.resolve()
    await this.papi.socket.connect()
  }

  setSyncGroupThreadsRange(p: IGThreadRanges) {
    this.papi.kv.set(`threadsRanges-${p.syncGroup}-${p.parentThreadKey}`, JSON.stringify(p))
  }

  getSyncGroupThreadsRange(syncGroup: SyncGroup, parentThreadKey: ParentThreadKey) {
    const value = this.papi.kv.get(`threadsRanges-${syncGroup}-${parentThreadKey}`)
    return value ? JSON.parse(value) as IGThreadRanges : null
  }

  computeHasMoreThreads() {
    const primary = this.getSyncGroupThreadsRange(SyncGroup.MAIN, ParentThreadKey.PRIMARY)

    let hasMore = primary.hasMoreBefore

    if (this.papi.kv.get('hasTabbedInbox')) {
      const general = this.getSyncGroupThreadsRange(SyncGroup.MAIN, ParentThreadKey.GENERAL)
      hasMore = hasMore || general.hasMoreBefore
    }

    return hasMore
  }

  computeHasMoreSpamThreads() {
    const values = this.getSyncGroupThreadsRange(SyncGroup.MAIN, ParentThreadKey.SPAM)
    return values?.hasMoreBefore || true
  }

  getContact(contactId: string) {
    const contact = this.papi.preparedQueries.getContact.get({ contactId })
    if (contact?.id) return contact
    this.papi.pQueue.addPromise(this.papi.socket.requestContacts([contactId]).then(() => {}))
    return null
  }

  getContacts(contactIds: string[]) {
    return this.papi.db.query.contacts.findMany({
      columns: {
        id: true,
        profilePictureUrl: true,
        name: true,
        username: true,
        contact: true,
      },
      where: inArray(schema.contacts.id, contactIds),
    })
  }

  async fetchContactsIfNotExist(contactIds: string[]) {
    this.logger.debug(`fetchContactsIfNotExist called with ${contactIds.length} contacts`, contactIds)
    if (contactIds.length === 0) return

    const existing = (await this.papi.db.query.contacts.findMany({
      columns: {
        id: true,
      },
      where: inArray(schema.contacts.id, contactIds),
    })).map(c => c.id)

    const missing = contactIds.filter(id => !existing.includes(id))
    if (missing.length > 0) {
      this.papi.pQueue.addPromise(this.papi.socket.requestContacts(missing).then(() => {}))
    }
  }

  private async uploadFile(threadID: string, filePath: string, fileName?: string) {
    const file = await fs.readFile(filePath)
    const formData = new FormData()
    formData.append('farr', file, { filename: fileName })
    const res = await this.httpRequest(INSTAGRAM_BASE_URL + 'ajax/mercury/upload.php?' + new URLSearchParams({
      __a: '1',
      fb_dtsg: this.papi.kv.get('fb_dtsg'),
    }).toString(), {
      method: 'POST',
      body: formData,
      // todo: refactor headers
      headers: {
        authority: 'www.instagram.com',
        accept: '*/*',
        'accept-language': 'en',
        origin: 'https://www.instagram.com',
        referer: `${INSTAGRAM_BASE_URL}direct/t/${threadID}/`,
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-ch-ua-full-version-list': '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198", "Google Chrome";v="114.0.5735.198"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"13.4.1"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'viewport-width': '1280',
        'x-asbd-id': '129477',
        'x-fb-lsd': this.papi.kv.get('lsd'),
      },
    })

    const response = res.body
    const jsonStartIndex = response.indexOf('{')
    const jsonResponse = response.substring(jsonStartIndex)
    return JSON.parse(jsonResponse)
  }

  async sendMedia(threadID: string, opts: MessageSendOptions, { filePath, fileName }: { filePath: string, fileName: string }) {
    this.logger.debug('sendMedia about to call uploadFile')
    const res = await this.uploadFile(threadID, filePath, fileName)
    const metadata = res.payload.metadata[0] as {
      image_id?: string
      video_id?: string
      gif_id?: string
    }
    this.logger.debug('sendMedia', res, metadata)
    return this.papi.socket.sendMessage(threadID, {}, opts, [metadata.image_id || metadata.video_id || metadata.gif_id])
  }

  async webPushRegister(endpoint: string, p256dh: string, auth: string) {
    const formData = new FormData()
    formData.append('device_token', endpoint)
    formData.append('device_type', 'web_vapid')
    formData.append('mid', crypto.randomUUID()) // should be someting that looks like "ZNboAAAEAAGBNvdmibKpso5huLi9"
    formData.append('subscription_keys', JSON.stringify({ auth, p256dh }))
    const { json } = await this.httpJSONRequest(INSTAGRAM_BASE_URL + 'api/v1/web/push/register/', {
      method: 'POST',
      body: formData,
      // todo: refactor headers
      headers: {
        accept: '*/*',
        ...SHARED_HEADERS,
        'x-asbd-id': '129477',
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': this.papi.kv.get('appId'),
        'x-ig-www-claim': this.papi.kv.get('wwwClaim'),
        'x-requested-with': 'XMLHttpRequest',
        Referer: INSTAGRAM_BASE_URL,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
    if (json.status !== 'ok') {
      throw new Error(`webPushRegister failed: ${JSON.stringify(json, null, 2)}`)
    }
  }

  async queryThreads(threadIdsOrWhere: string[] | QueryWhereSpecial | QueryThreadsArgs['where'], extraArgs: Partial<Pick<QueryThreadsArgs, 'orderBy' | 'limit'>> = {}) {
    let orderBy: QueryThreadsArgs['orderBy']
    let limit: number
    let where: QueryThreadsArgs['where']
    if (threadIdsOrWhere === QueryWhereSpecial.ALL) {
      // where = eq(threadsSchema.threadKey, threadKey)
    } else if (
      threadIdsOrWhere === QueryWhereSpecial.NEWEST
      || threadIdsOrWhere === QueryWhereSpecial.OLDEST
    ) {
      limit = 1
      const order = threadIdsOrWhere === QueryWhereSpecial.NEWEST ? desc : asc
      orderBy = order(schema.messages.timestampMs)
    } else if (Array.isArray(threadIdsOrWhere)) {
      where = inArray(threadsSchema.threadKey, threadIdsOrWhere)
      if (threadIdsOrWhere.length === 1) limit = 1
    } else {
      where = threadIdsOrWhere
    }

    const args = {
      where,
      ...extraArgs,
    }

    if (limit) args.limit = limit
    if (orderBy) args.orderBy = orderBy

    const threads = (await queryThreads(this.papi.db, args)).map(t => mapThread(t, this.papi.kv.get('fbid'), parseMessageRanges(t.ranges)))

    const participantIDs = threads.flatMap(t => t.participants.items.map(p => p.id))
    await this.fetchContactsIfNotExist(participantIDs)
    return threads
  }

  async queryMessages(threadKey: string, messageIdsOrWhere: string[] | QueryWhereSpecial | QueryMessagesArgs['where'], extraArgs: Partial<Pick<QueryMessagesArgs, 'orderBy' | 'limit'>> = {}) {
    let orderBy: QueryMessagesArgs['orderBy']
    let limit: number
    let where: QueryMessagesArgs['where']
    if (messageIdsOrWhere === QueryWhereSpecial.ALL) {
      where = eq(messagesSchema.threadKey, threadKey)
    } else if (
      messageIdsOrWhere === QueryWhereSpecial.NEWEST
      || messageIdsOrWhere === QueryWhereSpecial.OLDEST
    ) {
      where = eq(messagesSchema.threadKey, threadKey)
      limit = 1
      const order = messageIdsOrWhere === QueryWhereSpecial.NEWEST ? desc : asc
      orderBy = order(schema.messages.timestampMs)
    } else if (Array.isArray(messageIdsOrWhere)) {
      where = inArray(messagesSchema.messageId, messageIdsOrWhere)
      if (messageIdsOrWhere.length === 1) limit = 1
    } else {
      where = messageIdsOrWhere
    }

    const args = {
      where,
      ...extraArgs,
    }

    if (limit) args.limit = limit
    if (orderBy) args.orderBy = orderBy

    return mapMessages(await queryMessages(this.papi.db, args), this.papi.kv.get('fbid'))
  }

  async getMessageRanges(threadKey: string, _ranges?: string) {
    const thread = _ranges ? { ranges: _ranges } : await this.papi.db.query.threads.findFirst({
      where: eq(schema.threads.threadKey, threadKey),
      columns: { ranges: true },
    })
    if (!thread?.ranges) return
    return parseMessageRanges(thread.ranges)
  }

  async setMessageRanges(r: IGMessageRanges) {
    const ranges = {
      ...await this.getMessageRanges(r.threadKey!),
      ...r,
      // raw: undefined,
    }

    this.papi.db.update(schema.threads).set({
      ranges: JSON.stringify(ranges),
    }).where(eq(schema.threads.threadKey, r.threadKey)).run()
  }

  async resolveMessageRanges(r: IGMessageRanges) {
    const resolverKey = `messageRanges-${r.threadKey}` as const
    const promiseEntries = this.papi.socket.messageRangesResolver.get(resolverKey) || []
    promiseEntries.forEach(p => {
      p.resolve(r)
    })
  }

  upsertAttachment(a: IGAttachment) {
    const { raw, threadKey, messageId, attachmentFbid, timestampMs, offlineAttachmentId, ...attachment } = a

    const aMapped = {
      raw,
      threadKey,
      messageId,
      attachmentFbid,
      timestampMs: new Date(timestampMs),
      offlineAttachmentId,
      attachment: JSON.stringify(attachment),
    }

    this.papi.db.insert(schema.attachments).values(aMapped).onConflictDoUpdate({
      target: [schema.attachments.threadKey, schema.attachments.messageId, schema.attachments.attachmentFbid],
      set: { ...aMapped },
    }).run()

    return aMapped
  }

  upsertMessage(m: IGMessage) {
    const { raw, threadKey, messageId, offlineThreadingId, timestampMs, senderId, primarySortKey, ...message } = m
    const _m = {
      raw,
      threadKey,
      messageId,
      offlineThreadingId,
      primarySortKey,
      timestampMs: new Date(timestampMs),
      senderId,
      message: JSON.stringify(message),
    }

    this.papi.db.insert(schema.messages).values(_m).onConflictDoUpdate({
      target: schema.messages.messageId,
      set: { ..._m },
    }).run()

    return m
  }
}
