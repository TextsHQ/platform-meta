import fs from 'fs/promises'
import { CookieJar } from 'tough-cookie'
import FormData from 'form-data'
import {
  type FetchOptions,
  InboxName,
  type MessageSendOptions,
  ReAuthError,
  texts,
  type User,
} from '@textshq/platform-sdk'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { ExpectedJSONGotHTMLError } from '@textshq/platform-sdk/dist/json'
import { type QueryMessagesArgs, QueryThreadsArgs, QueryWhereSpecial } from './store/helpers'

import * as schema from './store/schema'
import { messages as messagesSchema, threads as threadsSchema } from './store/schema'
import { getLogger, Logger } from './logger'
import type Instagram from './api'
import type { IGAttachment, IGMessage, IGMessageRanges, SerializedSession } from './types'
import { MetaThreadRanges, ParentThreadKey, SyncGroup, ThreadFilter } from './types'
import { createPromise, parseMessageRanges, parseUnicodeEscapeSequences, timeoutOrPromise } from './util'
import { mapMessages, mapThread } from './mappers'
import { queryMessages, queryThreads } from './store/queries'
import { getMessengerConfig } from './parsers/messenger-config'
import MetaMessengerPayloadHandler from './payload-handler'
import EnvOptions, { type EnvKey } from './env'
import { MetaMessengerError } from './errors'

// @TODO: needs to be updated
export const SHARED_HEADERS = {
  'accept-language': 'en-US,en;q=0.9',
  'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114"',
  'sec-ch-ua-full-version-list': '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-ch-ua-platform-version': '"13.5.0"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'viewport-width': '1280',
  // te: 'trailers',
} as const

const fixUrl = (url: string) =>
  url && decodeURIComponent(url.replace(/\\u0026/g, '&'))

export default class MetaMessengerAPI {
  private _initPromise = createPromise<void>()

  initResolved = false

  get initPromise() {
    return this._initPromise.promise
  }

  private logger: Logger

  constructor(private readonly papi: Instagram, env: EnvKey) {
    this.logger = getLogger(env, 'mm-api')
    this.initPromise.then(() => {
      this.initResolved = true
    })
  }

  authMethod: 'login-window' | 'extension' = 'login-window'

  jar: CookieJar

  ua: SerializedSession['ua'] = texts.constants.USER_AGENT

  config: ReturnType<typeof getMessengerConfig>

  private readonly http = texts.createHttpClient()

  private async httpRequest(url: string, opts: FetchOptions) {
    const res = await this.http.requestAsString(url, {
      cookieJar: this.jar,
      ...opts,
      followRedirect: false,
      headers: {
        'user-agent': this.ua,
        authority: this.papi.envOpts.domain,
        'accept-language': 'en',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"13.2.1"',
        'sec-ch-ua':
          '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'sec-fetch-site': 'same-origin',
        'sec-ch-ua-full-version-list':
          '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.133", "Google Chrome";v="114.0.5735.133"',
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
      this.logger.warn(res.statusCode, url, res.body)
      throw new ExpectedJSONGotHTMLError(res.statusCode, res.body)
    }
    // check for redirect
    if (res.statusCode === 302 && res.headers.location) {
      this.logger.warn(res.statusCode, url, 'redirecting to', res.headers.location)
      throw new ReAuthError('Encountered a checkpoint')
      // const result = await texts.openBrowserWindow(this.papi.accountID, {
      //   url: res.headers.location,
      //   cookieJar: this.jar.toJSON(),
      //   userAgent: this.ua,
      //   runJSOnLaunch: CLOSE_ON_AUTHENTICATED_JS,
      //   runJSOnNavigate: CLOSE_ON_AUTHENTICATED_JS,
      // })
    }

    return {
      statusCode: res.statusCode,
      headers: res.headers,
      json: JSON.parse(res.body),
    }
  }

  async init(triggeredFrom: 'login' | 'init') {
    this.logger.debug(`init triggered from ${triggeredFrom}`)

    const { body } = await this.httpRequest(this.papi.envOpts.initialURL, {
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

    try {
      this.config = getMessengerConfig(body)
    } catch (e) {
      throw new Error('No valid configuration was detected. Login window may have been interrupted before it finished loading.')
    }

    this.papi.kv.setMany({
      'syncParams-1': JSON.stringify(this.config.syncParams),
      _fullConfig: JSON.stringify(this.config),
      appId: String(this.config.appId),
      clientId: this.config.clientID,
      fb_dtsg: this.config.fbDTSG,
      fbid: this.config.fbid,
      lsd: this.config.lsdToken,
      mqttCapabilities: String(this.config.mqttCapabilities),
      mqttClientCapabilities: String(this.config.mqttClientCapabilities),
    })

    this.papi.currentUser = {
      id: this.config.fbid,
      fullName: this.config.name,
    }

    if (this.papi.env === 'IG') {
      if (!this.config.igViewerConfig?.id) {
        throw new MetaMessengerError('IG', 0, 'failed to fetch igViewerConfig')
      }

      this.papi.kv.setMany({
        hasTabbedInbox: this.config.igViewerConfig.has_tabbed_inbox,
        igUserId: this.config.igViewerConfig.id,
      })

      // config.id, is the instagram id but fbid is instead used for chat
      this.papi.currentUser.fullName = this.config.igViewerConfig.full_name?.length > 0 ? parseUnicodeEscapeSequences(this.config.igViewerConfig.full_name) : null
      this.papi.currentUser.imgURL = this.config.igViewerConfig?.profile_pic_url_hd ? fixUrl(this.config.igViewerConfig.profile_pic_url_hd) : null
      this.papi.currentUser.username = this.config.igViewerConfig.username
    }

    for (const payload of this.config.initialPayloads) {
      await new MetaMessengerPayloadHandler(this.papi, payload, 'initial').__handle()
    }

    switch (this.papi.env) {
      case 'IG':
        await this.getSnapshotPayloadForIGD()
        break
      case 'MESSENGER':
      case 'FB':
        await this.getSnapshotPayloadForFB()
        break
      default:
        break
    }

    await this.papi.socket.connect()

    this._initPromise?.resolve()
  }

  getCookies() {
    return this.jar.getCookieStringSync(`https://${this.papi.envOpts.domain}/`)
  }

  // they have different gql endpoints will merge these later
  async getUserByUsername(username: string) {
    if (this.papi.env !== 'IG') throw new Error('getUserByUsername is only supported on IG')
    const { domain } = EnvOptions.IG
    const { json } = await this.httpJSONRequest(`https://${domain}/api/v1/users/web_profile_info/?` + new URLSearchParams({ username }).toString(), {
      // @TODO: refactor headers
      headers: {
        accept: '*/*',
        ...SHARED_HEADERS,
        'x-asbd-id': '129477',
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': this.papi.kv.get('appId'),
        'x-ig-www-claim': this.papi.kv.get('wwwClaim'),
        'x-requested-with': 'XMLHttpRequest',
        Referer: `https://${domain}/${username}/`,
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
    this.logger.debug(
      `getUserByUsername ${username} response: ${JSON.stringify(user, null, 2)}`,
    )
    return user
  }

  async graphqlCall<T extends {}>(doc_id: string, variables: T, { headers, bodyParams }: {
    headers?: Record<string, string>
    bodyParams?: Record<string, string>
  } = {
    headers: {},
    bodyParams: {},
  }) {
    const { json } = await this.httpJSONRequest(`https://${this.papi.envOpts.domain}/api/graphql/`, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/x-www-form-urlencoded',
      },
      // todo: maybe use FormData instead:
      body: new URLSearchParams({
        ...bodyParams,
        fb_dtsg: this.papi.kv.get('fb_dtsg'),
        variables: JSON.stringify(variables),
        doc_id,
      }).toString(),
    })
    // texts.log(`graphqlCall ${doc_id} response: ${JSON.stringify(json, null, 2)}`)
    return { data: json }
  }

  async logout() {
    const baseURL = `https://${this.papi.envOpts.domain}/`
    switch (this.papi.env) {
      case 'IG': {
        const { json } = await this.httpJSONRequest(`${baseURL}api/v1/web/accounts/logout/ajax/`, {
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
            Referer: baseURL,
            'x-instagram-ajax': '1007993177',
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
        if (json.status !== 'ok') {
          throw new Error(`logout ${this.papi.kv.get('igUserId')} failed: ${JSON.stringify(json, null, 2)}`)
        }
        break
      }
      case 'MESSENGER': {
        const response = await this.httpRequest(`${baseURL}logout/`, {
          method: 'POST',
          body: `fb_dtsg=${this.papi.kv.get('fb_dtsg')}&jazoest=25869`,
          headers: {
            accept: '*/*',
            ...SHARED_HEADERS,
            Referer: baseURL,
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
        if (response.statusCode !== 302) {
          throw new Error(`logout ${this.papi.kv.get('fbid')} failed: ${JSON.stringify(response.body, null, 2)}`)
        }
      }
        break
      default:
        throw new Error(`logout is not supported on ${this.papi.env}`)
    }
  }

  // get username from here
  async getUserById(userID: string) {
    this.logger.debug(`getUser ${userID}`)
    const response = await this.graphqlCall('6083412141754133', { userID })
    this.logger.debug(`getUser ${userID} response: ${JSON.stringify(response.data)}`)
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

  getCSRFToken() {
    return this.jar
      .getCookiesSync(`https://${this.papi.envOpts.domain}/`)
      .find(c => c.key === 'csrftoken')?.value
  }

  async getSnapshotPayloadForIGD() {
    if (this.papi.env !== 'IG') throw new Error(`getSnapshotPayloadForIGD is only supported on IG but called on ${this.papi.env}`)
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
    await new MetaMessengerPayloadHandler(this.papi, response.data.data.lightspeed_web_request_for_igd.payload, 'snapshot').__handle()
  }

  async getSnapshotPayloadForFB() {
    if (!(this.papi.env === 'FB' || this.papi.env === 'MESSENGER')) throw new Error(`getSnapshotPayloadForFB is only supported on FB/MESSENGER but called on ${this.papi.env}`)
    const response = await this.graphqlCall('7357432314358409', {
      deviceId: this.papi.kv.get('clientId'),
      includeChatVisibility: false,
      requestId: 2,
      requestPayload: JSON.stringify({
        database: 95,
        epoch_id: 0,
        last_applied_cursor: this.papi.kv.get('cursor-1-1'),
        sync_params: this.papi.kv.get('syncParams-1'),
        version: '6566200933472970',
      }),
      requestType: 1,
    })

    await new MetaMessengerPayloadHandler(this.papi, response.data.data.viewer.lightspeed_web_request.payload, 'snapshot').__handle()
  }

  async getIGReels(media_id: string, reel_ids: string, username: string) {
    const response = await this.httpJSONRequest(
      `https://www.instagram.com/api/v1/feed/reels_media/?media_id=${media_id}&reel_ids=${reel_ids}`,
      {
        headers: {
          'User-Agent': this.ua,
          Accept: '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'X-CSRFToken': this.getCSRFToken(),
          'X-IG-App-ID': this.papi.kv.get('appId'),
          'X-ASBD-ID': '129477',
          'X-IG-WWW-Claim': this.papi.kv.get('wwwClaim') || '0',
          'X-Requested-With': 'XMLHttpRequest',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          Referer: `https://www.instagram.com/stories/${username}/${media_id}`,
        },
      },
    )
    const data = response.json as {
      status: 'ok'
      reels?: {
        [reel_id: string]: {
          items?: {
            pk: string
            image_versions2?: {
              candidates: {
                url: string
                width: number
                height: number
              }[]
            }
            video_versions?: {
              url: string
              width: number
              height: number
            }[]
          }[]
        }
      }
    }
    if (data.status !== 'ok') {
      throw Error(`getIGReels ${media_id} ${reel_ids} ${username} failed: ${JSON.stringify(data, null, 2)}`)
    }
    const media = data.reels?.[reel_ids].items?.find(i => i.pk === media_id)
    const video = media?.video_versions?.[0]
    // const video = media?.video_versions?.find(v => v.width === 1080)
    if (video?.url) return { type: 'video', url: video.url }
    const image = media?.image_versions2?.candidates?.find(i => i.width === 1080)
    if (image?.url) return { type: 'image', url: image.url }

    throw Error(`getIGReels ${media_id} ${reel_ids} ${username} no matching media: ${JSON.stringify(data, null, 2)}`)
  }

  async setIGReelSeen({
    reelId,
    reelMediaId,
    reelMediaOwnerId,
    reelMediaTakenAt,
    viewSeenAt,
  }: {
    reelId: string
    reelMediaId: string
    reelMediaOwnerId: string
    reelMediaTakenAt: number
    viewSeenAt: number
  }) {
    if (this.papi.env !== 'IG') throw new Error(`setReelSeen is only supported on IG but called on ${this.papi.env}`)
    try {
      await this.graphqlCall('6704432082997469', {
        reelId,
        reelMediaId,
        reelMediaOwnerId,
        reelMediaTakenAt,
        viewSeenAt,
      }, {
        bodyParams: {
          fb_api_caller_class: 'RelayModern',
          fb_api_req_friendly_name: 'PolarisAPIReelSeenMutation',
          server_timestamps: 'true',
        },
      })
    } catch (e) {
      this.logger.error(e, {}, 'setReelSeen')
    }
  }

  setSyncGroupThreadsRange(p: MetaThreadRanges) {
    this.papi.kv.set(`threadsRanges-${p.syncGroup}-${p.parentThreadKey}`, JSON.stringify(p))
  }

  getSyncGroupThreadsRange(syncGroup: SyncGroup, parentThreadKey: ParentThreadKey) {
    const value = this.papi.kv.get(`threadsRanges-${syncGroup}-${parentThreadKey}`)
    return typeof value === 'string' ? JSON.parse(value) as MetaThreadRanges : null
  }

  computeSyncGroups(inbox: InboxName) {
    const generalEnabled = (
      (this.papi.env === 'IG' && this.papi.kv.get('hasTabbedInbox'))
      || this.papi.env === 'FB'
      || this.papi.env === 'MESSENGER'
    )

    const { supportsArchive } = this.papi.envOpts
    const syncGroups: [SyncGroup, ParentThreadKey][] = []

    if (inbox === 'requests') {
      syncGroups.push(
        generalEnabled && [SyncGroup.MAIN, ParentThreadKey.GENERAL],
        generalEnabled && [SyncGroup.UNKNOWN, ParentThreadKey.GENERAL],
        [SyncGroup.MAIN, ParentThreadKey.SPAM],
        [SyncGroup.UNKNOWN, ParentThreadKey.SPAM],
      )
    } else {
      syncGroups.push(
        [SyncGroup.MAIN, ParentThreadKey.PRIMARY],
        [SyncGroup.UNKNOWN, ParentThreadKey.PRIMARY],
        supportsArchive ? [SyncGroup.MAIN, ParentThreadKey.ARCHIVE] : undefined,
        supportsArchive ? [SyncGroup.UNKNOWN, ParentThreadKey.ARCHIVE] : undefined,
      )
    }

    return syncGroups.filter(Boolean)
  }

  computeServerHasMoreThreads(inbox: InboxName) {
    const syncGroups = this.computeSyncGroups(inbox)
    return syncGroups.some(([syncGroup, parentThreadKey]) => {
      const value = this.getSyncGroupThreadsRange(syncGroup, parentThreadKey)
      return typeof value?.hasMoreBefore === 'boolean' ? value.hasMoreBefore : true
    })
  }

  async fetchMoreThreadsForIG(isSpam: boolean, isInitial: boolean) {
    if (this.papi.env !== 'IG') throw new Error(`fetchMoreThreadsForIG is only supported on IG but called on ${this.papi.env}`)
    const canFetchMore = this.computeServerHasMoreThreads(isSpam ? InboxName.REQUESTS : InboxName.NORMAL)
    if (!canFetchMore) return { fetched: false } as const
    const getFetcher = () => {
      if (isSpam) return this.papi.socket.fetchSpamThreads()
      if (isInitial) return this.papi.socket.fetchInitialThreadsForIG()
      if (this.papi.kv.get('hasTabbedInbox')) {
        return Promise.all([
          this.papi.socket.fetchMoreInboxThreads(ThreadFilter.PRIMARY),
          this.papi.socket.fetchMoreInboxThreads(ThreadFilter.GENERAL),
        ])
      }
      return this.papi.socket.fetchMoreThreads(ParentThreadKey.PRIMARY)
    }

    try {
      await timeoutOrPromise<unknown>(getFetcher())
    } catch (err) {
      this.logger.error(err)
    }
    return { fetched: true } as const
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
    const {
      domain,
      initialURL,
    } = this.papi.envOpts
    const file = await fs.readFile(filePath)
    const formData = new FormData()
    formData.append('farr', file, { filename: fileName })
    const res = await this.httpRequest(`https://${domain}/ajax/mercury/upload.php?` + new URLSearchParams({
      __a: '1',
      fb_dtsg: this.papi.kv.get('fb_dtsg'),
    }).toString(), {
      method: 'POST',
      body: formData,
      // todo: refactor headers
      headers: {
        authority: domain,
        accept: '*/*',
        'accept-language': 'en',
        origin: `https://${domain}`,
        referer: `${initialURL}t/${threadID}/`,
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

  async sendMedia(threadID: string, opts: MessageSendOptions, {
    filePath,
    fileName,
  }: { filePath: string, fileName: string }) {
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
    if (this.papi.env !== 'IG') throw new Error('webPushRegister is only supported on IG')
    const { domain } = EnvOptions.IG
    const formData = new FormData()
    formData.append('device_token', endpoint)
    formData.append('device_type', 'web_vapid')
    formData.append('mid', crypto.randomUUID()) // should be something that looks like "ZNboAAAEAAGBNvdmibKpso5huLi9"
    formData.append('subscription_keys', JSON.stringify({
      auth,
      p256dh,
    }))
    const { json } = await this.httpJSONRequest(`https://${domain}/api/v1/web/push/register/`, {
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
        Referer: `https://${this.papi.envOpts.domain}/`,
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
      orderBy = order(schema.threads.lastActivityTimestampMs)
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

    const threads = (await queryThreads(this.papi.db, args)).map(t => mapThread(t, this.papi.env, this.papi.kv.get('fbid'), parseMessageRanges(t.ranges)))

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

    return mapMessages(await queryMessages(this.papi.db, args), this.papi.env, this.papi.kv.get('fbid'))
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

  async upsertAttachment(a: IGAttachment) {
    const {
      threadKey,
      messageId,
      attachmentFbid,
      timestampMs,
      offlineAttachmentId,
      ...attachment
    } = a

    const current = await this.papi.db.query.attachments.findFirst({
      columns: {
        attachment: true,
      },
      where: and(
        eq(schema.attachments.threadKey, threadKey),
        eq(schema.attachments.messageId, messageId),
        eq(schema.attachments.attachmentFbid, attachmentFbid),
      ),
    })

    const aMapped = {
      threadKey,
      messageId,
      attachmentFbid,
      timestampMs: new Date(timestampMs),
      offlineAttachmentId,
      attachment: JSON.stringify({
        ...(current?.attachment ? JSON.parse(current.attachment) : {}),
        ...attachment,
      }),
    }

    this.papi.db.insert(schema.attachments).values(aMapped).onConflictDoUpdate({
      target: [schema.attachments.threadKey, schema.attachments.messageId, schema.attachments.attachmentFbid],
      set: { ...aMapped },
    }).run()

    return aMapped
  }

  upsertMessage(m: IGMessage) {
    const {
      threadKey,
      messageId,
      offlineThreadingId,
      timestampMs,
      senderId,
      primarySortKey,
      ...message
    } = m
    const _m = {
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
