import path from 'path'
import os from 'os'
import fs from 'fs'
import { texts, ReAuthError } from '@textshq/platform-sdk'
import { htmlTitleRegex } from '@textshq/platform-sdk/dist/json'
import { TypedMap } from '../util'

type SyncParams = {
  locale: string
}

export interface Config {
  DTSGInitialData: {
    token: string
  }
  LSD: {
    token: string
  }
  LSPlatformMessengerSyncParams: {
    contact: string
    e2ee: string
    mailbox: string
  }
  MessengerWebInitData: {
    accountKey: string
    appId: number
    cryptoAuthToken: {
      encrypted_serialized_cat: string
      expiration_time_in_seconds: number
    }
    logoutToken: string
    sessionId: string
  }
  MqttWebConfig: {
    appID: number
    capabilities: number
    chatVisibility: boolean
    clientCapabilities: number
    endpoint: string
    fbid: string
    hostNameOverride: string
    pollingEndpoint: string
    subscribedTopics: any[]
  }
  PolarisViewer: {
    data: {
      has_phone_number: boolean
      has_profile_pic: boolean
      hide_like_and_view_counts: boolean
      is_supervised_user: boolean
      guardian_id: null | string
      is_professional_account: boolean
      is_supervision_enabled: boolean
      profile_pic_url_hd: string
      badge_count: string
      biography: string
      business_contact_method: null | string
      can_follow_hashtag: boolean
      can_see_organic_insights: boolean
      category_name: null | string
      external_url: string
      fbid: string
      full_name: string
      id: string
      is_business_account: boolean
      is_joined_recently: boolean
      is_user_in_canada: boolean
      is_private: boolean
      profile_pic_url: string
      should_show_category: null | string
      should_show_public_contacts: null | string
      username: string
      is_basic_ads_opted_in: boolean
      basic_ads_tier: number
      probably_has_app: boolean
    }
    id: string
  }
  MqttWebDeviceID: {
    clientID: string
  }
  CurrentUserInitialData: {
    ACCOUNT_ID: string
    APP_ID: string
    EPOU_ID?: string
    HAS_SECONDARY_BUSINESS_PERSON: boolean
    HAS_WORK_USER?: boolean
    IG_USER_EIMU: string
    IS_BUSINESS_DOMAIN: boolean
    IS_BUSINESS_PERSON_ACCOUNT: boolean
    IS_DEACTIVATED_ALLOWED_ON_MESSENGER: boolean
    IS_EMPLOYEE: boolean
    IS_ENTERPRISE_USER?: boolean
    IS_FACEBOOK_WORK_ACCOUNT: boolean
    IS_GRAY?: boolean
    IS_INSTAGRAM_USER: number
    IS_INTERN_SITE?: boolean
    IS_MESSENGER_CALL_GUEST_USER: boolean
    IS_MESSENGER_ONLY_USER: boolean
    IS_META_SPARK_USER?: boolean
    IS_TEST_USER: boolean
    IS_TOGETHER_APP_USER?: boolean
    IS_UNDERAGE?: boolean
    IS_WORKROOMS_USER: boolean
    IS_WORK_MESSENGER_CALL_GUEST_USER: boolean
    IS_WORK_USER?: boolean
    NAME: string
    NON_FACEBOOK_USER_ID: string
    ORIGINAL_USER_ID?: string
    PAGE_MESSAGING_MAILBOX_ID?: string
    SHORT_NAME: string
    USER_ID: string
    WORK_USER_ID?: string
  }
  RelayAPIConfigDefaults: {
    accessToken: string
    actorID: string
    customHeaders: {
      'X-IG-App-ID': string
      'X-IG-D': string
    }
    enableNetworkLogger: boolean
    fetchTimeout: number
    graphBatchURI: string
    graphURI: string
    retryDelays: number[]
    useXController: boolean
    xhrEncoding: null | string
    subscriptionTopicURI: null | string
    withCredentials: boolean
    isProductionEndpoint: boolean
    workRequestTaggingProduct: null | string
    encryptionKeyParams: null | string
  }
  CurrentEnvironment: {
    facebookdotcom: boolean
    messengerdotcom: boolean
    workplacedotcom: boolean
    instagramdotcom: boolean
    workdotmetadotcom: boolean
  }
  MercuryConfig: {
    DYIDeepLink: string
    SearchMorePeople: number
    MontageThreadViewer: boolean
    msgr_region: string
    'roger.seen_delay': number
    activity_limit: number
    idle_limit: number
    idle_poll_interval: number
    LOG_INTERVAL_MS: number
    MaxThreadResults: number
    MessengerAppID: string
    upload_url: string
    WWWMessengerMontageLWR: boolean
    Mentions: boolean
    Reactions: boolean
    WWWSyncHolesLogging: boolean
    MNFWD: boolean
    MNNSS: boolean
    MNSIF: boolean
    MessengerForwardButtonForSharedFilesGK: boolean
    ShowInviteSurface: boolean
    AllowCoworkerInvites: boolean
    MNGPS: boolean
    ChatComposer: boolean
    ChatGroupChat: boolean
    MessengerGroupCreationUseMNetQE: boolean
    DFFD: 0
    MNWNS: boolean
    ShouldGameTextStartGame: boolean
    ShouldGameIconStartGame: boolean
    ShowBiggerGameIcon: boolean
    M3CRE: boolean
    SM3BD: boolean
    RTPE: boolean
    RTVE: boolean
    RTSE: boolean
    RTGE: boolean
    RTOAE: boolean
    ShowInGameChat: boolean
    IVITP: boolean
    WorkSyncedGroupAutoCreateEnabled: boolean
    WorkSyncedGroupEntryPointEnabled: boolean
  }
  SprinkleConfig: {
    param_name: string
    version: number
    should_randomize: boolean
  }
  SiteData: {
    server_revision: number
    client_revision: number
    tier: string
    push_phase: string
    pkg_cohort: string
    haste_session: string
    pr: number
    haste_site: string
    manifest_base_uri: string
    manifest_origin: string
    manifest_version_prefix: string
    be_one_ahead: boolean
    is_rtl: boolean
    is_comet: boolean
    is_experimental_tier: boolean
    is_jit_warmed_up: boolean
    hsi: string
    semr_host_bucket: string
    bl_hash_version: number
    skip_rd_bl: boolean
    comet_env: number
    wbloks_env: boolean
    spin: number
    __spin_r: number
    __spin_b: string
    __spin_t: number
    vip: string
  }
  IntlCurrentLocale: {
    code: string
  }
}

type ConfigDefineType<T extends keyof Config> = [T, [], Config[T], number]
type ConfigDefine =
  | ConfigDefineType<'DTSGInitialData'>
  | ConfigDefineType<'LSD'>
  | ConfigDefineType<'LSPlatformMessengerSyncParams'>
  | ConfigDefineType<'MessengerWebInitData'>
  | ConfigDefineType<'MqttWebConfig'>
  | ConfigDefineType<'PolarisViewer'>
  | ConfigDefineType<'MqttWebDeviceID'>
  | ConfigDefineType<'CurrentUserInitialData'>
  | ConfigDefineType<'RelayAPIConfigDefaults'>
  | ConfigDefineType<'CurrentEnvironment'>
  | ConfigDefineType<'MercuryConfig'>
  | ConfigDefineType<'SprinkleConfig'>
  | ConfigDefineType<'SiteData'>
  | ConfigDefineType<'IntlCurrentLocale'>

type InnerObject = {
  __bbox: {
    define?: ConfigDefine[]
    require?: (
      | ['CometPlatformRootClient' | `CometPlatformRootClient${string}`, 'init', string[], ({ variables: any })[][]]
      | ['RelayPrefetchedStreamCache' | `RelayPrefetchedStreamCache${string}`, 'next', [], any[]]
    )[]
    instances?: any[][]
  }
}

export function getNumericValue(config: Config['SprinkleConfig'], str: string) {
  let sum = 0
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i)
  const result = sum.toString()
  return config.should_randomize ? result : `${config.version}${result}`
}

function pickMessengerEnv(env: Config['CurrentEnvironment']) {
  if (env.instagramdotcom) return 'IG'
  if (env.messengerdotcom) return 'MESSENGER'
  if (env.workdotmetadotcom) return 'WORKMETA'
  if (env.workplacedotcom) return 'WORK'
  if (env.facebookdotcom) return 'FB' // this can return `true` for instagram
  throw new Error('Unknown Meta Messenger environment')
}

const findCurrentUserInitialData = (htmlString: string) => {
  const regex = /,\["CurrentUserInitialData",\[\],(.*?),\d+\]/
  const match = htmlString.match(regex)
  if (match?.[1]) {
    return JSON.parse(match[1]) as Config['CurrentUserInitialData']
  }
  return null
}

export function parseMessengerInitialPage(html: string) {
  const scriptTags = html.match(/type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/g) || []
  if (!scriptTags.length) { // probably the login page
    // this is only parsed to see different cases of zero script tags (for debugging)
    const currentUser = findCurrentUserInitialData(html)
    const hasIgUserId = currentUser?.NON_FACEBOOK_USER_ID?.toString()?.length > 1
    const hasUserId = !!currentUser?.USER_ID?.toString()?.length
    const hasAnyId = hasIgUserId || hasUserId
    const [, title] = htmlTitleRegex.exec(html) || []
    if (texts.isLoggingEnabled) {
      fs.writeFileSync(path.join(os.homedir(), `Desktop/meta-login-error-${Date.now()}.html`), html)
    }
    throw new ReAuthError(hasAnyId
      ? `Session expired, fbid: ${currentUser?.USER_ID}, igid: ${currentUser?.NON_FACEBOOK_USER_ID}, title: ${title}`
      : `Session expired, title: ${title}`)
  }

  const definesMap = new TypedMap<Config>()
  const initialPayloads: string[] = []

  scriptTags.forEach(scriptTag => {
    const startIndex = scriptTag.indexOf('{')
    const endIndex = scriptTag.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1) return
    const jsonContent = scriptTag.substring(startIndex, endIndex + 1)
    const parsedContent = JSON.parse(jsonContent) as {
      require: ['ScheduledServerJSWithCSS' | string, 'handle', null, InnerObject[]][]
    }

    if (!parsedContent.require) return
    parsedContent.require.forEach(requireCall => {
      const mainCallName = requireCall[0]
      if (mainCallName !== 'ScheduledServerJS') return
      requireCall[3].forEach(obj => {
        const bbox = obj.__bbox
        if (!bbox) return
        bbox.define?.forEach(define => {
          const callName = define[0]
          if (
            callName.startsWith('cr:')
            || callName.startsWith('nux:')
            || [
              'CountryNamesConfig',
              'DateFormatConfig',
              'MAWMainWebWorkerResource',
              'PolarisLocales',
              'WebLoomConfig',
              'ZeroRewriteRules',
            ].includes(callName)) return
          definesMap.set(callName, define[2])
        })
        bbox.require?.forEach(req => {
          const m = req[0]
          if (!m.startsWith('RelayPrefetchedStreamCache')) return
          req?.[3]?.forEach((p: any) => {
            if (typeof p === 'string') return
            const data = p?.__bbox?.result?.data
            const payload = data?.viewer?.lightspeed_web_request?.payload
            if (payload?.length > 0) {
              initialPayloads.push(payload)
            }
            const igPayload = data?.lightspeed_web_request_for_igd?.payload
            if (igPayload?.length > 0) {
              initialPayloads.push(igPayload)
            }
          })
        })
      })
    })
  })

  const syncParams = definesMap.get('LSPlatformMessengerSyncParams')
  const LSPlatformMessengerSyncParams = {
    ...(syncParams || {}),
    contact: syncParams?.contact ? JSON.parse(syncParams.contact) as SyncParams : undefined,
  }

  // instagram-only
  const PolarisViewer = definesMap.get('PolarisViewer')

  const CurrentEnvironment = pickMessengerEnv(definesMap.get('CurrentEnvironment'))
  const MqttWebConfig = definesMap.get('MqttWebConfig')
  const MercuryConfig = definesMap.get('MercuryConfig')

  if (CurrentEnvironment === 'IG') {
    // MqttWebConfig.endpoint is wrong for IG
    // there is MqttWebConfig.hostNameOverride, but it's unclear how it's implemented
    MqttWebConfig.endpoint = MqttWebConfig.endpoint.replace('.facebook.com', '.instagram.com')
  }

  return {
    CurrentEnvironment,
    CurrentUserInitialData: definesMap.get('CurrentUserInitialData'),
    DTSGInitialData: definesMap.get('DTSGInitialData'),
    initialPayloads: initialPayloads.filter(Boolean),
    LSD: definesMap.get('LSD'),
    LSPlatformMessengerSyncParams,
    MercuryConfig,
    MessengerWebInitData: definesMap.get('MessengerWebInitData'),
    MqttWebConfig,
    MqttWebDeviceID: definesMap.get('MqttWebDeviceID'),
    RelayAPIConfigDefaults: definesMap.get('RelayAPIConfigDefaults'),
    SiteData: definesMap.get('SiteData'),
    SprinkleConfig: definesMap.get('SprinkleConfig'),
    PolarisViewer,
    IntlCurrentLocale: definesMap.get('IntlCurrentLocale'),
  } as const
}

export function getCurrentUser(currentUserInitialData: Config['CurrentUserInitialData'], getCookie: (key: string) => string) {
  const getID = () => currentUserInitialData.USER_ID
  const getAccountID = () => currentUserInitialData.ACCOUNT_ID
  const getPossiblyNonFacebookUserID = () => (currentUserInitialData.NON_FACEBOOK_USER_ID != null ? currentUserInitialData.NON_FACEBOOK_USER_ID : getID())
  const getEIMU = () => (currentUserInitialData.IG_USER_EIMU != null ? currentUserInitialData.IG_USER_EIMU : '0')
  const getEmployeeWorkUserID = () => currentUserInitialData.WORK_USER_ID
  const getName = () => currentUserInitialData.NAME
  const getShortName = () => currentUserInitialData.SHORT_NAME
  const getEPOU = () => (currentUserInitialData.EPOU_ID != null ? currentUserInitialData.EPOU_ID : '0')
  const isLoggedIn = () => getPossiblyNonFacebookUserID() !== '0'
  const isLoggedInNow = () => isLoggedIn()
    && (
      currentUserInitialData.IS_INTERN_SITE
      || currentUserInitialData.IS_WORK_USER
      || currentUserInitialData.IS_WORKROOMS_USER
      || currentUserInitialData.IS_WORK_MESSENGER_CALL_GUEST_USER
      || currentUserInitialData.IS_TOGETHER_APP_USER
      || currentUserInitialData.IS_ENTERPRISE_USER
      || currentUserInitialData.IS_INSTAGRAM_USER
      || currentUserInitialData.IS_META_SPARK_USER
      || (
        currentUserInitialData.ORIGINAL_USER_ID != null
        && currentUserInitialData.ORIGINAL_USER_ID !== ''
          ? currentUserInitialData.ORIGINAL_USER_ID === getCookie('c_user')
          : currentUserInitialData.IS_BUSINESS_DOMAIN
            ? currentUserInitialData.USER_ID === getCookie('c_user')
            : currentUserInitialData.USER_ID === (
              getCookie('i_user') != null
                ? getCookie('i_user')
                : getCookie('c_user')
            )
      )
    )
  const isEmployee = () => !!currentUserInitialData.IS_EMPLOYEE
  const isTestUser = () => !!currentUserInitialData.IS_TEST_USER
  const hasWorkUser = () => !!currentUserInitialData.HAS_WORK_USER
  const isWorkUser = () => !!currentUserInitialData.IS_WORK_USER
  const isWorkroomsUser = () => !!currentUserInitialData.IS_WORKROOMS_USER
  const isGray = () => !!currentUserInitialData.IS_GRAY
  const isUnderage = () => !!currentUserInitialData.IS_UNDERAGE
  const isMessengerOnlyUser = () => !!currentUserInitialData.IS_MESSENGER_ONLY_USER
  const isDeactivatedAllowedOnMessenger = () => !!currentUserInitialData.IS_DEACTIVATED_ALLOWED_ON_MESSENGER
  const isMessengerCallGuestUser = () => !!currentUserInitialData.IS_MESSENGER_CALL_GUEST_USER
  const isBusinessPersonAccount = () => currentUserInitialData.IS_BUSINESS_PERSON_ACCOUNT
  const hasSecondaryBusinessPerson = () => currentUserInitialData.HAS_SECONDARY_BUSINESS_PERSON
  const getAppID = () => currentUserInitialData.APP_ID
  const isFacebookWorkAccount = () => currentUserInitialData.IS_FACEBOOK_WORK_ACCOUNT
  const getPageMessagingMailboxId = () => String(currentUserInitialData.PAGE_MESSAGING_MAILBOX_ID != null ? currentUserInitialData.PAGE_MESSAGING_MAILBOX_ID : '0')

  return {
    getID,
    getAccountID,
    getPossiblyNonFacebookUserID,
    getEIMU,
    getEmployeeWorkUserID,
    getName,
    getShortName,
    getEPOU,
    isLoggedIn,
    isLoggedInNow,
    isEmployee,
    isTestUser,
    hasWorkUser,
    isWorkUser,
    isWorkroomsUser,
    isGray,
    isUnderage,
    isMessengerOnlyUser,
    isDeactivatedAllowedOnMessenger,
    isMessengerCallGuestUser,
    isBusinessPersonAccount,
    hasSecondaryBusinessPerson,
    getAppID,
    isFacebookWorkAccount,
    getPageMessagingMailboxId,
  }
}

export function getMessengerConfig(html: string) {
  if (!html) throw Error('html is empty')
  const parsed = parseMessengerInitialPage(html)
  return {
    env: parsed.CurrentEnvironment,
    appId: String(parsed.MessengerWebInitData?.appId),
    clientId: parsed.MqttWebDeviceID?.clientID,
    fb_dtsg: parsed.DTSGInitialData?.token,
    fbid: parsed.CurrentUserInitialData?.IG_USER_EIMU || parsed.CurrentUserInitialData?.ACCOUNT_ID, // if not instagram
    name: parsed.CurrentUserInitialData?.NAME,
    polarisViewer: parsed.PolarisViewer,
    lsdToken: parsed.LSD?.token,
    siteData: parsed.SiteData,
    mqttEndpoint: parsed.MqttWebConfig?.endpoint,
    mqttCapabilities: parsed.MqttWebConfig?.capabilities,
    mqttClientCapabilities: parsed.MqttWebConfig?.clientCapabilities,
    syncParams: parsed.LSPlatformMessengerSyncParams,
    initialPayloads: parsed.initialPayloads,
    gqlEndpointPath: parsed.RelayAPIConfigDefaults.graphURI,
    gqlCustomHeaders: parsed.RelayAPIConfigDefaults.customHeaders,
    sprinkleConfig: parsed.SprinkleConfig,
    currentLocale: parsed.IntlCurrentLocale?.code,
  }
}

export type MessengerConfig = ReturnType<typeof getMessengerConfig>
