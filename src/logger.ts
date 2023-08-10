import { texts } from '@textshq/platform-sdk'

type LoggerMethod = 'log' | 'error'
type LoggerType = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
type LoggerArgs = (string | object | boolean)[]

export const getLogger = (_p?: string) => {
  const logger = (method: LoggerMethod, type: LoggerType) => (...args: LoggerArgs) =>
    texts[method]([new Date().toISOString(), `[instagram ${_p ? `(${_p})` : ''}]`, type, ...args].map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2)
      }
      return arg
    }).join(' '))

  return {
    debug: texts.IS_DEV ? logger('log', 'debug') : () => {},
    info: logger('log', 'info'),
    warn: logger('log', 'warn'),
    error: logger('error', 'error'),
    fatal: logger('error', 'fatal'),
  }
}
