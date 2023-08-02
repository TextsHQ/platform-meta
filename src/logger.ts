import { texts } from '@textshq/platform-sdk'

export const getLogger = (_p?: string) => {
  const logger = (method: 'log' | 'error', type: 'debug' | 'info' | 'warn' | 'error' | 'fatal') => (...args: (string | object | boolean)[]) =>
    texts[method]([`[instagram ${_p ? `(${_p})` : ''}]`, type, new Date(), ...args].map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2)
      }
      return arg
    }).join(' '))

  return {
    debug: logger('log', 'debug'),
    info: logger('log', 'info'),
    warn: logger('log', 'warn'),
    error: logger('error', 'error'),
    fatal: logger('error', 'fatal'),
  }
}
