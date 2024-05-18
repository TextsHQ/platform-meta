import { texts, type CurrentUser, RateLimitError, ReAuthError } from '@textshq/platform-sdk'
import { tryParseJSON } from '@textshq/platform-sdk/dist/json'
import { JSDOM } from 'jsdom'
import Bitmap, { type BootloaderHandlePayload } from './bitmap'
import { parseUnicodeEscapeSequences, TypedMap } from './util'
import type {
  BBoxContainer,
  Config,
  GraphQLPreloader,
  LSPlatformGraphQLLightspeedVariables,
  ModuleEntry,
  RelayPrefetchedStreamCache,
  SyncParams,
  Variables,
  XIGSharedDataRawConfigViewer,
} from './config-types'

function mapGraphQLPreloader(data: GraphQLPreloader) {
  if (!data || !data.variables) return
  return {
    actorID: data.actorID,
    preloaderID: data.preloaderID,
    queryID: data.queryID,
    variables: data.variables,
  }
}

function parseGraphQLPreloader(requests: GraphQLPreloader | GraphQLPreloader[]) {
  if (!requests) return []
  if (!Array.isArray(requests)) return [mapGraphQLPreloader(requests)].filter(Boolean)
  return requests.map(request => mapGraphQLPreloader(request)).filter(Boolean)
}

const fixUrl = (url: string) =>
  url && decodeURIComponent(url.replace(/\\u0026/g, '&'))

function parseModuleEntry(entry: [string, ...ModuleEntry['data']]): ModuleEntry {
  const [name, ...data] = entry
  return {
    name: name.split('@')[0],
    data,
  }
}

const SCHEDULER_JS_DEFINE_CONFIG_NAME = new Set([
  'CurrentEnvironment',
  'MercuryConfig',
  'BootloaderConfig',
  'MqttWebConfig',
  'MqttWebDeviceID',
  'WebDevicePerfClassData',
  'BootLoaderConfig',
  'CurrentBusinessAccount',
  'SiteData',
  'SprinkleConfig',
  'USIDMetadata',
  'WebConnectionClassServerGuess',
  'MessengerWebRegion',
  'MessengerWebInitData',
  'LSD',
  'IntlViewerContext',
  'IntlCurrentLocale',
  'DTSGInitData',
  'DTSGInitialData',
  'CurrentUserInitialData',
  'LSPlatformMessengerSyncParams',
  'ServerNonce',
  'InitialCookieConsent',
  'InstagramPasswordEncryption',
  'XIGSharedData',
  'RelayAPIConfigDefaults',
  'PolarisViewer',
  'JSErrorLoggingConfig',
] as const)

function parseGraphMethodName(name: string): string {
  return name?.replace('adp_', '').split('RelayPreloader_')[0]
}

function pickMessengerEnv(env: Config['CurrentEnvironment']) {
  if (env.instagramdotcom) return 'IG'
  if (env.messengerdotcom) return 'MESSENGER'
  if (env.workdotmetadotcom) return 'WORKMETA'
  if (env.workplacedotcom) return 'WORK'
  if (env.facebookdotcom) return 'FB' // this can return `true` for instagram
  throw new Error('Unknown Meta Messenger environment')
}

export function getMessengerConfig(html: string) {
  if (!html || html.length < 1) throw Error('Response body is empty')
  const page = new JSDOM(html)
  if (page.window.document.title === 'Error') throw new RateLimitError('Encountered an error page. Please try again later.')
  const scriptTags = Array.from<HTMLScriptElement>(page.window.document.querySelectorAll('script[type="application/json"]'))
  if (scriptTags.length < 3) throw new ReAuthError('Session expired (missing scripts)')

  const definesMap = new TypedMap<Config>()
  const bitmap = new Bitmap(false)
  const csrBitmap = new Bitmap(true)
  const syncData: Config['SyncData'] = {
    needSync: false,
    version: 0,
    links: [],
    syncPayloads: [],
  }

  const initialPayloads: string[] = []

  function handleBootloaderPayload(payloads: BootloaderHandlePayload[]) {
    payloads?.forEach(p => {
      csrBitmap.updateCsrBitmap(p)
    })
  }

  function handleConfigData(configData: ModuleEntry) {
    if (configData?.data?.length < 3) return

    const configId = Number(configData.data[2]) || 0
    if (configId <= 0) return
    bitmap.updateBitmap(configId)

    if (!SCHEDULER_JS_DEFINE_CONFIG_NAME.has(configData.name as any)) return
    const configName = configData.name
    const data = configData.data[1]

    if (!data) return
    definesMap.set(configName as any, data)

    if (configName === 'BootloaderConfig') {
      const bootloaderConfig = data as unknown as Config['BootloaderConfig']
      bitmap.phdOn = bootloaderConfig.phdOn
      csrBitmap.phdOn = bootloaderConfig.phdOn
    }
  }

  function handleRequire(data: ModuleEntry) {
    switch (data.name) {
      case 'RelayPrefetchedStreamCache': {
        if (data?.data?.length < 3) return
        const item = data.data?.[2] as [RelayPrefetchedStreamCache['preloadID'], RelayPrefetchedStreamCache['bbox']]
        const result = item?.[1]?.__bbox?.result?.data
        if (!result) return
        const _name = parseGraphMethodName(item[0])
        if (result?.lightspeed_web_request_for_igd?.payload) {
          initialPayloads.push(result.lightspeed_web_request_for_igd.payload)
        }
        if (result?.viewer?.lightspeed_web_request?.payload) {
          initialPayloads.push(result.viewer.lightspeed_web_request.payload)
        }
        return
      }
      case 'CometPlatformRootClient': {
        const cometType = data.data[0] as string
        if (cometType !== 'init') {
          if (texts.isLoggingEnabled) {
            texts.log('CometPlatformRootClient is not supported but encountered', data.data[2])
          }
          return
        }
        const innerData = data.data?.[2] as unknown[]
        if (innerData.length < 5) {
          texts.error('inner array from CometPlatformRootClient init has less than 5 elements')
          return
        }

        const requests = parseGraphQLPreloader((innerData as any)[4])
        for (const req of requests) {
          if (!req || !req.preloaderID?.startsWith('adp_LSPlatformGraphQLLightspeedRequest')) continue
          const variables = req.variables as Variables
          if (!variables || !variables.requestPayload) {
            texts.error('no variables or requestPayload:', req)
            continue
          }

          const requestPayload = tryParseJSON(variables.requestPayload, null) as LSPlatformGraphQLLightspeedVariables
          if (!requestPayload) {
            texts.error('no requestPayload:', req)
            continue
          }

          syncData.syncPayloads.push(Object.assign(req.variables, {
            requestPayload,
          }))

          if (requestPayload.version) syncData.version = requestPayload.version
        }
      } break
      default: break
    }
  }

  function SSJSHandle(data: BBoxContainer | ModuleEntry[]) {
    if (!data) return
    if (Array.isArray(data)) {
      const entries: ModuleEntry[] = data.filter((item => typeof item === 'object' && 'name' in item && 'data' in item))
      if (entries.length === 0) return
      for (const entry of entries) {
        handleConfigData(entry)
      }
      return
    }
    if (!data.__bbox) return
    data.__bbox.require?.forEach((bbox => handleRequire(parseModuleEntry(bbox as any))))
    data.__bbox.define?.forEach((bbox => handleConfigData(parseModuleEntry(bbox as any))))
  }

  function handleModule(mod: ModuleEntry) {
    if (mod?.data?.length < 3) return

    switch (mod.name) {
      case 'HasteSupportData': {
        if (texts.isLoggingEnabled) {
          texts.log('`HasteSupportData` is not supported but encountered', mod.data)
        }
        return
      }
      case 'Bootloader': {
        if (mod.data[0] !== 'handlePayload') return
        if (!Array.isArray(mod.data)) {
          texts.error('Bootloader.handlePayload is not an array')
          return
        }
        handleBootloaderPayload(mod.data[2] as any)
        return
      }
      case 'ScheduledServerJS':
      case 'ScheduledServerJSWithCSS': {
        if (mod.data[0] !== 'handle') return
        const ssjss = ((mod.data?.[2] as any) || [])
        for (const innerData of ssjss) {
          SSJSHandle(innerData)
        }
      } break
      default: break
    }
  }

  let foundEnv = false
  for (const scriptEl of scriptTags) {
    const isServerJS = 'sjs' in scriptEl.dataset
    if (!isServerJS) {
      if (scriptEl.id === 'envjson') {
        if (!scriptEl.textContent) {
          texts.error('envjson is empty')
          continue
        }
        const env = tryParseJSON(scriptEl.textContent, null)
        foundEnv = !!env
        continue
      }
      if (scriptEl.id !== '__eqmc') continue
      if (!scriptEl.textContent) {
        texts.error('__eqmc is empty')
        continue
      }
      const content = tryParseJSON(scriptEl.textContent, {})
      if (!content.u) throw new Error('No __eqmc.u')
      const eqmc = new URLSearchParams('?' + content.u.split('/?')[1])
      definesMap.set('Eqmc', { jazoest: eqmc.get('jazoest'), a: eqmc.get('__a'), comet_req: eqmc.get('__comet_req'), user: eqmc.get('__user') })
      continue
    }
    const { contentLen } = scriptEl.dataset
    const content = scriptEl.textContent

    if (contentLen && content.length !== Number(contentLen)) {
      throw new Error(`Content length mismatch in ServerJS: ${content.length} !== ${contentLen}`)
    }

    if (!content) continue

    let scriptParsed: {
      require?: [string, ...string[]][]
      define?: string[]
    }
    try {
      scriptParsed = JSON.parse(content)
    } catch (err) {
      if (content.startsWith('requireLazy')) {
        if (texts.isLoggingEnabled) {
          texts.log('requireLazy is not supported but encountered', content)
        }
        continue
      }
    }

    if (!Array.isArray(scriptParsed?.require)) continue

    for (const entry of scriptParsed.require) {
      handleModule(parseModuleEntry(entry))
    }
  }

  if (!foundEnv) {
    throw new ReAuthError('Session expired (missing envjson)')
  }

  const syncParams = definesMap.get('LSPlatformMessengerSyncParams')
  const LSPlatformMessengerSyncParams = {
    ...(syncParams || {}),
    contact: syncParams?.contact ? JSON.parse(syncParams.contact) as SyncParams : undefined,
  }

  // instagram-only
  const PolarisViewer = definesMap.get('PolarisViewer')

  const CurrentEnvironment = pickMessengerEnv(definesMap.get('CurrentEnvironment'))
  const MqttWebConfig = definesMap.get('MqttWebConfig')
  const MessengerWebInitData = definesMap.get('MessengerWebInitData')

  if (CurrentEnvironment === 'IG') {
    // MqttWebConfig.endpoint is wrong for IG
    // there is MqttWebConfig.hostNameOverride, but it's unclear how it's implemented
    MqttWebConfig.endpoint = MqttWebConfig.endpoint.replace('.facebook.com', '.instagram.com')
    MqttWebConfig.appID = MessengerWebInitData?.appId
  }

  if (syncData.version === 0) {
    syncData.needSync = true
    Array.from(page.window.document.querySelectorAll('link[as="script"]'))
      .forEach(linkEl => {
        const href = linkEl.getAttribute('href')
        if (!href) return
        syncData.links.push(href)
      })
  }

  bitmap.finishBitmap()
  csrBitmap.finishBitmap()

  const CurrentUserInitialData = definesMap.get('CurrentUserInitialData')
  const RelayAPIConfigDefaults = definesMap.get('RelayAPIConfigDefaults')
  const ServerAppID = definesMap.get('ServerAppID')

  const fbid = CurrentUserInitialData?.IG_USER_EIMU || CurrentUserInitialData?.ACCOUNT_ID // if not instagram
  if (!fbid || String(fbid) === '0') throw new ReAuthError('Session expired')

  const currentUser: CurrentUser = {
    id: fbid,
    fullName: CurrentUserInitialData?.NAME,
  }

  let igid: string
  let isInstagramTabbedInbox: boolean
  if (CurrentEnvironment === 'IG') {
    const igSharedData = definesMap.get('XIGSharedData')

    if (PolarisViewer?.data?.id) {
      isInstagramTabbedInbox = PolarisViewer?.data?.is_business_account || PolarisViewer?.data?.is_professional_account
      igid = PolarisViewer.data?.id
      // config.id, is the instagram id but fbid is instead used for chat
      if (PolarisViewer.data?.full_name) currentUser.fullName = parseUnicodeEscapeSequences(PolarisViewer.data.full_name)
      if (PolarisViewer.data?.profile_pic_url_hd) currentUser.imgURL = fixUrl(PolarisViewer.data.profile_pic_url_hd)
      currentUser.username = PolarisViewer.data?.username
    } else if (igSharedData?.raw) {
      texts.error('no PolarisViewer.data.id', PolarisViewer)

      const XIGSharedData = {
        ...(igSharedData || {}),
        raw: igSharedData?.raw ? JSON.parse(igSharedData.raw) as {
          config: {
            viewer: XIGSharedDataRawConfigViewer
          }
        } : undefined,
      }
      const igViewerConfig = XIGSharedData?.raw?.config?.viewer

      if (igViewerConfig?.id) {
        isInstagramTabbedInbox = igViewerConfig.has_tabbed_inbox
        igid = igViewerConfig.id
        currentUser.fullName = parseUnicodeEscapeSequences(igViewerConfig.full_name)
        currentUser.username = igViewerConfig.username
        currentUser.imgURL = fixUrl(igViewerConfig.profile_pic_url_hd)
      }
    }

    if (!igid) {
      const hasPolaris = !!PolarisViewer?.data?.id
      const hasXIGSharedData = !!igSharedData?.raw
      throw new ReAuthError(`failed to fetch viewer config for ig hasPolaris: ${hasPolaris}, hasXIGSharedData: ${hasXIGSharedData}`)
    }
  }

  return {
    env: CurrentEnvironment,
    appId: String(MessengerWebInitData?.appId),
    currentUser,
    clientId: definesMap.get('MqttWebDeviceID')?.clientID,
    fb_dtsg: definesMap.get('DTSGInitialData')?.token,
    fbid,
    igid,
    isInstagramTabbedInbox,
    lsdToken: definesMap.get('LSD')?.token,
    siteData: definesMap.get('SiteData'),
    mqttEndpoint: MqttWebConfig?.endpoint,
    mqttCapabilities: MqttWebConfig?.capabilities,
    mqttClientCapabilities: MqttWebConfig?.clientCapabilities,
    syncParams: LSPlatformMessengerSyncParams,
    initialPayloads: initialPayloads.filter(Boolean),
    gqlEndpointPath: RelayAPIConfigDefaults.graphURI,
    gqlCustomHeaders: RelayAPIConfigDefaults.customHeaders,
    sprinkleConfig: definesMap.get('SprinkleConfig'),
    currentLocale: definesMap.get('IntlCurrentLocale')?.code,
    bitmaps: {
      bitmap,
      csrBitmap,
    },
    eqmc: definesMap.get('Eqmc'),
    server_app_id: ServerAppID ? ServerAppID.app_id : MessengerWebInitData?.appId.toString(), // instagram doesn't have the ServerAppID config, so we use the appId from MessengerWebInitData if that doesn't exist
    jsErrorLogging: definesMap.get('JSErrorLoggingConfig'),
    webConnectionClassServerGuess: definesMap.get('WebConnectionClassServerGuess'),
    webSessionId: '',
    syncData,
  }
}

export type MessengerConfig = ReturnType<typeof getMessengerConfig>
