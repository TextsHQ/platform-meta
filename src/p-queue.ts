import { getLogger, Logger } from './logger'
import { MetaMessengerError } from './errors'
import { EnvironmentKey } from './mm-types'

export class PromiseQueue {
  private logger: Logger

  private env: EnvironmentKey

  constructor(env: EnvironmentKey) {
    this.env = env
    this.logger = getLogger(env, 'p-queue')
  }

  private promises: Promise<void>[] = []

  private isProcessing = false

  private async processQueue() {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      while (this.promises.length > 0) {
        const promise = this.promises.shift()!
        await this.handlePromise(promise)
      }
    } catch (err) {
      this.logger.error(`Unexpected error in processQueue: ${err.message}`, err)
    } finally {
      this.isProcessing = false
    }
  }

  async handlePromise(promise: Promise<void>) {
    try {
      await promise
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err)
      } else {
        const errorMessage = typeof err === 'string' ? err : JSON.stringify(err)
        this.logger.error(
          new MetaMessengerError(this.env, -1, 'promise queue got rejection', errorMessage),
        )
      }
    }
  }

  addPromise(promise: Promise<void>) {
    this.promises.push(promise)
    if (!this.isProcessing) {
      this.processQueue()
    }
  }
}
