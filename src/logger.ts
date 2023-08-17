import { texts } from '@textshq/platform-sdk'

type SentryExtra = Record<string, string | boolean | number>
type LoggerMethod = 'log' | 'error'
type LoggerType = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

const onError = (err: Error, feature?: string, extra: SentryExtra = {}) => {
  const message = feature ? `${feature} ${err.message}` : err.message
  texts.error(message, err, extra, err.stack)
  console.error(message, err, extra, err.stack)
  texts.Sentry.captureException(err, { extra: { feature, ...extra } })
}

export const getLogger = (feature = '') => {
  const prefix = `[instagram ${feature ? `(${feature})` : ''}]`

  const formatMessage = (type: LoggerType, ...args: any[]): string =>
    [new Date().toISOString(), prefix, type, ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg))].join(' ')

  const logger = (method: LoggerMethod, type: LoggerType) => (...args: any[]) => texts[method](formatMessage(type, ...args))

  return {
    debug: logger('log', 'debug'),
    info: logger('log', 'info'),
    warn: logger('log', 'warn'),
    error: (err: Error, extra: SentryExtra = {}, ...args: any[]) => {
      onError(err, feature, extra)
      texts.error(formatMessage('error', ...args, err.message))
    },
    fatal: logger('error', 'fatal'),
  }
}
