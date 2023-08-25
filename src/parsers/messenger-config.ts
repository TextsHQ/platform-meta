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

interface Config {
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
}

export function parseMessengerConfig(html: string) {
  const scriptTags = html.match(/type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/g) || []

  const definesMap = new Map<string, unknown>()
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

  return {
    CurrentUserInitialData: definesMap.get('CurrentUserInitialData') as Config['CurrentUserInitialData'],
    DTSGInitialData: definesMap.get('DTSGInitialData') as Config['DTSGInitialData'],
    LSD: definesMap.get('LSD') as Config['LSD'],
    LSPlatformMessengerSyncParams,
    MessengerWebInitData: definesMap.get('MessengerWebInitData') as Config['MessengerWebInitData'],
    MqttWebConfig: definesMap.get('MqttWebConfig') as Config['MqttWebConfig'],
    MqttWebDeviceID: definesMap.get('MqttWebDeviceID') as Config['MqttWebDeviceID'],
    RelayAPIConfigDefaults: definesMap.get('RelayAPIConfigDefaults') as Config['RelayAPIConfigDefaults'],
    XIGSharedData,
  } as const
}

export function getMessengerConfig(html: string) {
  const parsed = parseMessengerConfig(html)
  const igViewerConfig = parsed.XIGSharedData?.raw?.config?.viewer // instagram-only
  return {
    appId: parsed.MessengerWebInitData?.appId,
    clientID: parsed.MqttWebDeviceID?.clientID,
    fbDTSG: parsed.DTSGInitialData?.token,
    fbid: parsed.CurrentUserInitialData?.IG_USER_EIMU,
    igViewerConfig,
    lsdToken: parsed.LSD?.token,
    mqttCapabilities: parsed.MqttWebConfig?.capabilities,
    mqttClientCapabilities: parsed.MqttWebConfig?.clientCapabilities,
    syncParams: parsed.LSPlatformMessengerSyncParams?.contact,
  }
}

export type MessengerConfig = ReturnType<typeof getMessengerConfig>