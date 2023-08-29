import type { EnvironmentKey } from './ig-types'
import type { SentryExtra } from './logger'

export class MetaMessengerError extends Error {
  private readonly metaMessengerEnv: EnvironmentKey

  private readonly id: -1 | number // -1 is internal error, not coming from meta

  private readonly title?: string

  private readonly details?: string

  private readonly context?: SentryExtra

  constructor(metaMessengerEnv: EnvironmentKey, id: -1 | number, title: string, details?: string, context?: SentryExtra) {
    super([
      `[${metaMessengerEnv}] Error${id === -1 ? '' : ` (${id})`}: `,
      title,
      details?.length > 0 ? `(${details})` : '',
      context ? ` context: [${JSON.stringify(context)}]` : '',
    ].filter(Boolean).join(''))

    this.name = 'MetaMessengerError'

    this.id = id
    this.title = title
    this.metaMessengerEnv = metaMessengerEnv
    this.details = details
    this.context = context

    // Ensure the instance is correctly set up
    // If transpiling to ES5; this line is needed to correctly set up the prototype chain
    Object.setPrototypeOf(this, MetaMessengerError.prototype)

    // Capture the stack trace (removes the constructor call from it)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MetaMessengerError)
    }
  }

  getErrorData() {
    return {
      id: this.id,
      metaMessengerEnv: this.metaMessengerEnv,
      message: this.message,
      title: this.title,
      details: this.details,
      context: this.context,
    }
  }

  getPublicMessage() {
    return `Error${this.id === -1 ? '' : ` (${this.id})`}: ${this.title}${this.details?.length > 0 ? ` (${this.details})` : ''}`
  }
}
