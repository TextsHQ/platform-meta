// @TODO - use SequentialPromiseQueue
export class PaginationQueue {
  // eslint-disable-next-line class-methods-use-this
  executeTask(task: () => Promise<unknown>) {
    return task()
  }
}
