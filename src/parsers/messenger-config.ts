import { ReAuthError } from '@textshq/platform-sdk'
import { htmlTitleRegex } from '@textshq/platform-sdk/dist/json'
import { DatabaseSyncVariables } from '../types'
import Bitmap, { BootloaderHandlePayload } from './bitmap'
import { TypedMap } from '../util'

type SyncParams = {
  locale: string
}

type XIGSharedDataRawConfigViewer = {
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
  XIGSharedData: {
    native: {
      browser_push_pub_key: string
      bundle_variant: string
      cache_schema_version: number
      config: {
        csrf_token: string
        viewer: {
          basic_ads_tier: number
          is_basic_ads_opted_in: boolean
        }
        viewerId: string
      }
      consent_dialog_config: {
        is_user_linked_to_fb: boolean
        should_show_consent_dialog: boolean
      }
      country_code: string
      deployment_stage: string
      device_id: string
      entry_data: any
      frontend_env: string
      hostname: string
      is_allowlisted_crawl_bot: boolean
      is_e2e: boolean
      is_on_vpn: boolean
      language_code: string
      locale: string
      nonce: string
      platform_install_badge_links: {
        android: string
        ios: string
        windows_nt_10: string
      }
      privacy_flow_trigger: null | any
      rollout_hash: string
      send_device_id_header: boolean
      seo_crawl_bot: {
        is_allowlisted_crawl_bot: boolean
        is_google_crawl_bot: boolean
      }
      server_checks: {
        hfe: boolean
      }
      should_show_digital_collectibles_privacy_notice: boolean
      signal_collection_config: {
        sid: number
      }
      www_routing_config: {
        frontend_only_routes: Array<{
          destination: string
          path: string
        }>
      }
    }
    raw: string
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
  BootloaderConfig: {
    deferBootloads: boolean
    jsRetries: number[]
    jsRetryAbortNum: number
    jsRetryAbortTime: number
    silentDups: boolean
    timeout: number
    hypStep4: boolean
    phdOn: boolean
    btCutoffIndex: number
    fastPathForAlreadyRequired: boolean
    earlyRequireLazy: boolean
    enableTimeoutLoggingForNonComet: boolean
    translationRetries: number[]
    translationRetryAbortNum: number
    translationRetryAbortTime: number
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
  ServerAppID: {
    app_id: string
  }
  JSErrorLoggingConfig: {
    appId: number
    extra: any[]
    reportInterval: number
    sampleWeight: number
    sampleWeightKey: string
    projectBlocklist: any[]
  }
  WebConnectionClassServerGuess: {
    connectionClass: string
  }
  Bitmaps: {
    bitmap: Bitmap
    csrBitmap: Bitmap
  }
  Eqmc: {
    jazoest: string
    comet_req: string
    a: string
    user: string
  }
  SyncData: {
    needSync: boolean
    version: number
    links: string[]
    syncPayloads: string[]
  }
}
/*
const ignored_configs = [
  'CountryNamesConfig',
  'DateFormatConfig',
  'MAWMainWebWorkerResource',
  'PolarisLocales',
  'WebLoomConfig',
  'ZeroRewriteRules',
]
*/

type ConfigDefineType<T extends keyof Config> = [T, [], Config[T], number]
type ConfigDefine =
  | ConfigDefineType<'DTSGInitialData'>
  | ConfigDefineType<'LSD'>
  | ConfigDefineType<'LSPlatformMessengerSyncParams'>
  | ConfigDefineType<'MessengerWebInitData'>
  | ConfigDefineType<'MqttWebConfig'>
  | ConfigDefineType<'XIGSharedData'>
  | ConfigDefineType<'MqttWebDeviceID'>
  | ConfigDefineType<'CurrentUserInitialData'>
  | ConfigDefineType<'RelayAPIConfigDefaults'>
  | ConfigDefineType<'CurrentEnvironment'>
  | ConfigDefineType<'MercuryConfig'>
  | ConfigDefineType<'SprinkleConfig'>
  | ConfigDefineType<'BootloaderConfig'>
  | ConfigDefineType<'SiteData'>
  | ConfigDefineType<'IntlCurrentLocale'>
  | ConfigDefineType<'ServerAppID'>
  | ConfigDefineType<'JSErrorLoggingConfig'>
  | ConfigDefineType<'WebConnectionClassServerGuess'>
  | ConfigDefineType<'Bitmaps'>
  | ConfigDefineType<'Eqmc'>
  | ConfigDefineType<'SyncData'>

type InnerObject = {
  __bbox: {
    define?: ConfigDefine[]
    require?: (
      | ['CometPlatformRootClient' | `CometPlatformRootClient${string}`, 'init', string[], ({ variables: DatabaseSyncVariables })[][]]
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
  if (match && match[1]) {
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
    if (hasAnyId) {
      throw new ReAuthError(`Session expired, fbid: ${currentUser?.USER_ID}, igid: ${currentUser?.NON_FACEBOOK_USER_ID}, title: ${title}`)
    }
    throw new ReAuthError(`Session expired, title: ${title}`)
  }

  const definesMap = new TypedMap<Config>()
  const initialPayloads: string[] = []
  const bitmap = new Bitmap().init(false, false)
  const csrBitmap = new Bitmap()
  const syncData: Config['SyncData'] = {
    needSync: false,
    version: 0,
    links: [],
    syncPayloads: [],
  }

  scriptTags.forEach(scriptTag => {
    const startIndex = scriptTag.indexOf('{')
    const endIndex = scriptTag.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1) return
    const jsonContent = scriptTag.substring(startIndex, endIndex + 1)
    const parsedContent = JSON.parse(jsonContent) as {
      require: ['ScheduledServerJSWithCSS' | string, 'handle' | string, null, InnerObject[]][]
    }

    if (!parsedContent.require) {
      const content = JSON.parse(jsonContent)
      if (content.u) {
        const eqmc = new URLSearchParams('?' + content.u.split('/?')[1])
        definesMap.set('Eqmc', { jazoest: eqmc.get('jazoest'), a: eqmc.get('__a'), comet_req: eqmc.get('__comet_req'), user: eqmc.get('__user') })
      }
    } else {
      parsedContent.require.forEach(requireCall => {
        const mainCallName = requireCall[0]
        const methodName = requireCall[1]
        const methodData = requireCall[3]
        if (mainCallName === 'Bootloader' && methodName === 'handlePayload') {
          if (methodData && methodData.length > 0) {
            const csrData = (methodData as any[])[0] as BootloaderHandlePayload
            if (csrData.rsrcMap) {
              csrBitmap.updateCsrBitmap(csrData)
            }
          }
        }
        if (mainCallName !== 'ScheduledServerJS') return
        methodData.forEach(obj => {
          const bbox = obj.__bbox
          if (!bbox) return
          bbox.define?.forEach(([callName, , data, configId]) => {
            if (callName === 'BootloaderConfig') {
              bitmap.phdOn = data.phdOn
              csrBitmap.init(data.phdOn, true)
            }

            if (configId > 0) {
              bitmap.updateBitmap(configId)
            }
            definesMap.set(callName, data)
          })

          bbox.require?.forEach(req => {
            const m = req[0]
            const method = req[1]
            if (m.startsWith('CometPlatformRootClient')) {
              if (method === 'init') {
                const data = req[3]
                const syncPayloads = data[4]
                console.log('syncpayloads:', syncPayloads)
                if (!syncPayloads) return

                for (const payload of syncPayloads) {
                  if (!payload?.variables?.requestPayload) {
                    console.error('no requestPayload:', payload)
                    continue
                  }
                  const { variables } = payload
                  const parsedRequestPayload = JSON.parse(variables.requestPayload)
                  console.log('parsedRequestPayload:', parsedRequestPayload)
                  if (parsedRequestPayload.version) {
                    syncData.version = parsedRequestPayload.version
                    console.log('found version:', syncData.version)
                  }
                  syncData.syncPayloads.push(JSON.stringify(variables))
                }
              }
              return
            }
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
    }
  })

  const syncParams = definesMap.get('LSPlatformMessengerSyncParams')
  const LSPlatformMessengerSyncParams = {
    ...(syncParams || {}),
    contact: syncParams?.contact ? JSON.parse(syncParams.contact) as SyncParams : undefined,
  }

  // instagram-only
  const igSharedData = definesMap.get('XIGSharedData')
  const XIGSharedData = {
    ...(igSharedData || {}),
    raw: igSharedData?.raw ? JSON.parse(igSharedData.raw) as {
      config: {
        viewer: XIGSharedDataRawConfigViewer
      }
    } : undefined,
  }

  const CurrentEnvironment = pickMessengerEnv(definesMap.get('CurrentEnvironment'))
  const MqttWebConfig = definesMap.get('MqttWebConfig')
  const MercuryConfig = definesMap.get('MercuryConfig')
  const MessengerWebInitData = definesMap.get('MessengerWebInitData')

  if (CurrentEnvironment === 'IG') {
    // MqttWebConfig.endpoint is wrong for IG
    // there is MqttWebConfig.hostNameOverride, but it's unclear how it's implemented
    MqttWebConfig.endpoint = MqttWebConfig.endpoint.replace('.facebook.com', '.instagram.com')
    MqttWebConfig.appID = MessengerWebInitData.appId
  }

  if (syncData.version === 0) {
    syncData.needSync = true
    const htmlLinkRegex = /<link\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1.*?>/g
    const linkMatches = html.matchAll(htmlLinkRegex)
    for (const match of linkMatches) {
      if (match[0].includes('as="script"')) {
        syncData.links.push(match[2])
      }
    }
  }

  return {
    CurrentEnvironment,
    CurrentUserInitialData: definesMap.get('CurrentUserInitialData'),
    DTSGInitialData: definesMap.get('DTSGInitialData'),
    initialPayloads: initialPayloads.filter(Boolean),
    LSD: definesMap.get('LSD'),
    LSPlatformMessengerSyncParams,
    MercuryConfig,
    ServerAppID: definesMap.get('ServerAppID'),
    MessengerWebInitData,
    MqttWebConfig,
    MqttWebDeviceID: definesMap.get('MqttWebDeviceID'),
    RelayAPIConfigDefaults: definesMap.get('RelayAPIConfigDefaults'),
    SiteData: definesMap.get('SiteData'),
    SprinkleConfig: definesMap.get('SprinkleConfig'),
    XIGSharedData,
    IntlCurrentLocale: definesMap.get('IntlCurrentLocale'),
    JSErrorLoggingConfig: definesMap.get('JSErrorLoggingConfig'),
    WebConnectionClassServerGuess: definesMap.get('WebConnectionClassServerGuess'),
    Bitmaps: {
      bitmap,
      csrBitmap,
    },
    Eqmc: definesMap.get('Eqmc'),
    SyncData: syncData,
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
  const parsed = parseMessengerInitialPage(html)
  const igViewerConfig = parsed.XIGSharedData?.raw?.config?.viewer // instagram-only
  return {
    env: parsed.CurrentEnvironment,
    appId: String(parsed.MqttWebConfig.appID),
    clientId: parsed.MqttWebDeviceID?.clientID,
    fb_dtsg: parsed.DTSGInitialData?.token,
    fbid: parsed.CurrentUserInitialData?.IG_USER_EIMU || parsed.CurrentUserInitialData?.ACCOUNT_ID, // if not instagram
    name: parsed.CurrentUserInitialData?.NAME,
    igViewerConfig,
    igUserId: igViewerConfig?.id,
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
    bitmaps: parsed.Bitmaps,
    eqmc: parsed.Eqmc,
    server_app_id: parsed.ServerAppID.app_id,
    jsErrorLogging: parsed.JSErrorLoggingConfig,
    webConnectionClassServerGuess: parsed.WebConnectionClassServerGuess,
    webSessionId: '',
    syncData: parsed.SyncData,
  }
}

export type MessengerConfig = ReturnType<typeof getMessengerConfig>
