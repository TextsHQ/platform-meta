import { getLogger } from './logger'
import { InstagramSocketServerError } from './util'

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
      await Promise.allSettled(activePromises.map(p => this.handlePromise(p)))
    }

    this.isProcessing = false
  }

  async handlePromise(promise: Promise<void>): Promise<void> {
    try {
      await promise
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err)
      } else {
        this.logger.error(new InstagramSocketServerError('PQUEUE_REJECTION', 'Promise queue got rejection', err), {}, 'PromiseQueue failed')
      }
    }
  }

  addPromise(promise: Promise<void>) {
    this.promises.push(promise)
    this.processQueue()
  }
}
