import { texts } from '@textshq/platform-sdk'

export class PromiseQueue {
  private promises: Promise<void>[] = []

  private isProcessing = false

  private processQueue(): void {
    if (!this.isProcessing) {
      this.isProcessing = true
      Promise.all(this.promises)
        .catch(err => {
          texts.error(err)
          texts.Sentry.captureException(err)
          throw new Error(err)
        })
        .finally(() => {
          this.promises = []
          this.isProcessing = false
        })
    }
  }

  addPromise(promise: Promise<void>) {
    this.promises.push(promise)
    this.processQueue()
  }
}
