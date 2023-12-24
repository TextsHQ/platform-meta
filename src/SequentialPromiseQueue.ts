type PromiseTask = () => Promise<unknown>
type PromiseQueueItem = { task: PromiseTask, resolve: (value: unknown) => void, reject: (reason?: unknown) => void }

export class SequentialPromiseQueue {
  queue: PromiseQueueItem[] = []

  pendingPromise = false

  executeTask(task: PromiseTask) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.pendingPromise || this.queue.length === 0) return

    this.pendingPromise = true

    while (this.queue.length > 0) {
      const queueItem = this.queue.shift()
      if (!queueItem) continue
      const { task, resolve, reject } = queueItem

      try {
        const result = await task()
        resolve(result)
      } catch (error) {
        reject(error)
      } finally {
        this.processQueue()
      }
    }

    this.pendingPromise = false
  }
}
