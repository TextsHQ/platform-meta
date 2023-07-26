import { texts } from '@textshq/platform-sdk'

export const getLogger = (_p?: string) => {
  const p = 'instagram' + _p ? `(${_p}):` : ':'

  return {
    debug: (...args: any[]) => texts.log(p, ...args),
    info: (...args: any[]) => texts.log(p, ...args),
    warn: (...args: any[]) => texts.log(p, ...args),
    error: (...args: any[]) => texts.error(p, ...args),
    fatal: (...args: any[]) => texts.error(p, '[fatal]', ...args),
    child: ({ name }: { name: string }) => getLogger(name),
  }
}

export type LoggerInstance = ReturnType<typeof getLogger>
