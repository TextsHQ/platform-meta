import type { Logger } from './logger'
import { MetaMessengerError } from './errors'
import { getLogger } from './logger'
import type { EnvKey } from './env'

export class PromiseStore<DefaultPromiseType = unknown> {
  private readonly logger: Logger

  private i: number

  constructor(
    private readonly config: { env: EnvKey, startAt: number, timeoutMs: number },
  ) {
    this.logger = getLogger(this.config.env, 'ps')
    this.i = typeof this.config.startAt === 'number' ? this.config.startAt : 0
  }

  private promises: Map<number, {
    resolve: (value: unknown) => void
    reject: (reason?: any) => void
    promise: Promise<unknown>
    key?: string
    extra?: object
  }> = new Map()

  private promisesByKeys = new Map<string, number>()

  createId = () => this.i++ // meant for fire and forget operations

  currentId = () => this.i

  create<T = DefaultPromiseType>(
    key?: string,
    extra?: object,
    timeoutMs = this.config.timeoutMs,
  ) {
    let resolve: (value: T) => void
    let reject: (reason?: unknown) => void
    let timeoutId: NodeJS.Timeout = null
    let timedOut = false

    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })

    const id = this.i++
    const generatedKey = String(key || `#${id}`)

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        this.logger?.debug(`timing out ${generatedKey}#${id}`)
        const errorMsg = `[MetaMessenger] promise (${generatedKey}#${id}) timed out after ${timeoutMs}ms`
        timedOut = true
        reject(new Error(errorMsg))
        this.delete(id, generatedKey)
      }, timeoutMs)
    }

    this.promisesByKeys.set(generatedKey, id)

    this.promises.set(id, {
      resolve: value => {
        this.logger?.debug(`resolving ${generatedKey}#${id}`)
        if (timedOut) {
          throw new MetaMessengerError(this.config.env, -1, 'attempted to resolve timed out promise', `value: ${JSON.stringify(value)}, timeout: ${timeoutMs}ms`)
        }
        clearTimeout(timeoutId)
        resolve(value as T)
        this.delete(id, generatedKey)
      },
      reject: reason => {
        this.logger?.debug(`rejecting ${generatedKey}#${id}`)
        if (timedOut) {
          throw new MetaMessengerError(this.config.env, -1, 'attempted to reject timed out promise', `reason: ${JSON.stringify(reason)}, timeout: ${timeoutMs}ms`)
        }
        clearTimeout(timeoutId)
        reject(reason)
        this.delete(id, generatedKey)
      },
      promise,
      key: generatedKey,
      extra,
    })

    return { promise, id }
  }

  resolve<T = DefaultPromiseType>(id: number, payload?: T) {
    const p = this.promises.get(id)
    if (!p) throw new MetaMessengerError(this.config.env, -1, 'attempted to resolve missing promise', `id: ${id}`)
    p.resolve(payload)
  }

  resolveByKey<T = DefaultPromiseType>(key: string, payload?: T) {
    const id = this.promisesByKeys.get(String(key))
    if (!id) throw new MetaMessengerError(this.config.env, -1, 'attempted to resolve missing promise', `key: ${key}`)
    this.resolve(id, payload)
  }

  reject(id: number, reason?: any) {
    const p = this.promises.get(id)
    if (!p) throw new MetaMessengerError(this.config.env, -1, 'attempted to reject missing promise', `id: ${id}`)
    p.reject(reason)
  }

  get<T = DefaultPromiseType>(id: number) {
    const p = this.promises.get(id)
    // if (!p) throw new MetaMessengerError(this.config.env, -1, 'missing promise', `id: ${id}`)
    if (!p) return
    return { promise: p.promise as T, key: p.key, extra: p.extra }
  }

  getByKey<T = DefaultPromiseType>(key: string) {
    if (!key) throw new MetaMessengerError(this.config.env, -1, 'missing key')
    const id = this.promisesByKeys.get(String(key))
    // if (!id) throw new MetaMessengerError(this.config.env, -1, 'missing promise', `key: ${key}`)
    if (!id) return
    return this.get<T>(id)
  }

  getOrCreate<T = DefaultPromiseType>(key: string, extra?: object, timeoutMs?: number) {
    const p = this.getByKey<T>(key)
    if (p) return p
    return this.create<T>(key, extra, timeoutMs)
  }

  delete(id: number, key?: string) {
    const keyToDelete = key || this.promises.get(id)?.key
    if (keyToDelete?.length > 0) {
      this.promisesByKeys.delete(String(key || this.promises.get(id)?.key))
    }
    this.promises.delete(id)
  }

  has(id: number) {
    return this.promises.has(id)
  }

  hasKey(key: string) {
    return this.promisesByKeys.has(String(key))
  }
}
