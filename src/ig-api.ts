import fs from 'fs/promises'
import { CookieJar } from 'tough-cookie'
import FormData from 'form-data'
import {
  texts,
  type FetchOptions,
  type User,
  type MessageSendOptions,
  InboxName,
  ServerEventType,
  Message,
} from '@textshq/platform-sdk'
import { asc, desc, eq, and, type InferModel, inArray } from 'drizzle-orm'
import { hasSomeCachedData, QueryMessagesWhere, queryThreads } from './store/helpers'

import * as schema from './store/schema'
import { ParsedPayload, parseRawPayload } from './parsers'
import { getLogger } from './logger'
import type { RequestResolverRejector, RequestResolverResolver, RequestResolverType } from './ig-socket'
import { APP_ID, INSTAGRAM_BASE_URL } from './constants'
import type Instagram from './api'
import type { SerializedSession } from './types'
import type { IGMessage, IGParsedViewerConfig, IGReadReceipt } from './ig-types'
import { getOriginalURL } from './util'
import { IGThreadInDB, messages as messagesSchema } from './store/schema'
import { mapMessages, mapParticipants } from './mappers'

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
  private logger = getLogger('ig-api')

  constructor(private readonly papi: Instagram) {}

  authMethod: 'login-window' | 'extension' = 'login-window'

  jar: CookieJar

  ua: SerializedSession['ua'] = texts.constants.USER_AGENT

  lastThreadReference: {
    reference_thread_key: string
    reference_activity_timestamp: number
    hasMoreBefore: boolean
  }

  messagesHasMoreBefore: Map<string, boolean> = new Map()

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

  async init() {
    const { clientId, fb_dtsg, lsd, fbid, config } = await this.getClientId()

    this.papi.kv.setMany({
      clientId,
      fb_dtsg,
      fbid,
      lsd,
      igUserId: config.id,
      _viewerConfig: JSON.stringify(config),
    })

    this.papi.currentUser = {
      // id: config.id, // this is the instagram id but fbid is instead used for chat
      id: fbid,
      fullName: config.full_name,
      imgURL: fixUrl(config.profile_pic_url_hd),
      username: config.username,
    }
    await this.getInitialPayload()
  }

  private async getClientId() {
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
    const clientId = body.slice(body.indexOf('{"clientID":')).split('"')[3]
    const fb_dtsg = body.slice(body.indexOf('DTSGInitialData')).split('"')[4]
    const fbid = body.match(/"IG_USER_EIMU":"([^"]+)"/)?.[1]
    const lsd = body.match(/"LSD",\[\],\{"token":"([^"]+)"\}/)?.[1]
    const sharedData = body.match(/"XIGSharedData",\[\],({.*?})/s)[1]
    // @TODO: this is disgusting
    const config: IGParsedViewerConfig = JSON.parse(
      `${
        sharedData.split('"viewer\\":')[1].split(',\\"badge_count')[0]
      // eslint-disable-next-line no-useless-escape
      }}`.replace(/\\\"/g, '"'),
    )
    return { clientId, lsd, fb_dtsg, fbid, config }
  }

  getCookies() {
    return this.jar.getCookieStringSync(INSTAGRAM_BASE_URL)
  }

  // they have different gql endpoints will merge these later
  async getUserByUsername(username: string) {
    const response = await this.httpRequest(INSTAGRAM_BASE_URL + 'api/v1/users/web_profile_info/?' + new URLSearchParams({ username }).toString(), {
      // todo: refactor headers
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114"',
        'sec-ch-ua-full-version-list':
            '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"13.5.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'viewport-width': '1280',
        'x-asbd-id': '129477',
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': APP_ID,
        'x-ig-www-claim': this.papi.kv.get('wwwClaim'),
        'x-requested-with': 'XMLHttpRequest',
        Referer: `${INSTAGRAM_BASE_URL}${username}/`,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
    const json = JSON.parse(response.body)
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
    const response = await this.httpRequest(INSTAGRAM_BASE_URL + 'api/graphql/', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      // todo: maybe use FormData instead:
      body: new URLSearchParams({ fb_dtsg: this.papi.kv.get('fb_dtsg'), variables: JSON.stringify(variables), doc_id }).toString(),
    })
    const json = JSON.parse(response.body)
    // texts.log(`graphqlCall ${doc_id} response: ${JSON.stringify(json, null, 2)}`)
    return { data: json }
  }

  async logout() {
    const response = await this.httpRequest(INSTAGRAM_BASE_URL + 'api/v1/web/accounts/logout/ajax/', {
      // todo: refactor headers
      method: 'POST',
      body: `one_tap_app_login=1&user_id=${this.papi.kv.get('igUserId')}`,
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114"',
        'sec-ch-ua-full-version-list':
            '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"13.5.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'viewport-width': '1280',
        'x-asbd-id': '129477',
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': APP_ID,
        'x-ig-www-claim': this.papi.kv.get('wwwClaim'),
        'x-requested-with': 'XMLHttpRequest',
        Referer: INSTAGRAM_BASE_URL,
        'x-instagram-ajax': '1007993177',
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
    const json = JSON.parse(response.body)
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
        last_applied_cursor: this.papi.kv.get('cursor-1'),
        sync_params: JSON.stringify({}),
        version: 9477666248971112,
      }),
      requestType: 1,
    })
    return this.handlePayload(response.data.data.lightspeed_web_request_for_igd.payload, null, null, null, null, true)
  }

  async handlePayload(payload: any, requestId?: number, requestType?: RequestResolverType, requestResolver?: RequestResolverResolver, requestRejector?: RequestResolverRejector, isInitialRequest?: boolean) {
    let rawd: ParsedPayload
    this.logger.debug('handlePayload init', { isInitialRequest, requestId, requestType, payload })
    try {
      rawd = parseRawPayload(payload)
    } catch (err) {
      texts.Sentry.captureException(err, {
        extra: {
          // payload, // do not send, contains sensitive data
          isInitialRequest,
          requestId,
          requestType,
        },
      })
      console.error(err)
      this.logger.error('handlePayload error', { isInitialRequest, requestId, requestType, payload }, { err, errString: err.toString() })
      return
    }

    this.logger.debug('handlePayload parsed payload', rawd)

    const knownRequest = requestId && requestType
    if (knownRequest && rawd.issueNewError) {
      this.logger.error(`[${requestId}] error for ${requestType}`, rawd)
      const errors = rawd.issueNewError?.map(({ errorId, errorTitle, errorMessage }) => `Error ${errorId}: ${errorTitle} - ${errorMessage}`)
      const [mainError, ...otherErrors] = errors || []
      if (mainError) {
        requestRejector(mainError)
        // sentry should be captured upstream
        // texts.Sentry.captureException(new Error(mainError))
      }
      if (otherErrors && otherErrors.length > 0) {
        otherErrors.forEach(text => {
          this.papi?.onEvent([
            {
              type: ServerEventType.TOAST,
              toast: {
                text,
              },
            },
          ])
          texts.Sentry.captureException(new Error(text))
        })
      }
    }

    // verify ThreadExists. This check needs to happen before since if it doesn't exist, we need to call a different endpoint
    // and return
    if (rawd.verifyThreadExists) {
      const thread = this.papi.db.query.threads.findFirst({
        where: eq(schema.threads.threadKey, rawd.verifyThreadExists[0].threadKey!),
      })
      if (!thread) {
        this.logger.info('thread does not exist, skipping payload and calling getThread')
        this.papi.socket.getThread(rawd.verifyThreadExists[0].threadKey!)
        return
      }
    }

    // below handles case of fixing gaps in the cache when client is offline
    if (rawd.upsertMessage && rawd.deleteThenInsertThread && hasSomeCachedData(this.papi.db)) {
      // for each message, check if it exists in the cache
      // if it doesn't, call fetch more messages from the socket using the threadKey and messageID
      // if it does, do nothing
      for (const m of rawd.upsertMessage) {
        // make sure thread already exists
        const thread = this.papi.db.query.threads.findFirst({
          where: eq(schema.threads.threadKey, m.threadKey),
          columns: {
            threadKey: true,
          },
        })
        if (!thread) continue
        // check if last message already in cache
        const message = this.papi.db.query.messages.findFirst({
          where: and(
            eq(schema.messages.threadKey, m.threadKey),
            eq(schema.messages.messageId, m.messageId),
          ),
          columns: {
            messageId: true,
          },
        })
        if (message?.messageId) continue
        const newestMessageCache = this.getNewestMessage(m.threadKey)
        this.logger.info(`message ${m.messageId} does not exist in cache, calling fetchMessages`)
        let limit = 0
        while (limit < 10) {
          const resp = await this.papi.socket.fetchMessages(m.threadKey, m.messageId, new Date(m.timestampMs))
          if (!resp?.messages?.length) continue
          // check if any of resp.messages is = to newestMessageCache.messageId
          const newMessageIds = resp.messages.map(rm => rm.id)
          if (newMessageIds.includes(newestMessageCache.messageId)) {
            this.logger.info(`newestMessageCache ${newestMessageCache.messageId} found in fetchMessages`)
            continue
          }
          limit++
        }
        if (limit === 10) {
          // TODO delete all old messages in cache
        }
      }
    } else {
      this.logger.info('no need to fix cache')
    }
    // add all parsed fields to the ig-api store
    if (rawd.deleteThenInsertThread) {
      const threads = rawd.deleteThenInsertThread
      const lastThread = threads?.length > 0 ? threads[threads.length - 1] : null
      if (lastThread && rawd.upsertSyncGroupThreadsRange?.length) {
        this.lastThreadReference = {
          reference_activity_timestamp: lastThread.lastActivityTimestampMs,
          reference_thread_key: lastThread.threadKey,
          hasMoreBefore: rawd.upsertSyncGroupThreadsRange?.[0].hasMoreBefore!,
        }
      }

      await this.deleteThenInsertThread(threads)
    }

    if (rawd.verifyContactRowExists) this.verifyContactRowExists(rawd.verifyContactRowExists)

    if (rawd.addParticipantIdToGroupThread) await this.addParticipantIdToGroupThread(rawd.addParticipantIdToGroupThread)

    if (rawd.upsertMessage?.length > 0 || rawd.insertMessage?.length > 0) {
      const messages = [
        ...(rawd.upsertMessage || []),
        ...(rawd.insertMessage || []),
      ]
      if (messages.length > 0) {
        await this.upsertMessage(messages)
      }
    }

    if (rawd.upsertReaction) await this.addReactions(rawd.upsertReaction)

    if (rawd.insertBlobAttachment?.length > 0 || rawd.insertXmaAttachment?.length > 0) {
      const attachments = [
        ...(rawd.insertBlobAttachment || []),
        ...(rawd.insertXmaAttachment || []),
      ]
      if (attachments.length > 0) {
        await this.upsertAttachments(attachments)
      }
    }

    if (rawd.updateReadReceipt) this.updateReadReceipt(rawd.updateReadReceipt)

    if (rawd.deleteThread?.length > 0) {
      rawd.deleteThread.forEach(({ threadKey }) => {
        this.deleteThreadFromDB(threadKey!)
      })
    }

    // updateDeliveryReceipt

    if (rawd.insertNewMessageRange) {
      rawd.insertNewMessageRange.forEach(r => {
        this.logger.info(`updating hasMoreBefore for thread ${r.threadKey} ${r.hasMoreBefore}`)
        this.papi.db.update(schema.threads).set({ hasMoreBefore: r.hasMoreBefore }).where(eq(schema.threads.threadKey, r.threadKey)).run()
      })
    }

    if (rawd.updateExistingMessageRange) {
      rawd.updateExistingMessageRange.forEach(r => {
        this.papi.db.update(schema.threads).set({ hasMoreBefore: r.hasMoreBefore }).where(eq(schema.threads.threadKey, r.threadKey)).returning()
        // this.messagesHasMoreBefore.set(r.threadKey, r.hasMoreBefore)

        // resolve all promises in promise map for this thread
        if (this.papi.socket.asyncRequestResolver.has(`messages-${r.threadKey!}`)) {
          const { resolve } = this.papi.socket.asyncRequestResolver.get(`messages-${r.threadKey!}`)
          this.logger.info(`resolving messages-${r.threadKey!}`)
          this.papi.socket.asyncRequestResolver.delete(`messages-${r.threadKey!}`)
          resolve({ messages: [], hasMoreBefore: r.hasMoreBefore })
        }
      })
    }
    if (rawd.insertAttachmentCta) {
      // query the attachment in the database
      // const messages = await this.papi.db.select({ message: schema.messages.message }).from(schema.attachments).where(eq(schema.attachments.attachmentFbid, rawd.insertAttachmentCta[0].attachmentFbid!))
      // this.logger.info('insertAttachmentCta attachments', attachments[0])
      for (const r of rawd.insertAttachmentCta) {
        this.logger.info('insertAttachmentCta raw ', r)
        // const messages = await this.papi.db.select({ message: schema.messages.message }).from(schema.messages).where(eq(schema.messages.messageId, r.messageId!)).run()
        // FIXME: ^ above doesnt work, also the below code is an atrocity
        // ideally we would just update the field in the database without querying, parsing, updating, and reinserting the message
        const messages = this.papi.db.query.messages.findFirst({
          where: eq(schema.messages.messageId, r.messageId!),
        })
        if (r.actionUrl && r.actionUrl !== 'null') {
          // const a = this.papi.db.query.attachments.findFirst({
          //   where: eq(schema.attachments.attachmentFbid, r.attachmentFbid!),
          // })
          // const attachment = JSON.parse(a.attachment) as IGAttachment
          const mparse = JSON.parse(messages.message) as IGMessage

          const mediaLink = r.actionUrl.startsWith('/') ? `https://www.instagram.com${r.actionUrl}` : getOriginalURL(r.actionUrl)

          this.logger.info('insertAttachmentCta mediaLink', mediaLink)
          const INSTAGRAM_PROFILE_BASE_URL = 'https://www.instagram.com/_u/'
          if (mediaLink.startsWith(INSTAGRAM_PROFILE_BASE_URL)) {
            mparse.extra = {}
            mparse.links = [{
              url: mediaLink,
              title: `@${mediaLink.replace(INSTAGRAM_PROFILE_BASE_URL, '')} on Instagram`,
            }]
          } else if (mediaLink.startsWith(INSTAGRAM_BASE_URL)) {
            mparse.extra = {
              mediaLink,
            }
          } else {
            mparse.links = [{
              url: mediaLink,
              title: mparse.replySnippet,
            }]
          }

          const newMessage = JSON.stringify(mparse)
          this.logger.info('insertAttachmentCta newMessage', newMessage)

          this.papi.db.update(schema.messages).set({ message: newMessage }).where(eq(schema.messages.messageId, r.messageId!)).run()

          // if (r.actionUrl.startsWith('/')) {
          //   mparse.links = [{ url: `https://www.instagram.com${r.actionUrl}/` }]
          // } else {
          //   mparse.links = [{ url: r.actionUrl }]
          // }
        }
      }
    }
    if (rawd.deleteReaction) {
      rawd.deleteReaction.forEach(r => {
        this.papi.db.delete(schema.reactions).where(and(
          eq(schema.reactions.threadKey, r.threadKey),
          eq(schema.reactions.messageId, r.messageId),
          eq(schema.reactions.actorId, r.actorId),
        )).run()
        this.papi.onEvent?.([{
          type: ServerEventType.STATE_SYNC,
          objectName: 'message_reaction',
          objectIDs: { threadID: r.threadKey!, messageID: r.messageId! },
          mutationType: 'delete',
          entries: [r.actorId!],
        }])
      })
    }

    if (rawd.deleteMessage) {
      rawd.deleteMessage.forEach(r => {
        this.papi.db.delete(schema.messages).where(and(
          eq(schema.messages.threadKey, r.threadKey),
          eq(schema.messages.messageId, r.messageId),
        )).run()
        this.papi.onEvent?.([{
          type: ServerEventType.STATE_SYNC,
          objectName: 'message',
          objectIDs: { threadID: r.threadKey!, messageID: r.messageId! },
          mutationType: 'delete',
          entries: [r.messageId!],
        }])
      })
    }

    if (rawd.cursor) {
      this.papi.kv.set('cursor-1', rawd.cursor)
      this.papi.kv.set('_lastReceivedCursor', rawd.cursor)
      // this.cursor = rawd.cursor
    }

    // todo:
    // once all payloads are handled, we can emit server events and get data from the store

    if (rawd.deleteThenInsertThread) {
      // there are new threads to send to the platform
      this.logger.info('new threads to send to the platform')
      const newThreadIds = rawd.deleteThenInsertThread.map(t => t.threadKey)
      const threads = queryThreads(this.papi.db, newThreadIds, this.papi.kv.get('fbid'))

      this.papi.onEvent?.([{
        type: ServerEventType.STATE_SYNC,
        objectName: 'thread',
        objectIDs: {},
        mutationType: 'upsert',
        entries: threads,
      }])
      const keys = [`threads-${InboxName.NORMAL}`, `threads-${InboxName.REQUESTS}`] as const
      for (const key of keys) {
        if (this.papi.socket.asyncRequestResolver.has(key)) {
          const { resolve } = this.papi.socket.asyncRequestResolver.get(key)
          this.logger.debug('resolve', key)
          this.papi.socket.asyncRequestResolver.delete(key)
          resolve({ threads, hasMoreBefore: rawd.upsertSyncGroupThreadsRange?.[0].hasMoreBefore })
        }
      }
    } else if (rawd.insertNewMessageRange) {
      // new messages to send to the platform since the user scrolled up in the thread
      const newMessageIds = (rawd.upsertMessage || []).map(m => m.messageId)
      const messages = newMessageIds.length > 0 ? this.queryMessages(rawd.insertNewMessageRange[0].threadKey!, newMessageIds) : []

      const threadID = rawd.insertNewMessageRange[0].threadKey
      this.logger.debug('rawd.insertNewMessageRange', {
        threadID,
        messages,
        insertNewMessageRange: rawd.insertNewMessageRange,
      })

      if (messages?.length > 0) {
        this.papi.onEvent?.([{
          type: ServerEventType.STATE_SYNC,
          objectName: 'message',
          objectIDs: { threadID: threadID! },
          mutationType: 'upsert',
          entries: messages,
        }])
      }

      if (this.papi.socket.asyncRequestResolver.has(`messages-${threadID}`)) {
        const { resolve } = this.papi.socket.asyncRequestResolver.get(`messages-${threadID}`)
        // this.logger.info(`resolving messages-${threadID}`)
        this.papi.socket.asyncRequestResolver.delete(`messages-${threadID}`)
        resolve({ messages, hasMoreBefore: rawd.insertNewMessageRange[0].hasMoreBefore })
      } else {
        // throw if this arrived without requested
        const err = new Error(`no promise for messages-${threadID}`)
        texts.Sentry.captureException(err)
        this.logger.error(err)
        console.error(err)
      }
    } else if (rawd.updateThreadMuteSetting) {
      this.papi.onEvent?.([{
        type: ServerEventType.STATE_SYNC,
        objectName: 'thread',
        objectIDs: { },
        mutationType: 'update',
        entries: [{
          id: rawd.updateThreadMuteSetting[0].threadKey!,
          mutedUntil: rawd.updateThreadMuteSetting[0].muteExpireTimeMs === -1 ? 'forever' : new Date(rawd.updateThreadMuteSetting[0].muteExpireTimeMs),
        }],
      }])
    } else if (rawd.upsertReaction) {
      this.papi.onEvent?.([{
        type: ServerEventType.STATE_SYNC,
        objectName: 'message_reaction',
        objectIDs: {
          threadID: rawd.upsertReaction[0].threadKey!,
          messageID: rawd.upsertReaction[0].messageId!,
        },
        mutationType: 'upsert',
        entries: [{
          id: rawd.upsertReaction[0].actorId!,
          reactionKey: rawd.upsertReaction[0].reaction!,
          participantID: rawd.upsertReaction[0].actorId!,
          emoji: true,
        }],
      }])
    }
    if (rawd.insertMessage) {
      // new message to send to the platform
      const rawm = rawd.insertMessage
      const messages = this.queryMessages(rawm[0].threadKey!, [rawm[0].messageId])
      this.logger.debug('insertMessage: queryMessages', messages)
      if (messages?.length > 0) {
        this.papi.onEvent?.([{
          type: ServerEventType.STATE_SYNC,
          objectName: 'message',
          objectIDs: { threadID: rawm[0].threadKey! },
          mutationType: 'upsert',
          entries: messages,
        }])
      }
    }

    if (rawd.updateReadReceipt) {
      for (const r of rawd.updateReadReceipt) {
        if (!r.readActionTimestampMs) continue
        const newestMessage = this.getNewestMessage(r.threadKey!)
        this.logger.debug('updateReadReceipt: newestMessage', newestMessage)
        const messages = this.queryMessages(r.threadKey, 'ALL')
        this.papi.onEvent?.([{
          type: ServerEventType.STATE_SYNC,
          objectName: 'message',
          objectIDs: { threadID: r.threadKey!, messageID: newestMessage.messageId! },
          mutationType: 'update',
          entries: messages,
        }])
      }
    }

    if (
      rawd.verifyContactRowExists?.length === 1
        && rawd.insertNewMessageRange?.length === 1
    ) {
      const { threadKey } = rawd.insertNewMessageRange[0]
      const [contact] = rawd.verifyContactRowExists
      if (String(threadKey) === String(contact.id)) {
        this.papi.onEvent?.([{
          type: ServerEventType.STATE_SYNC,
          objectIDs: { threadID: threadKey! },
          objectName: 'participant',
          mutationType: 'upsert',
          entries: [{
            id: threadKey!,
            fullName: contact.name,
            username: contact.username,
            imgURL: contact.profilePictureUrl,
          }],
        }])
      }
    }

    if (rawd.removeOptimisticGroupThread?.length > 0) {
      rawd.removeOptimisticGroupThread.forEach(t => {
        if (!t.offlineThreadingId) return
        this.papi?.onEvent([
          {
            type: ServerEventType.STATE_SYNC,
            mutationType: 'delete',
            objectName: 'thread',
            objectIDs: {},
            entries: [t.offlineThreadingId],
          },
        ])
      })
    }

    // wait for everything to be synced before resolving
    if (knownRequest && !rawd.issueNewError) {
      this.logger.debug(`[${requestId}] resolved request for ${requestType}`, rawd, payload)
      requestResolver(rawd)
    }
  }

  deleteThenInsertThread(_threads: ParsedPayload['deleteThenInsertThread']) {
    this.logger.debug('deleteThenInsertThread', _threads)

    const threads = _threads.map(t => {
      const { raw, threadKey, lastActivityTimestampMs, folderName, ...thread } = t

      // @TODO: parsers should handle this before we come here
      for (const key in thread) {
        if (typeof thread[key] === 'boolean') {
          thread[key] = thread[key] ? 1 : 0
        }
      }

      return {
        raw,
        threadKey,
        folderName,
        lastActivityTimestampMs: new Date(lastActivityTimestampMs),
        thread: JSON.stringify(thread),
      } as const
    })

    return this.papi.db.insert(schema.threads).values(threads).onConflictDoNothing().run()
  }

  verifyContactRowExists(contactRows: ParsedPayload['verifyContactRowExists']) {
    const mappedContacts = contactRows.map(c => {
      const { id, raw, name, profilePictureUrl, username, ...contact } = c
      return {
        raw,
        contact: JSON.stringify(contact),
        id,
        name,
        profilePictureUrl,
        username,
      }
    })
    return this.papi.db.insert(schema.contacts).values(mappedContacts).onConflictDoNothing().run()
  }

  addParticipantIdToGroupThread(participants: ParsedPayload['addParticipantIdToGroupThread']) {
    return this.papi.db.insert(schema.participants).values(participants).onConflictDoNothing().run()
  }

  upsertMessage(_messages: ParsedPayload['insertMessage'] | ParsedPayload['upsertMessage']) {
    this.logger.debug('upsertMessage', _messages)

    const messages = _messages.filter(m => m?.threadKey !== null).map(m => {
      const { raw, threadKey, messageId, offlineThreadingId, timestampMs, senderId, primarySortKey, ...message } = m

      // @TODO: parsers should handle this before we come here
      for (const key in message) {
        if (typeof message[key] === 'boolean') {
          message[key] = message[key] ? 1 : 0
          // if the value of the key is [9] then set to null
        } else if (Array.isArray(message[key]) && message[key].length === 1 && message[key][0] === 9) {
          message[key] = null
        }
      }

      return {
        raw,
        threadKey,
        messageId,
        offlineThreadingId,
        primarySortKey,
        timestampMs: new Date(timestampMs),
        senderId,
        message: JSON.stringify(message),
      } as const
    })

    return this.papi.db
      .insert(schema.messages)
      .values(messages)
      .onConflictDoNothing()
      .run()
  }

  addReactions(reactions: InferModel<typeof schema['reactions'], 'insert'>[]) {
    this.logger.debug('addReactions', reactions)
    return this.papi.db
      .insert(schema.reactions)
      .values(reactions)
      .onConflictDoNothing()
      .run()
  }

  upsertAttachments(_attachments: ParsedPayload['insertBlobAttachment'] | ParsedPayload['insertXmaAttachment']) {
    const attachments = _attachments.filter(a => !Array.isArray(a.playableUrl)).map(a => {
      const { raw, threadKey, messageId, attachmentFbid, timestampMs, offlineAttachmentId, ...attachment } = a

      // @TODO: parsers should handle this before we come here
      for (const key in attachment) {
        if (typeof attachment[key] === 'boolean') {
          attachment[key] = attachment[key] ? 1 : 0
        }
      }

      return {
        raw,
        threadKey,
        messageId,
        attachmentFbid,
        timestampMs: new Date(timestampMs),
        offlineAttachmentId,
        attachment: JSON.stringify(attachment),
      } as const
    })

    if (attachments.length === 0) {
      this.logger.error('upsertAttachments: no attachments to add', _attachments)
      return
    }

    return this.papi.db
      .insert(schema.attachments)
      .values(attachments)
      .onConflictDoNothing()
      .run()
  }

  updateReadReceipt(readReceipts: IGReadReceipt[]) {
    this.logger.info('addReadReceipts', readReceipts)
    const updatedReadReceipts = readReceipts.map(r => ({
      ...r,
      readWatermarkTimestampMs: new Date(r.readWatermarkTimestampMs),
      readActionTimestampMs: new Date(r.readActionTimestampMs),
    }))
    updatedReadReceipts.forEach(r => {
      this.logger.info('updating read receipt', r)
      return this.papi.db.update(schema.participants).set({ readActionTimestampMs: r.readActionTimestampMs, readWatermarkTimestampMs: r.readWatermarkTimestampMs })
        .where(and(
          eq(schema.participants.threadKey, r.threadKey),
          eq(schema.participants.userId, r.contactId),
        )).run()
    })
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

  getMessage(threadKey: string, messageId: string) {
    return this.papi.db
      .select({
        threadKey: schema.messages.threadKey,
        messageId: schema.messages.messageId,
        timestampMs: schema.messages.timestampMs,
      })
      .from(schema.messages)
      .limit(1)
      .where(eq(schema.messages.threadKey, threadKey))
      .where(eq(schema.messages.messageId, messageId))
      .get()
  }

  getOldestMessage(threadKey: string) {
    return this.papi.db
      .select({
        threadKey: schema.messages.threadKey,
        messageId: schema.messages.messageId,
        timestampMs: schema.messages.timestampMs,
      })
      .from(schema.messages)
      .limit(1)
      .where(eq(schema.messages.threadKey, threadKey))
      .orderBy(asc(schema.messages.timestampMs))
      .get()
  }

  getNewestMessage(threadKey: string) {
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
    const response = await this.httpRequest(INSTAGRAM_BASE_URL + 'api/v1/web/push/register/', {
      method: 'POST',
      body: formData,
      // todo: refactor headers
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114"',
        'sec-ch-ua-full-version-list':
          '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.198"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-ch-ua-platform-version': '"13.5.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'viewport-width': '1280',
        'x-asbd-id': '129477',
        'x-csrftoken': this.getCSRFToken(),
        'x-ig-app-id': APP_ID,
        'x-ig-www-claim': this.papi.kv.get('wwwClaim'),
        'x-requested-with': 'XMLHttpRequest',
        Referer: INSTAGRAM_BASE_URL,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    })
    const json = JSON.parse(response.body)
    if (json.status !== 'ok') {
      throw new Error(`webPushRegister failed: ${JSON.stringify(json, null, 2)}`)
    }
  }

  queryMessages(threadKey: string, messageIdsOrWhere: string[] | 'ALL' | QueryMessagesWhere): Message[] {
    let where: QueryMessagesWhere
    if (messageIdsOrWhere === 'ALL') {
      where = eq(messagesSchema.threadKey, threadKey)
    } else if (Array.isArray(messageIdsOrWhere)) {
      where = inArray(messagesSchema.messageId, messageIdsOrWhere)
    } else {
      where = messageIdsOrWhere
    }
    const messages = this.papi.db.query.messages.findMany({
      where,
      columns: {
        // raw: true,
        message: true,
        threadKey: true,
        messageId: true,
        offlineThreadingId: true,
        primarySortKey: true,
        timestampMs: true,
        senderId: true,
      },
      with: {
        attachments: {
          columns: {
            raw: false,
            attachmentFbid: true,
            attachment: true,
          },
        },
        reactions: true,
        thread: {
          with: {
            participants: {
              columns: {
                userId: true,
                isAdmin: true,
                readWatermarkTimestampMs: true,
              },
              with: {
                contacts: {
                  columns: {
                    id: true,
                    name: true,
                    username: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [asc(messagesSchema.primarySortKey)],
    })
    if (!messages || messages.length === 0) return []
    const { thread: t, participants } = messages[0].thread
    const thread = JSON.parse(t) as IGThreadInDB
    const fbid = this.papi.kv.get('fbid')
    return mapMessages(messages, {
      threadType: thread?.threadType === '1' ? 'single' : 'group',
      users: mapParticipants(participants, fbid),
      participants,
      fbid,
    })
  }

  async deleteThreadFromDB(threadKey: string) {
    this.papi.onEvent?.([{
      type: ServerEventType.STATE_SYNC,
      objectName: 'thread',
      objectIDs: { threadID: threadKey! },
      mutationType: 'delete',
      entries: [threadKey],
    }])

    this.papi.db.delete(schema.attachments).where(eq(schema.attachments.threadKey, threadKey)).run()
    this.papi.db.delete(schema.messages).where(eq(schema.messages.threadKey, threadKey)).run()
    this.papi.db.delete(schema.participants).where(eq(schema.participants.threadKey, threadKey)).run()
    this.papi.db.delete(schema.threads).where(eq(schema.threads.threadKey, threadKey)).run()
  }
}
