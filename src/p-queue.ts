import { texts } from '@textshq/platform-sdk'
import { getLogger } from './logger'

export class PromiseQueue {
  private promises: Promise<void>[] = []

  private isProcessing = false

  private logger = getLogger('PromiseQueue')

  private readonly concurrency: number = 5 // Example: handle 5 promises at a time

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    while (this.promises.length > 0) {
      const activePromises = this.promises.splice(0, this.concurrency)
      await Promise.allSettled(activePromises.map(p => PromiseQueue.handlePromise(p)))
    }

    this.isProcessing = false
  }

  static async handlePromise(promise: Promise<void>): Promise<void> {
    try {
      await promise
    } catch (err) {
      this.logger.error(err)
      texts.error('IG PromiseQueue failed', err)
      console.error(err)
      texts.Sentry.captureException(err)
    }
  }

  addPromise(promise: Promise<void>) {
    this.promises.push(promise)
    this.processQueue()
  }
}
