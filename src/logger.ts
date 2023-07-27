import { texts } from '@textshq/platform-sdk'

export const getLogger = (_p?: string) => {
  const p = `[instagram ${_p ? `(${_p})` : ''}]`
  const log = (...args: any[]) => {
    texts.log([p, ...args].map((arg: any) => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2)
      }
      return arg
    }).join(' '))
  }

  return {
    debug: log,
    info: log,
    warn: log,
    error: (...args: any[]) => texts.error([p, ...args].join(' ')),
    fatal: (...args: any[]) => texts.error([p, '[fatal]', ...args].join(' ')),
  }
}
