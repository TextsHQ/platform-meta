import fs from 'fs/promises'
import crypto from 'crypto'
import { CookieJar } from 'tough-cookie'
import FormData from 'form-data'
import {
  texts,
  InboxName,
  ReAuthError,
  type FetchOptions,
  type MessageContent,
  type MessageSendOptions,
  type User,
  type FetchResponse,
} from '@textshq/platform-sdk'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { ExpectedJSONGotHTMLError } from '@textshq/platform-sdk/dist/json'
import path from 'path'
import os from 'os'
import { type QueryMessagesArgs, QueryThreadsArgs, QueryWhereSpecial } from './store/helpers'
import * as schema from './store/schema'
import { messages as messagesSchema, threads as threadsSchema } from './store/schema'
import { getLogger, Logger } from './logger'
import type Instagram from './api'
import type { IGAttachment, IGMessage, IGMessageRanges, SerializedSession, MetaThreadRanges, MMSocketTask } from './types'
import { SocketRequestResolverType, MNetRankType, ParentThreadKey, SyncChannel, SendType } from './types'
import {
  AutoIncrementStore,
  createPromise,
  genClientContext,
  getTimeValues,
  parseMessageRanges,
  parseUnicodeEscapeSequences,
} from './util'
import { mapUserMentions, mapMessages, mapThread } from './mappers'
import { queryMessages, queryThreads } from './store/queries'
import { getMessengerConfig } from './config-parser'
import MetaMessengerPayloadHandler, { MetaMessengerPayloadHandlerResponse } from './payload-handler'
import EnvOptions, { PolarisBDHeaderConfig, type EnvKey } from './env'
import { MetaMessengerError } from './errors'
import { ThreadRemoveType } from './socket'
import { PromiseStore } from './PromiseStore'
import { NEVER_SYNC_TIMESTAMP } from './constants'
import * as lsMappers from './ls-sp-mappers'
import { PaginationQueue } from './PaginationQueue'

// @TODO: needs to be updated
export const SHARED_HEADERS = {
  'accept-language': 'en',
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

  private initResolved = false

  get initPromise() {
    return this._initPromise.promise
  }

  private logger: Logger

  constructor(private readonly papi: Instagram, env: EnvKey) {
    this.logger = getLogger(env, 'mm-api')
    this.initPromise.then(() => {
      this.initResolved = true
    })
    this.messageRangeResolvers = new PromiseStore(15_000, new AutoIncrementStore(1))
    this.sendMessageResolvers = new PromiseStore(15_000, new AutoIncrementStore(1))
  }

  authMethod: 'login-window' | 'extension' = 'login-window'

  jar: CookieJar

  ua: SerializedSession['ua'] = texts.constants.USER_AGENT

  config: ReturnType<typeof getMessengerConfig>

  messageRangeResolvers: PromiseStore<IGMessageRanges>

  sendMessageResolvers: PromiseStore<MetaMessengerPayloadHandlerResponse>

  paginationQueue = new PaginationQueue()

  private readonly http = texts.createHttpClient()

  private async httpRequest(url: string, opts: FetchOptions) {
    const res = await this.http.requestAsString(url, {
      cookieJar: this.jar,
      followRedirect: false,
      ...opts,
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
    const FOR_LOOP_PREFIX = 'for (;;);'
    const json = res.body.startsWith(FOR_LOOP_PREFIX)
      ? res.body.slice(FOR_LOOP_PREFIX.length)
      : res.body
    return {
      statusCode: res.statusCode,
      headers: res.headers,
      json: JSON.parse(json),
    }
  }

  async init(triggeredFrom: 'login' | 'init') {
    this.logger.debug(`init triggered from ${triggeredFrom}`)

    let response: FetchResponse<string>
    try {
      response = await this.httpRequest(this.papi.envOpts.initialURL, {
        followRedirect: true,
        // todo: refactor headers
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          // 'cache-control': 'max-age=0',
          'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'viewport-width': '1280',
        },
      })
      this.config = getMessengerConfig(response.body)
    } catch (err) {
      console.error('fetching initialURL failed', response?.statusCode, response?.headers, err)
      if (texts.isLoggingEnabled) {
        await fs.writeFile(path.join(os.homedir(), `Desktop/texts-debug-meta-login-error-${Date.now()}.json`), JSON.stringify({
          triggeredFrom,
          ua: this.ua,
          authMethod: this.authMethod,
          err: err?.toString?.(),
          response,
        }, null, 2))
      }
      if (err instanceof ReAuthError) throw err
      texts.Sentry.captureException(err)
      throw new Error(`No valid configuration was detected: ${err.message}`)
    }

    this.papi.currentUser = {
      id: this.config.fbid,
      fullName: this.config.name,
    }

    if (this.papi.env === 'IG') {
      if (!this.config.polarisViewer.data?.id) {
        throw new MetaMessengerError('IG', 0, 'failed to fetch igViewerConfig')
      }

      // config.id, is the instagram id but fbid is instead used for chat
      this.papi.currentUser.fullName = this.config.polarisViewer.data?.full_name?.length > 0 ? parseUnicodeEscapeSequences(this.config.polarisViewer.data.full_name) : null
      this.papi.currentUser.imgURL = this.config.polarisViewer.data?.profile_pic_url_hd ? fixUrl(this.config.polarisViewer.data.profile_pic_url_hd) : null
      this.papi.currentUser.username = this.config.polarisViewer.data?.username
    }

    for (const payload of this.config.initialPayloads) {
      const handler = new MetaMessengerPayloadHandler(this.papi, payload, 'initial')
      await handler.__handle()
      if (!this.config.syncData.needSync && handler.__responses.executeFirstBlockForSyncTransaction?.length > 0) {
        this.papi.syncManager?.syncTransaction(handler.__responses.executeFirstBlockForSyncTransaction[0])
      }
    }

    await this.envSwitch(() => this.getSnapshotPayloadForIGD(), () => this.getSnapshotPayloadForFB())()

    await this.papi.socket.connect()

    this._initPromise?.resolve()
  }

  getCookies() {
    return this.jar.getCookieStringSync(`https://${this.papi.envOpts.domain}/`)
  }

  envSwitch = <T>(valueForInstagram: T, valueForFacebookOrMessenger: T, defaultValue?: T) => {
    if (this.papi.env === 'IG') return valueForInstagram
    if (this.papi.envOpts.isFacebook) return valueForFacebookOrMessenger
    if (defaultValue) return defaultValue
    throw new Error('Invalid environment')
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
        'x-asbd-id': PolarisBDHeaderConfig.ASBD_ID,
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': this.config.appId,
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

  private getGraphqlPayload(variables: {}, doc_id: string, fb_api_req_friendly_name?: string, _extraParams?: Record<string, string>) {
    const extraParams = _extraParams ?? {}

    if (doc_id?.length) extraParams.doc_id = doc_id

    if (fb_api_req_friendly_name?.length) {
      extraParams.fb_api_req_friendly_name = fb_api_req_friendly_name
      extraParams.fb_api_caller_class = 'RelayModern'
    }

    if (variables && Object.keys(variables).length > 0) {
      extraParams.variables = JSON.stringify(variables)
    }

    const body = new URLSearchParams({
      ...extraParams,
      av: this.config.eqmc.user,
      fb_dtsg: this.config.fb_dtsg,
      lsd: this.config.lsdToken,
      jazoest: this.config.eqmc.jazoest,
      dpr: this.config.siteData?.pr?.toString(),
      server_timestamps: 'true',
      __rev: this.config.siteData?.client_revision?.toString(),
      __user: this.config.eqmc.user,
      __req: this.papi.socket.requestIds.gen().toString(),
      __a: this.config.eqmc.a,
      __hs: this.config.siteData.haste_session,
      __hsi: this.config.siteData.hsi,
      __s: this.config.webSessionId,
      __spin_r: this.config.siteData?.__spin_r?.toString(),
      __spin_b: this.config.siteData?.__spin_b,
      __spin_t: this.config.siteData?.__spin_t?.toString(),
      __dyn: this.config.bitmaps.bitmap.toCompressedString(),
      __csr: this.config.bitmaps.csrBitmap.toCompressedString(),
      __comet_req: this.config.eqmc.comet_req,
      __ccg: this.config.webConnectionClassServerGuess.connectionClass,
      __jssesw: this.config.jsErrorLogging?.sampleWeight?.toString(),
      __aaid: '0',
    })

    return body.toString()
  }

  private async graphqlCall<T extends {}>(doc_id: string, variables: T, { headers, bodyParams }: {
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
      body: this.getGraphqlPayload(
        variables,
        doc_id,
        headers['x-fb-friendly-name'],
        bodyParams,
      ),
    })
    // texts.log(`graphqlCall ${doc_id} response: ${JSON.stringify(json, null, 2)}`)
    return { data: json }
  }

  private getSprinkleParam(token = this.config.fb_dtsg) {
    const { should_randomize, version, param_name } = this.config.sprinkleConfig
    let sum = 0
    for (let i = 0; i < token.length; i++) sum += token.charCodeAt(i)
    const result = sum.toString()
    return [param_name, should_randomize ? result : `${version}${result}`]
  }

  async logout() {
    const baseURL = `https://${this.papi.envOpts.domain}/`
    switch (this.papi.env) {
      case 'IG': {
        const { json } = await this.httpJSONRequest(`${baseURL}api/v1/web/accounts/logout/ajax/`, {
          // todo: refactor headers
          method: 'POST',
          body: `one_tap_app_login=1&user_id=${this.config.polarisViewer.id}`,
          headers: {
            accept: '*/*',
            ...SHARED_HEADERS,
            'x-asbd-id': PolarisBDHeaderConfig.ASBD_ID,
            'x-csrftoken': this.getCSRFToken(),
            'x-ig-app-id': this.config.appId,
            'x-ig-www-claim': this.papi.kv.get('wwwClaim') ?? '0',
            'x-requested-with': 'XMLHttpRequest',
            Referer: baseURL,
            'x-instagram-ajax': '1008967676', // todo this comes from `InstagramWebPushInfo.rollout_hash`
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
        if (json.status !== 'ok') {
          throw new Error(`logout ${this.config.polarisViewer.id} failed: ${JSON.stringify(json, null, 2)}`)
        }
        break
      }
      case 'MESSENGER': {
        const token = this.config.fb_dtsg
        const [param, value] = this.getSprinkleParam(token)
        const response = await this.httpRequest(`${baseURL}logout/`, {
          method: 'POST',
          body: `fb_dtsg=${token}&${param}=${value}`,
          headers: {
            accept: '*/*',
            ...SHARED_HEADERS,
            Referer: baseURL,
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
        if (response.statusCode !== 302) {
          throw new Error(`logout ${this.config.fbid} failed: ${JSON.stringify(response.body, null, 2)}`)
        }
      }
        break
      default:
        throw new Error(`logout is not supported on ${this.papi.env}`)
    }
  }

  // get username from here
  private async getUserById(userID: string) {
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

  getCookie(key: string) { // meta only sends this for some requests check `shouldSendCSRFTokenForRequest`
    return this.jar
      .getCookiesSync(`https://${this.papi.envOpts.domain}/`)
      .find(c => c.key === key)?.value
  }

  private getCSRFToken() { // meta only sends this for some requests check `shouldSendCSRFTokenForRequest`
    return this.getCookie('csrftoken')
  }

  private async getSnapshotPayloadForIGD() {
    if (this.papi.env !== 'IG') throw new Error(`getSnapshotPayloadForIGD is only supported on IG but called on ${this.papi.env}`)
    const response = await this.graphqlCall('6195354443842040', {
      deviceId: this.config.clientId,
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

  private async getSnapshotPayloadForFB() {
    if (!(this.papi.env === 'FB' || this.papi.env === 'MESSENGER')) throw new Error(`getSnapshotPayloadForFB is only supported on FB/MESSENGER but called on ${this.papi.env}`)
    const response = await this.graphqlCall('7357432314358409', {
      deviceId: this.config.clientId,
      includeChatVisibility: false,
      requestId: 0,
      requestPayload: JSON.stringify({
        database: 1,
        epoch_id: 0,
        last_applied_cursor: this.papi.kv.get('cursor-1-1'),
        sync_params: JSON.stringify(this.config.syncParams.mailbox),
        version: this.papi.envOpts.defaultVersionId,
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
          'Accept-Language': 'en',
          'X-CSRFToken': this.getCSRFToken(),
          'X-IG-App-ID': this.config.appId,
          'X-ASBD-ID': PolarisBDHeaderConfig.ASBD_ID,
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

  private async setIGReelSeen({
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

  getDefaultSyncGroups() {
    const igdSyncGroups = [
      {
        groupId: 1,
      },
      {
        groupId: 2,
      },
      {
        groupId: 6,
      },
      {
        groupId: 7,
        syncParams: JSON.stringify({
          mnet_rank_types: [
            MNetRankType.INSTAGRAM_DIRECT_SEARCH_NULLSTATE,
          ],
        }),
      },
      {
        groupId: 16,
      },
      {
        groupId: 28,
      },
      {
        groupId: 196,
      },
      {
        groupId: 198,
      },
      // c('qex')._('923') ? {
      //   groupId: 95,
      // }
      //   : null,
      {
        groupId: 118,
        minTimeToSyncTimestampMs: NEVER_SYNC_TIMESTAMP,
      },
    ]
    const initialCursor = this.getMailboxInitialSyncCursor()
    const defaultSyncGroups = [
      {
        groupId: 1,
        lastSyncRequestTimestampMs: initialCursor.lastSyncTimestampMs,
        syncChannel: initialCursor.syncChannel,
        syncParams: initialCursor.syncParams,
      },
      {
        groupId: 2,
        lastSyncRequestTimestampMs: initialCursor.lastSyncTimestampMs,
        syncChannel: initialCursor.syncChannel,
      },
      {
        groupId: 95,
      },
      {
        groupId: 7,
        minTimeToSyncTimestampMs: NEVER_SYNC_TIMESTAMP,
        syncParams: JSON.stringify({
          mnet_rank_types: [
            MNetRankType.MESSENGER_USER_SEARCH,
            MNetRankType.MESSENGER_USER_SEARCH_NULLSTATE,
            MNetRankType.INBOX_ACTIVE_NOW,
            MNetRankType.MESSENGER_OMNIPICKER_NULLSTATE,
            MNetRankType.MESSENGER_BROADCAST_FLOW_TOP_THREADS,
            MNetRankType.BROADCAST_FLOW_TOP_CONTACTS,
          ],
        }),
      },
      {
        groupId: 15,
        minTimeToSyncTimestampMs: NEVER_SYNC_TIMESTAMP,
      },
      {
        groupId: 12,
        minTimeToSyncTimestampMs: NEVER_SYNC_TIMESTAMP,
      },
      {
        groupId: 16,
      },
      {
        groupId: 140,
      },
      {
        groupId: 141,
      },
      {
        groupId: 142,
      },
      {
        groupId: 143,
      },
      {
        groupId: 26,
      },
      {
        groupId: 5,
      },
      {
        groupId: 28,
      },
      {
        groupId: 118,
        minTimeToSyncTimestampMs: NEVER_SYNC_TIMESTAMP,
      },
      {
        groupId: 196,
      },
      {
        groupId: 104,
      },
      {
        groupId: 198,
      },
      // e,
      // c('gkx')('2096')
      // || c('qex')._('1332') ? {
      //     groupId: 120,
      //   }
      //   : null,
      // c('qex')._('274')
      // || c('gkx')('5849') ? {
      //     groupId: 6,
      //     minTimeToSyncTimestampMs: NEVER_SYNC_TIMESTAMP,
      //   }
      //   : null,
      // c('gkx')('2250') ? {
      //   groupId: 108,
      // }
      //   : null,
    ]

    return {
      igdSyncGroups,
      defaultSyncGroups,
    }
  }

  private computeSyncGroups(inbox: InboxName) {
    const generalEnabled = (
      (this.papi.env === 'IG' && this.hasTabbedInbox())
      || this.papi.env === 'FB'
      || this.papi.env === 'MESSENGER'
    )

    const { supportsArchive } = this.papi.envOpts
    const syncGroups: [SyncChannel, ParentThreadKey][] = []

    if (inbox === 'requests') {
      syncGroups.push(
        generalEnabled && [SyncChannel.MAILBOX, ParentThreadKey.GENERAL],
        generalEnabled && [SyncChannel.E2EE, ParentThreadKey.GENERAL],
        [SyncChannel.MAILBOX, ParentThreadKey.SPAM],
        [SyncChannel.E2EE, ParentThreadKey.SPAM],
      )
    } else {
      syncGroups.push(
        [SyncChannel.MAILBOX, ParentThreadKey.PRIMARY],
        [SyncChannel.E2EE, ParentThreadKey.PRIMARY],
        supportsArchive ? [SyncChannel.MAILBOX, ParentThreadKey.ARCHIVE] : undefined,
        supportsArchive ? [SyncChannel.E2EE, ParentThreadKey.ARCHIVE] : undefined,
      )
    }

    return syncGroups.filter(Boolean)
  }

  computeServerHasMoreThreads() {
    const threadsRanges = this.papi.kv.getThreadsRanges()
    return threadsRanges.some(range => (typeof range.value.hasMoreBefore === 'boolean' ? range.value.hasMoreBefore : false))
  }

  async getOrRequestContactsIfNotExist(contactIds: string[]) {
    this.logger.debug(`getOrFetchContactsIfNotExist called with ${contactIds.length} contacts`, contactIds)
    if (contactIds.length === 0) return { contacts: [], missing: [] }

    const contacts = await this.papi.db.query.contacts.findMany({
      columns: {
        id: true,
        profilePictureUrl: true,
        name: true,
        username: true,
        contact: true,
      },
      where: inArray(schema.contacts.id, contactIds),
    })

    if (contacts.length === contactIds.length) return { contacts, missing: [] }

    const loadedContactIds = new Set(contacts.map(c => c.id))
    const missing = contactIds.filter(id => !loadedContactIds.has(id))
    await this.requestContacts(missing)

    return { contacts, missing }
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
      fb_dtsg: this.config.fb_dtsg,
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
        'x-asbd-id': PolarisBDHeaderConfig.ASBD_ID,
        'x-fb-lsd': this.config.lsdToken,
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
    const attachment_fbids = []
    if (filePath && fileName) {
      this.logger.debug('sendMedia about to call uploadFile')
      const res = await this.uploadFile(threadID, filePath, fileName)
      if (!res?.payload?.metadata) {
        console.error(res)
        throw Error('uploadFile failed: ' + JSON.stringify(res))
      }
      const metadata = res.payload.metadata[0] as {
        image_id?: string
        video_id?: string
        gif_id?: string
      }
      attachment_fbids.push(metadata.image_id || metadata.video_id || metadata.gif_id)
      this.logger.debug('sendMedia', res)
    }
    return this.sendMessage(threadID, {}, opts, attachment_fbids)
  }

  // tabId and random number for messengerWebPushRegister
  private static randomSessionString() {
    // let a = Math.floor(d("Random").random() * k)
    // a = a.toString(i);
    // return "0".repeat(j - a.length) + a
    // temp solution
    return Math.random().toString(36).slice(2, 8)
  }

  // stored in sessionStorage so it's ephemeral
  // this only lasts until browser is closed
  private webPushTabId = MetaMessengerAPI.randomSessionString()

  // only stored as a class property in messenger.com so it's also ephemeral
  // this only lasts while the page is loaded
  private webPushRandomString = MetaMessengerAPI.randomSessionString()

  private async messengerWebPushRegister(endpoint: string, p256dh: string, auth: string) {
    // todo: add missing fields

    const token = this.config.fb_dtsg
    const [param, value] = this.getSprinkleParam(token)

    const formData = new URLSearchParams({
      app_id: '1443096165982425',
      push_endpoint: endpoint,
      subscription_keys: JSON.stringify({ p256dh, auth }),
      __user: this.config.fbid,
      __a: '1',
      __req: '9', // seen values of 'd' and 'h' as well
      __hs: this.config.siteData.haste_session,
      dpr: '2',
      __ccg: 'EXCELLENT',
      __rev: String(this.config.siteData.client_revision),
      // sessionId is derived from a value in localStorage in messenger.com
      __s: `:${this.webPushTabId}:${this.webPushRandomString}`, // session id + : + tabid + : + random str
      __hsi: this.config.siteData.hsi,
      // hashes using a BitMap. (?)
      // __dyn seems to be fairly static. this might change on client_revision changes
      __dyn: '7AzHK4HwBgDx-5Q1hyoyEqxd4Wo2nDwAxu13wFwkUKewSAx-bwNw9G2Saxa0DU6u3y4o27wxg3Qwb-q7oc81xoswIK1Rwwwg8a8465o-cw8a0XohwGxu782lwj8bU9kbxS210hU31w9O7Udo5qfK0zEkxe2Gexe5E766FobrwKxm5o7G4-5o4q3y2616zovUaU3_wFKq2-azqwqo4i1jg2cwMwhU9UdUcobUak2-362S269wr86C0yEeE',
      // __csr: '', // changes every request
      __comet_req: '1',
      fb_dtsg: token,
      [param]: value, // param = jazoest
      lsd: this.config.lsdToken,
      __spin_r: String(this.config.siteData.__spin_r),
      __spin_b: this.config.siteData.__spin_b,
      __spin_t: String(this.config.siteData.__spin_t),
      __jssesw: '1',
    })

    const { json } = await this.httpJSONRequest('https://www.messenger.com/push/register/service_worker/', {
      method: 'POST',
      body: formData.toString(),
      // todo: refactor headers
      headers: {
        Accept: '*/*',
        ...SHARED_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-asbd-id': PolarisBDHeaderConfig.ASBD_ID,
        'x-fb-lsd': this.config.lsdToken,
        Referer: 'https://www.messenger.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
    if (!json.payload.success) {
      throw new Error(`webPushRegister failed: ${JSON.stringify(json, null, 2)}`)
    }
  }

  private async instagramWebPushRegister(endpoint: string, p256dh: string, auth: string) {
    const { domain } = EnvOptions.IG
    const formData = new URLSearchParams()
    formData.set('device_token', endpoint)
    formData.set('device_type', 'web_vapid')
    formData.set('mid', crypto.randomUUID()) // should be something that looks like "ZNboAAAEAAGBNvdmibKpso5huLi9"
    formData.set('subscription_keys', JSON.stringify({
      auth,
      p256dh,
    }))
    const { json } = await this.httpJSONRequest(`https://${domain}/api/v1/web/push/register/`, {
      method: 'POST',
      body: formData.toString(),
      // todo: refactor headers
      headers: {
        accept: '*/*',
        ...SHARED_HEADERS,
        'content-type': 'application/x-www-form-urlencoded',
        'x-asbd-id': PolarisBDHeaderConfig.ASBD_ID,
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': this.config.appId,
        'x-ig-www-claim': this.papi.kv.get('wwwClaim') ?? '0',
        'x-requested-with': 'XMLHttpRequest',
        Referer: `https://${this.papi.envOpts.domain}/`,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
    if (json.status !== 'ok') {
      throw new Error(`webPushRegister failed: ${JSON.stringify(json, null, 2)}`)
    }
  }

  async webPushRegister(endpoint: string, p256dh: string, auth: string) {
    if (this.papi.env === 'MESSENGER') return this.messengerWebPushRegister(endpoint, p256dh, auth)
    if (this.papi.env === 'IG') return this.instagramWebPushRegister(endpoint, p256dh, auth)
    throw new Error('not implemented')
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

    const threads = (await queryThreads(this.papi.db, args)).map(t => mapThread(t, this.papi.env, this.config.fbid, parseMessageRanges(t.ranges)))

    const participantIDs = threads.flatMap(t => t.participants.items.map(p => p.id))
    await this.getOrRequestContactsIfNotExist(participantIDs)
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

    return mapMessages(await queryMessages(this.papi.db, args), this.papi.env, this.config.fbid)
  }

  async getMessageRanges(threadKey: string): Promise<IGMessageRanges> {
    const thread = await this.papi.db.query.threads.findFirst({
      where: eq(schema.threads.threadKey, threadKey),
      columns: { ranges: true },
      with: {
        messages: {
          columns: {
            messageId: true,
            timestampMs: true,
          },
          orderBy: desc(schema.messages.primarySortKey),
          limit: 1,
        },
      },
    })
    if (!thread?.ranges) {
      const [lastMessage] = thread?.messages || []
      return Promise.resolve({
        threadKey,
        minTimestamp: lastMessage?.timestampMs ? String(lastMessage.timestampMs.getTime()) : undefined,
        minMessageId: lastMessage?.messageId,
        maxTimestamp: undefined,
        hasMoreBeforeFlag: true,
        hasMoreAfterFlag: true,
      } satisfies IGMessageRanges)
    }
    const ranges = parseMessageRanges(thread.ranges)
    ranges.hasMoreBeforeFlag = typeof ranges?.hasMoreBeforeFlag === 'boolean' ? ranges.hasMoreBeforeFlag : true
    return ranges
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

    const newAttachment = {
      ...(current?.attachment ? JSON.parse(current.attachment) : {}),
      ...attachment,
    }

    const aMapped = {
      threadKey,
      messageId,
      attachmentFbid,
      timestampMs: new Date(timestampMs),
      offlineAttachmentId,
      attachment: JSON.stringify(newAttachment),
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

  removeThread(remove_type: ThreadRemoveType, thread_key: string, sync_group: SyncChannel) {
    if (remove_type === ThreadRemoveType.ARCHIVE && !this.papi.envOpts.supportsArchive) throw new Error('removeThread is not supported in this environment')
    return this.papi.socket.publishTask(
      remove_type === ThreadRemoveType.ARCHIVE ? SocketRequestResolverType.ARCHIVE_THREAD : SocketRequestResolverType.DELETE_THREAD,
      [{
        label: '146',
        payload: JSON.stringify({
          thread_key,
          remove_type,
          sync_group,
        }),
        queue_name: thread_key.toString(),
        task_id: this.papi.socket.taskIds.gen(),
        failure_count: null,
      }],
    )
  }

  async requestThread(threadKey: string) {
    return this.papi.socket.publishTask(SocketRequestResolverType.GET_NEW_THREAD, [{
      label: '209',
      payload: JSON.stringify({
        thread_fbid: threadKey,
        force_upsert: 0,
        use_open_messenger_transport: 0,
        sync_group: SyncChannel.MAILBOX,
        metadata_only: 0,
        preview_only: 0,
      }),
      queue_name: threadKey.toString(),
      task_id: this.papi.socket.taskIds.gen(),
      failure_count: null,
    }])
  }

  async requestContacts(contactIDs: string[]) {
    if (contactIDs.length === 0) return
    return this.papi.socket.publishTask(SocketRequestResolverType.REQUEST_CONTACTS, contactIDs.map(contact_id => ({
      label: '207',
      payload: JSON.stringify({
        contact_id,
      }),
      queue_name: 'cpq_v2',
      task_id: this.papi.socket.taskIds.gen(),
      failure_count: null,
    })))
    // @TODO: code above seems to work for messenger (it was made for ig)
    // but messenger.com uses `/send_additional_contacts`
  }

  async mutateReaction(threadID: string, messageID: string, reaction: string) {
    const message = this.papi.db
      .select({
        threadKey: schema.messages.threadKey,
        messageId: schema.messages.messageId,
        timestampMs: schema.messages.timestampMs,
      })
      .from(schema.messages)
      .limit(1)
      .where(and(
        eq(schema.messages.threadKey, threadID),
        eq(schema.messages.messageId, messageID),
      ))
      .get()

    // @TODO: check `replaceOptimisticReaction` in response (not parsed atm)
    await this.papi.socket.publishTask(SocketRequestResolverType.ADD_REACTION, [{
      label: '29',
      payload: JSON.stringify({
        thread_key: threadID,
        timestamp_ms: Number(message.timestampMs.getTime()),
        message_id: messageID,
        actor_id: this.config.fbid,
        reaction,
        reaction_style: null,
        sync_group: SyncChannel.MAILBOX,
      }),
      queue_name: `["reaction",${JSON.stringify(messageID)}]`,
      task_id: this.papi.socket.taskIds.gen(),
      failure_count: null,
    }])
  }

  async createGroupThread(participants: string[]) {
    const { otid, now } = getTimeValues(this.papi.socket.requestIds)
    const thread_id = genClientContext()
    const response = await this.papi.socket.publishTask(SocketRequestResolverType.CREATE_GROUP_THREAD, [{
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
      task_id: this.papi.socket.taskIds.gen(),
      failure_count: null,
    }])
    this.logger.debug('create group thread response', response)
    return { now, offlineThreadingId: response?.replaceOptimisticThread?.offlineThreadingId, threadId: response?.replaceOptimisticThread?.threadId }
  }

  async fetchMessages(threadID: string) {
    const ranges = await this.getMessageRanges(threadID)

    this.logger.debug('fetchMessages', {
      threadID,
      ranges,
    })

    if (!ranges?.minTimestamp && !ranges?.minMessageId) return

    return this.papi.socket.publishTask(SocketRequestResolverType.FETCH_MESSAGES, [{
      label: '228',
      payload: JSON.stringify({
        thread_key: threadID,
        direction: 0,
        reference_timestamp_ms: Number(ranges.minTimestamp),
        reference_message_id: ranges.minMessageId,
        sync_group: SyncChannel.MAILBOX,
        cursor: this.papi.kv.get('cursor-1-1'),
      }),
      queue_name: `mrq.${threadID}`,
      task_id: this.papi.socket.taskIds.gen(),
      failure_count: null,
    }])
  }

  async sendMessage(threadID: string, { text, mentionedUserIDs }: MessageContent, { quotedMessageID }: MessageSendOptions, attachmentFbids: string[], externalUrl?: string, attribution_app_id?: number) {
    const { otid, timestamp, now } = getTimeValues(this.papi.socket.requestIds)
    const reply_metadata = quotedMessageID && {
      reply_source_id: quotedMessageID,
      reply_source_type: 1,
      reply_type: 0,
    }

    const hasAttachment = attachmentFbids.length > 0
    let sendType = hasAttachment ? SendType.MEDIA : SendType.TEXT
    sendType = externalUrl ? SendType.EXTERNAL_MEDIA : sendType

    const { promise } = this.sendMessageResolvers.getOrCreate(otid.toString())

    const mentionsData = mentionedUserIDs?.length ? await mapUserMentions(this.papi.db, text, mentionedUserIDs) : undefined
    const result = await Promise.race([
      this.papi.socket.publishTask(SocketRequestResolverType.SEND_MESSAGE, [
        {
          label: '46',
          payload: JSON.stringify({
            thread_id: threadID,
            otid: otid.toString(),
            source: (2 ** 16) + 1,
            attribution_app_id,
            url: externalUrl,
            send_type: sendType,
            sync_group: SyncChannel.MAILBOX,
            text: !hasAttachment ? text : null,
            initiating_source: hasAttachment ? undefined : 1,
            skip_url_preview_gen: hasAttachment ? undefined : 0,
            text_has_links: hasAttachment ? undefined : 0,
            reply_metadata,
            attachment_fbids: hasAttachment ? attachmentFbids : undefined,
            ...(mentionsData ? { mention_data: mentionsData } : {}),
          }),
          queue_name: threadID.toString(),
          task_id: this.papi.socket.taskIds.gen(),
          failure_count: null,
        },
        {
          label: '21',
          payload: JSON.stringify({
            thread_id: threadID,
            last_read_watermark_ts: Number(timestamp),
            sync_group: SyncChannel.MAILBOX,
          }),
          queue_name: threadID.toString(),
          task_id: this.papi.socket.taskIds.gen(),
          failure_count: null,
        },
      ]),
      promise,
    ])

    return {
      timestamp: new Date(now),
      offlineThreadingId: String(otid),
      messageId: result?.replaceOptimsiticMessage.messageId,
    }
  }

  threadsRangesQuery = async (
    query: ReturnType<typeof lsMappers.threadsRangesQuery>,
    sync_group?: SyncChannel,
  ): Promise<MMSocketTask> => {
    const cursor = sync_group ? this.papi.kv.get(`cursor-1-${sync_group}`) : undefined
    if (!cursor) {
      this.logger.error('threadsRangesQuery: cursor not found')
      return Promise.resolve(null)
    }
    const reference_thread_key = query.isAfter ? query.maxThreadKey : query.minThreadKey
    const reference_activity_timestamp = query.isAfter ? query.maxLastActivityTimestampMs : query.minLastActivityTimestampMs
    return {
      label: '145',
      payload: JSON.stringify({
        is_after: query.isAfter ? 1 : 0,
        parent_thread_key: query.parentThreadKey,
        reference_thread_key: reference_thread_key || 0,
        reference_activity_timestamp: reference_activity_timestamp || 9999999999999,
        additional_pages_to_fetch: query.additionalPagesToFetch,
        cursor,
        messaging_tag: null,
        sync_group,
      }),
      queue_name: 'trq',
      task_id: this.papi.socket.taskIds.gen(),
      failure_count: null,
    }
  }

  fetchMoreThreadsV4 = async (inbox: InboxName) => {
    const threadsRanges = this.papi.kv.getThreadsRanges()
    const threadsRangesV2 = this.papi.kv.getThreadsRangesV2()
    const filteredThreadsRanges = this.papi.kv.getFilteredThreadsRanges()

    this.logger.debug('fetchMoreThreadsV4', {
      inbox,
      threadsRanges,
      threadsRangesV2,
      filteredThreadsRanges,
    })

    const tasks: MMSocketTask[] = (await Promise.all(threadsRanges.map(r => {
      const { minThreadKey, minLastActivityTimestampMs, hasMoreBefore, syncGroup, parentThreadKey } = r.value
      if (!hasMoreBefore) return
      return this.threadsRangesQuery({
        isAfter: false,
        isBefore: hasMoreBefore,
        parentThreadKey,
        minLastActivityTimestampMs: minLastActivityTimestampMs ? Number(minLastActivityTimestampMs) : undefined,
        minThreadKey,
        additionalPagesToFetch: 0,
        maxThreadKey: undefined,
        maxLastActivityTimestampMs: undefined,
        shouldSkipE2eeThreadsRanges: false,
      }, syncGroup)
    }))).filter(Boolean)
    if (tasks.length === 0) return
    await this.papi.socket.publishTask(SocketRequestResolverType.FETCH_MORE_THREADS, tasks, {
      timeoutMs: 15_000,
    })
  }

  // does not work for moving threads out of the message requests folder
  // prefer this.approveThread
  // since we pretend General and Primary are the same, this method is unused
  // but it is still here for reference
  // async changeThreadFolder(thread_key: string, old_ig_folder: number, new_ig_folder: number) {
  //   await this.socket.publishTask(RequestResolverType.SET_THREAD_FOLDER, [{
  //     label: '511',
  //     payload: JSON.stringify({
  //       thread_key,
  //       old_ig_folder,
  //       new_ig_folder,
  //       sync_group: 1,
  //     }),
  //     queue_name: thread_key,
  //     task_id: this.socket.genTaskId(),
  //     failure_count: null,
  //   }])
  // }

  // async createThread(userId: string) {
  //   const response = await this.api.socket.publishTask(RequestResolverType.CREATE_THREAD, {
  //     label: '209',
  //     payload: JSON.stringify({
  //       // thread_fbid: BigInt(userId),
  //       thread_fbid: userId,
  //     }),
  //     queue_name: userId,
  //     task_id: this.api.socket.genTaskId(),
  //     failure_count: null,
  //   })
  //   this.logger.info('create thread response', response)
  // }
  private getMailboxInitialSyncCursor() {
    return {
      syncParams: this.config.syncParams?.mailbox,
      syncChannel: 1,
      lastSyncTimestampMs: 0,
    } as const
  }

  hasTabbedInbox() { // @TODO: don't rely on this
    return this.config?.polarisViewer?.data?.is_business_account || this.config?.polarisViewer?.data?.is_professional_account
  }
}
