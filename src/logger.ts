import { texts } from '@textshq/platform-sdk'
import { smartJSONStringify } from '@textshq/platform-sdk/dist/json'
import { MetaMessengerError } from './errors'
import { EnvKey } from './env'
import { MqttError } from './MetaMQTTErrors'

export type SentryExtra = Record<string, string | boolean | number>
type LoggerMethod = 'log' | 'error'
type LoggerType = 'debug' | 'info' | 'warn' | 'error'
export type ErrorAlt = Error | MetaMessengerError | MqttError | string

const onError = (env: EnvKey | 'META', err: ErrorAlt, feature?: string, extra: SentryExtra = {}) => {
  const isError = err instanceof Error
  const errorMessage = isError ? err.message : err
  const message = feature ? `${feature} ${errorMessage}` : errorMessage
  const stack = isError ? err.stack : ((err as any).type ? (err as any).type : undefined)
  texts.error(message, err, extra, stack)
  console.error(message, err, extra, stack)
  texts.Sentry.captureException(err, {
    extra: {
      feature,
      ...extra,
      ...((err instanceof MetaMessengerError) ? err.getErrorData?.() : {}),
      metaMessengerType: env === 'IG' ? 'instagram' : env,
    },
  })
}

export const getLogger = (env: EnvKey | 'META', feature = '') => {
  const prefix = `[${env}]${feature ? `[${feature}]` : ''}`

  const formatMessage = (type: LoggerType, ...args: any[]): string =>
    [new Date().toISOString(), prefix, type, ...args.map(arg => (typeof arg === 'object' ? smartJSONStringify(arg) : arg))].join(' ')

  const logger = (method: LoggerMethod, type: LoggerType) => (...args: any[]) => texts[method](formatMessage(type, ...args))
  const warn = logger('log', 'warn')
  const debug = logger('log', 'debug')

  return {
    debug: (...args: any[]) => {
      if (!texts.isLoggingEnabled) return
      debug(...args)
    },
    info: logger('log', 'info'),
    warn: (...args: any[]) => {
      console.warn(formatMessage('warn', ...args))
      warn('log', 'warn')
    },
    error: (err: ErrorAlt | string, extra: SentryExtra = {}, ...args: any[]) => {
      onError(env, err, feature, extra)
      texts.error(formatMessage('error', ...args, typeof err === 'string' ? err : err.message))
    },
  }
}

export type Logger = ReturnType<typeof getLogger>
