import Bitmap from './bitmap'

export interface XIGConfigData {
  config: {
    csrf_token?: string
    viewer?: ViewerData
    viewerId?: string
  }
  country_code?: string
  language_code?: string
  locale?: string
  hostname?: string
  is_whitelisted_crawl_bot?: boolean
  connection_quality_rating?: string
  deployment_stage?: string
  platform?: string
  nonce?: string
  mid_pct?: number
  cache_schema_version?: number
  device_id?: string
  browser_push_pub_key?: string
  encryption?: {
    key_id?: string
    public_key?: string
    version?: string
  }
  is_dev?: boolean
  is_on_vpn?: boolean
  signal_collection_config?: {
    bbs?: number
    ctw?: any
    dbs?: number
    fd?: number
    hbc?: {
      hbbi?: number
      hbcbc?: number
      hbi?: number
      hbv?: string
      hbvbc?: number
    }
    i?: number
    rt?: any
    sbs?: number
    sc?: {
      c?: number[][]
      t?: number
    }
    sid?: number
  }
  consent_dialog_config?: {
    is_user_linked_to_fb?: boolean
    should_show_consent_dialog?: boolean
  }
  privacy_flow_trigger?: any
  www_routing_config?: {
    frontend_and_proxygen_routes?: {
      path?: string
      destination?: string
    }[]
    frontend_only_routes?: {
      path?: string
      destination?: string
    }[]
    proxygen_request_handler_only_routes?: {
      paths?: string[]
      destination?: string
      in_vpn_dogfooding?: boolean
      in_qe?: boolean
    }[]
  }
  should_show_digital_collectibles_privacy_notice?: boolean
  rollout_hash?: string
  bundle_variant?: string
  frontend_env?: string
}

export interface ViewerData {
  biography?: string
  business_address_json?: any
  business_contact_method?: string
  business_email?: string
  business_phone_number?: any
  can_see_organic_insights?: boolean
  category_name?: any
  external_url?: string
  fbid?: string
  full_name?: string
  has_phone_number?: boolean
  has_profile_pic?: boolean
  has_tabbed_inbox?: boolean
  hide_like_and_view_counts?: boolean
  id?: string
  is_business_account?: boolean
  is_joined_recently?: boolean
  is_supervised_user?: boolean
  guardian_id?: any
  is_private?: boolean
  is_professional_account?: boolean
  is_supervision_enabled?: boolean
  is_user_in_canada?: boolean
  profile_pic_url?: string
  profile_pic_url_hd?: string
  should_show_category?: boolean
  should_show_public_contacts?: boolean
  username?: string
  badge_count?: string
  is_basic_ads_opted_in?: boolean
  basic_ads_tier?: number
  probably_has_app?: boolean
}

export type XIGSharedDataRawConfigViewer = {
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

export interface InstagramSharedData {
  config: {
    csrf_token: string
    viewer: XIGSharedDataRawConfigViewer | null
    viewerId: string | null
  }
  country_code: string
  language_code: string
  locale: string
  entry_data: Record<string, any>
  hostname: string
  is_whitelisted_crawl_bot: boolean
  connection_quality_rating: string
  deployment_stage: string
  platform: string
  nonce: string
  mid_pct: number
  zero_data: Record<string, any>
  cache_schema_version: number
  server_checks: Record<string, any>
  device_id: string
  browser_push_pub_key: string
  encryption: {
    key_id: string
    public_key: string
    version: string
  }
  is_dev: boolean
  consent_dialog_config: {
    is_user_linked_to_fb: boolean
    should_show_consent_dialog: boolean
  }
  privacy_flow_trigger: any
  should_show_digital_collectibles_privacy_notice: boolean
  rollout_hash: string
  bundle_variant: string
  frontend_env: string
}

export interface LSPlatformGraphQLLightspeedVariables {
  database?: number
  epochId: string
  syncParams?: any
  lastAppliedCursor: any
  version?: number
}

export interface GraphQLPreloader {
  actorID?: any
  preloaderID?: string
  queryID?: string
  variables?: any
}

export interface Variables {
  deviceId?: string
  includeChatVisibility?: boolean
  requestId?: number
  requestPayload?: string
  requestType?: number
}

export type SyncParams = {
  locale: string
}

export interface ModuleEntry {
  name: string
  data: unknown[] | unknown[][]
}

export interface BBoxContainer {
  __bbox?: BBox
}

export interface BBox {
  require: ModuleEntry[]
  define: ModuleEntry[]
  // Might also contain instances, markup, elements, contexts
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
    syncPayloads: {
      deviceId: string
      requestId: number
      requestPayload: string
      requestType: number
    }[]
  }
}

type ConfigDefineType<T extends keyof Config> = [T, [], Config[T], number]
export type ConfigDefine =
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
  | ConfigDefineType<'BootloaderConfig'>
  | ConfigDefineType<'SiteData'>
  | ConfigDefineType<'IntlCurrentLocale'>
  | ConfigDefineType<'ServerAppID'>
  | ConfigDefineType<'JSErrorLoggingConfig'>
  | ConfigDefineType<'WebConnectionClassServerGuess'>
  | ConfigDefineType<'Bitmaps'>
  | ConfigDefineType<'Eqmc'>
  | ConfigDefineType<'SyncData'>

interface RPSCBBox {
  complete: boolean
  result: any // json.RawMessage translates to any in TypeScript
}

interface RPSCBBoxContainer {
  __bbox: RPSCBBox | null
}

export interface RelayPrefetchedStreamCache {
  preloadID: string
  bbox: RPSCBBoxContainer | null
}
