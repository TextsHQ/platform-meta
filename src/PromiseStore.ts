import { smartJSONStringify } from '@textshq/platform-sdk/dist/json'
import type { Logger } from './logger'
import { MetaMessengerError } from './errors'
import { getLogger } from './logger'
import { AutoIncrementStore } from './util'

export class PromiseStore<DefaultPromiseType = unknown> {
  private readonly logger: Logger

  constructor(
    private readonly timeoutMs: number = 0,
    private readonly counter: AutoIncrementStore = new AutoIncrementStore(),
  ) {
    this.logger = getLogger('META', 'ps')
  }

  private promises: Map<number, {
    id: number
    resolve: (value: unknown) => void
    reject: (reason?: unknown) => void
    promise: Promise<unknown>
    key?: string
    extra?: object
  }> = new Map()

  promisesByKeys = new Map<string, number>()

  createId = () => this.counter.gen()

  create<T = DefaultPromiseType>(
    key?: string,
    extra?: object,
    timeoutMs = this.timeoutMs,
  ) {
    let resolve: (value: T) => void
    let reject: (reason?: unknown) => void
    let timeout: ReturnType<typeof setTimeout> = null
    let hasTimedOut = false
    let hasResolved = false
    let hasRejected = false
    let hasSettled = false

    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })

    const id = this.createId()
    const generatedKey = String(key || `#${id}`)

    promise
      .then(() => {
        hasResolved = true
      })
      .catch(() => {
        hasRejected = true
      })
      .finally(() => {
        hasSettled = true

        this.logger?.debug(`promise settled ${generatedKey}#${id}`, {
          hasTimedOut,
          hasResolved,
          hasRejected,
        })
        if (timeout) {
          clearTimeout(timeout)
        }
        this.delete(id, generatedKey)
      })

    if (timeoutMs > 0) {
      timeout = setTimeout(() => {
        this.logger?.debug(`timing out ${generatedKey}#${id}`)
        const errorMsg = `[MetaMessenger] promise (${generatedKey}#${id}) timed out after ${timeoutMs}ms`
        hasTimedOut = true
        const err = new Error(errorMsg)
        err.name = 'PromiseStoreTimeoutError'

        if (!hasSettled) {
          reject(err)
        } else {
          this.logger?.debug(`promise ${generatedKey}#${id} has already settled, not rejecting`)
        }
      }, timeoutMs)
    }

    this.promisesByKeys.set(generatedKey, id)

    this.promises.set(id, {
      id,
      resolve: value => {
        this.logger?.debug(`resolving ${generatedKey}#${id}`)
        if (hasTimedOut) {
          throw new MetaMessengerError('META', -1, 'attempted to resolve timed out promise', `value: ${smartJSONStringify(value)}, timeout: ${timeoutMs}ms`)
        }
        if (!hasSettled) {
          resolve(value as T)
        } else {
          this.logger?.debug(`promise ${generatedKey}#${id} has already settled, not resolving`)
        }
      },
      reject: reason => {
        this.logger?.debug(`rejecting ${generatedKey}#${id}`)
        if (hasTimedOut) {
          throw new MetaMessengerError('META', -1, 'attempted to reject timed out promise', `reason: ${smartJSONStringify(reason)}, timeout: ${timeoutMs}ms`)
        }
        if (!hasSettled) {
          reject(reason)
        } else {
          this.logger?.debug(`promise ${generatedKey}#${id} has already settled, not resolving`)
        }
      },
      promise,
      key: generatedKey,
      extra,
    })

    return { promise, id }
  }

  resolve<T = DefaultPromiseType>(id: number, payload?: T) {
    const p = this.promises.get(id)
    if (!p) throw new MetaMessengerError('META', -1, 'attempted to resolve missing promise', `id: ${id}`)
    p.resolve(payload)
  }

  resolveByKey<T = DefaultPromiseType>(key: string, payload?: T) {
    const id = this.promisesByKeys.get(String(key))
    return this.resolve(id, payload)
  }

  reject(id: number, reason?: any) {
    const p = this.promises.get(id)
    if (!p) throw new MetaMessengerError('META', -1, 'attempted to reject missing promise', `id: ${id}`)
    p.reject(reason)
  }

  get<T = DefaultPromiseType>(id: number) {
    const p = this.promises.get(id)
    // if (!p) throw new MetaMessengerError('META', -1, 'missing promise', `id: ${id}`)
    if (!p) return
    return { promise: p.promise as T, key: p.key, extra: p.extra }
  }

  getByKey<T = DefaultPromiseType>(key: string) {
    if (!key) throw new MetaMessengerError('META', -1, 'missing key')
    const id = this.promisesByKeys.get(String(key))
    // if (!id) throw new MetaMessengerError('META', -1, 'missing promise', `key: ${key}`)
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
      this.promisesByKeys.delete(String(keyToDelete))
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
