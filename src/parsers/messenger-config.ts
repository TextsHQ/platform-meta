import { EnvKey } from '../env'

type InnerObject = {
  __bbox: BboxEntry
}

type BboxEntry = {
  define?: [string, [], unknown, number][]
  require?: any[][]
  instances?: any[][]
}

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
    USER_ID: string
    NAME: string
    SHORT_NAME: string
    IS_BUSINESS_PERSON_ACCOUNT: boolean
    HAS_SECONDARY_BUSINESS_PERSON: boolean
    IS_FACEBOOK_WORK_ACCOUNT: boolean
    IS_MESSENGER_ONLY_USER: boolean
    IS_DEACTIVATED_ALLOWED_ON_MESSENGER: boolean
    IS_MESSENGER_CALL_GUEST_USER: boolean
    IS_WORK_MESSENGER_CALL_GUEST_USER: boolean
    IS_WORKROOMS_USER: boolean
    APP_ID: string
    IS_BUSINESS_DOMAIN: boolean
    NON_FACEBOOK_USER_ID: string
    IS_INSTAGRAM_USER: number
    IG_USER_EIMU: string
    IS_EMPLOYEE: boolean
    IS_TEST_USER: boolean
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
}

export function getNumericValue(config: Config['SprinkleConfig'], str: string) {
  let sum = 0
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i)
  const result = sum.toString()
  return config.should_randomize ? result : `${config.version}${result}`
}

function pickMessengerEnv(env: Config['CurrentEnvironment']): EnvKey {
  if (env.instagramdotcom) return 'IG'
  if (env.messengerdotcom) return 'MESSENGER'
  if (env.workdotmetadotcom) return 'WORKMETA'
  if (env.workplacedotcom) return 'WORK'
  if (env.facebookdotcom) return 'FB' // this can return `true` for instagram
  throw new Error('Unknown Meta Messenger environment')
}

export function parseMessengerInitialPage(html: string) {
  const scriptTags = html.match(/type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/g) || []

  const definesMap = new Map<string, unknown>()
  const initialPayloads: string[] = []
  scriptTags.forEach(scriptTag => {
    const startIndex = scriptTag.indexOf('{')
    const endIndex = scriptTag.lastIndexOf('}')

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonContent = scriptTag.substring(startIndex, endIndex + 1)
      const parsedContent = JSON.parse(jsonContent) as {
        require: ['ScheduledServerJSWithCSS' | string, 'handle', null, InnerObject[]][]
      }

      if (parsedContent.require) {
        parsedContent.require.forEach(requireCall => {
          const mainCallName = requireCall[0]
          if (mainCallName !== 'ScheduledServerJS') return
          requireCall[3].forEach(obj => {
            const bbox = obj.__bbox
            if (bbox) {
              bbox.define?.forEach(define => {
                const callName = define[0]
                if (
                  callName.startsWith('cr:')
                  || callName.startsWith('nux:')
                  || [
                    'PolarisLocales',
                    'ZeroRewriteRules',
                    'CountryNamesConfig',
                    'DateFormatConfig',
                    'MAWMainWebWorkerResource',
                    'WebLoomConfig',
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
            }
          })
        })
      }
    }
  })

  const syncParams = definesMap.get('LSPlatformMessengerSyncParams') as Config['LSPlatformMessengerSyncParams']
  const LSPlatformMessengerSyncParams = {
    ...(syncParams || {}),
    contact: syncParams?.contact ? JSON.parse(syncParams.contact) as SyncParams : undefined,
  }

  // instagram-only
  const igSharedData = definesMap.get('XIGSharedData') as Config['XIGSharedData']
  const XIGSharedData = {
    ...(igSharedData || {}),
    raw: igSharedData?.raw ? JSON.parse(igSharedData.raw) as {
      config: {
        viewer: XIGSharedDataRawConfigViewer
      }
    } : undefined,
  }

  const CurrentEnvironment = pickMessengerEnv(definesMap.get('CurrentEnvironment') as Config['CurrentEnvironment'])
  const MqttWebConfig = definesMap.get('MqttWebConfig') as Config['MqttWebConfig']
  const MercuryConfig = definesMap.get('MercuryConfig') as Config['MercuryConfig']

  if (CurrentEnvironment === 'IG') {
    // MqttWebConfig.endpoint is wrong for IG
    // there is MqttWebConfig.hostNameOverride, but it's unclear how it's implemented
    MqttWebConfig.endpoint = MqttWebConfig.endpoint.replace('.facebook.com', '.instagram.com')
  }

  return {
    CurrentUserInitialData: definesMap.get('CurrentUserInitialData') as Config['CurrentUserInitialData'],
    DTSGInitialData: definesMap.get('DTSGInitialData') as Config['DTSGInitialData'],
    LSD: definesMap.get('LSD') as Config['LSD'],
    LSPlatformMessengerSyncParams,
    MessengerWebInitData: definesMap.get('MessengerWebInitData') as Config['MessengerWebInitData'],
    SprinkleConfig: definesMap.get('SprinkleConfig') as Config['SprinkleConfig'],
    MercuryConfig,
    MqttWebConfig,
    MqttWebDeviceID: definesMap.get('MqttWebDeviceID') as Config['MqttWebDeviceID'],
    RelayAPIConfigDefaults: definesMap.get('RelayAPIConfigDefaults') as Config['RelayAPIConfigDefaults'],
    XIGSharedData,
    CurrentEnvironment,
    initialPayloads: initialPayloads.filter(Boolean),
  } as const
}

export function getMessengerConfig(html: string) {
  const parsed = parseMessengerInitialPage(html)
  const igViewerConfig = parsed.XIGSharedData?.raw?.config?.viewer // instagram-only
  return {
    env: parsed.CurrentEnvironment,
    appId: String(parsed.MessengerWebInitData?.appId),
    clientId: parsed.MqttWebDeviceID?.clientID,
    fb_dtsg: parsed.DTSGInitialData?.token,
    fbid: parsed.CurrentUserInitialData?.IG_USER_EIMU || parsed.CurrentUserInitialData?.ACCOUNT_ID, // if not instagram
    name: parsed.CurrentUserInitialData?.NAME,
    igViewerConfig,
    igUserId: igViewerConfig?.id,
    lsdToken: parsed.LSD?.token,
    mqttEndpoint: parsed.MqttWebConfig?.endpoint,
    mqttCapabilities: parsed.MqttWebConfig?.capabilities,
    mqttClientCapabilities: parsed.MqttWebConfig?.clientCapabilities,
    syncParams: parsed.LSPlatformMessengerSyncParams?.contact,
    initialPayloads: parsed.initialPayloads,
    gqlEndpointPath: parsed.RelayAPIConfigDefaults.graphURI,
    gqlCustomHeaders: parsed.RelayAPIConfigDefaults.customHeaders,
    sprinkleConfig: parsed.SprinkleConfig,
  }
}

export type MessengerConfig = ReturnType<typeof getMessengerConfig>
