import { getLogger } from './logger'
import { MetaMessengerError } from './errors'
import { META_MESSENGER_ENV } from './constants'

export class PromiseQueue {
  private promises: Promise<void>[] = []

  private isProcessing = false

  private logger = getLogger(META_MESSENGER_ENV, 'p-queue')

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
          new MetaMessengerError(META_MESSENGER_ENV, -1, 'promise queue got rejection', errorMessage),
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
