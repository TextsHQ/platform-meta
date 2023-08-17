import { getLogger } from './logger'
import { InstagramSocketServerError } from './util'

export class PromiseQueue {
  private promises: Promise<void>[] = []

  private isProcessing = false

  private logger = getLogger('PromiseQueue')

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
        this.logger.error(
          new InstagramSocketServerError('PQUEUE_REJECTION', 'Promise queue got rejection', err),
          {},
          'PromiseQueue failed',
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
