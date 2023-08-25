export enum SupportedCalls {
  IntlCurrentLocale = 'IntlCurrentLocale',
  CometPersistQueryParams = 'CometPersistQueryParams',
  CurrentAdAccountInitialData = 'CurrentAdAccountInitialData',
  CookieDomain = 'CookieDomain',
  MqttWebConfig = 'MqttWebConfig',
}

type InnerObject = {
  __bbox: {
    require: Array<
    [
      string,
      null,
      null,
      unknown,
    ]
    >
  }
}

type RequireData = [
  SupportedCalls,
  string,
  null,
  InnerObject[],
]

type BboxEntry = {
  define?: any[][]
  require?: any[][]
  instances?: any[][]
}

function parseObject(definesMap: Map<string, string>, input: [string, string, null, BboxEntry[]]) {
  // const requires: any[][] = []
  // const instances: any[][] = []

  input.forEach(obj => {
    const bbox = obj.__bbox
    if (bbox) {
      bbox.define?.forEach((define: any) => {
        const callName = define[0] as string
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

      // if (bbox.require) requires.push(...bbox.require)
      // if (bbox.instances) instances.push(...bbox.instances)
    }
  })

  // return [requires, instances]
}

export function extractMessengerConfig(html: string, calls: SupportedCalls[]) {
  // const result: Partial<Record<SupportedCalls, unknown>> = {}
  const scriptTags = html.match(/<script type="application\/json"[\s\S]*?>[\s\S]*?<\/script>/g) || []

  const definesMap = new Map<string, string>()
  scriptTags.forEach(scriptTag => {
    const startIndex = scriptTag.indexOf('{')
    const endIndex = scriptTag.lastIndexOf('}')

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonContent = scriptTag.substring(startIndex, endIndex + 1)
      const parsedContent = JSON.parse(jsonContent) as {
        require: RequireData[]
      }

      if (parsedContent.require) {
        parsedContent.require.forEach(requireCall => {
          const callName = requireCall[0] as string// @TODO: type is WRONG
          if (callName !== 'ScheduledServerJS') return
          parseObject(definesMap, requireCall[3] as any)
        })
      }
    }
  })

  return {
    MqttWebConfig: definesMap.get('MqttWebConfig'),
    LSPlatformMessengerSyncParams: definesMap.get('LSPlatformMessengerSyncParams'),
    MessengerWebInitData: definesMap.get('MessengerWebInitData'),
    XIGSharedData: definesMap.get('XIGSharedData'),
    DTSGInitialData: definesMap.get('DTSGInitialData'),
    LSD: definesMap.get('LSD'),
  }
}
