import { texts } from '@textshq/platform-sdk'
import WebSocket, { type ErrorEvent as WSErrorEvent } from 'ws'
import { EnvironmentKey } from './ig-types'
import { MetaMessengerError } from './errors'

export type SentryExtra = Record<string, string | boolean | number>
type LoggerMethod = 'log' | 'error'
type LoggerType = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type ErrorAlt = Error | WSErrorEvent | MetaMessengerError

const onError = (err: ErrorAlt, feature?: string, extra: SentryExtra = {}) => {
  const message = feature ? `${feature} ${err.message}` : err.message
  const stack = (err instanceof Error) ? err.stack : err.type
  texts.error(message, err, extra, stack)
  console.error(message, err, extra, stack)
  const isWSError = 'target' in err && err.target instanceof WebSocket
  texts.Sentry.captureException(err, {
    extra: {
      feature,
      ...extra,
      ...((err instanceof MetaMessengerError) ? err.getErrorData?.() : {}),
      ...{
        socketStatus: isWSError ? err.target.readyState : undefined,
      },
    },
  })
}

export const getLogger = (feature = '', env?: EnvironmentKey) => {
  const prefix = `[${env}${feature ? `:${feature}` : ''}]`

  const formatMessage = (type: LoggerType, ...args: any[]): string =>
    [new Date().toISOString(), prefix, type, ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg))].join(' ')

  const logger = (method: LoggerMethod, type: LoggerType) => (...args: any[]) => texts[method](formatMessage(type, ...args))

  return {
    debug: logger('log', 'debug'),
    info: logger('log', 'info'),
    warn: logger('log', 'warn'),
    error: (err: ErrorAlt | string, extra: SentryExtra = {}, ...args: any[]) => {
      onError(typeof err === 'string' ? new Error(err) : err, feature, extra)
      texts.error(formatMessage('error', ...args, typeof err === 'string' ? err : err.message))
    },
    // fatal: logger('error', 'fatal'),
  }
}
