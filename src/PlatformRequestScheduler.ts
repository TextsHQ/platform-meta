export class PlatformRequestScheduler {
  requests = new Map<string, NodeJS.Timeout>()

  schedule(callback: () => void, key: string, delay: number) {
    const existingTimeout = this.requests.get(key)
    if (existingTimeout != null) {
      clearTimeout(existingTimeout)
    }
    const newTimeout = setTimeout(callback, delay)
    this.requests.set(key, newTimeout)
  }

  cleanup() {
    this.requests.forEach(timeout => {
      clearTimeout(timeout)
    })
  }
}
