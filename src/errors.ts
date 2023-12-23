import { texts } from '@textshq/platform-sdk'
import { smartJSONStringify } from '@textshq/platform-sdk/dist/json'
import type { EnvKey } from './env'
import type { SentryExtra } from './logger'

export class MetaMessengerError extends Error {
  private readonly metaMessengerEnv: EnvKey | 'META'

  private readonly id: -1 | number // -1 is internal error, not coming from meta

  private readonly title?: string

  private readonly details?: string

  private readonly disableToast?: boolean

  private readonly context?: SentryExtra

  constructor(metaMessengerEnv: EnvKey | 'META', id: -1 | number, title: string, details?: string, context?: SentryExtra, disableToast = false) {
    super([
      `[${metaMessengerEnv}] Error${id === -1 ? '' : ` (${id})`}: `,
      title,
      details?.length > 0 ? `(${details})` : '',
      context ? ` context: [${smartJSONStringify(context)}]` : '',
    ].filter(Boolean).join(''))

    this.name = 'MetaMessengerError'

    this.id = id
    this.title = title
    this.metaMessengerEnv = metaMessengerEnv
    this.details = details
    this.context = context
    this.disableToast = !texts.isLoggingEnabled && disableToast

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
      disableToast: this.disableToast,
    }
  }

  isToastDisabled() {
    return this.disableToast
  }

  getPublicMessage() {
    return `Error${this.id === -1 ? '' : ` (${this.id})`}: ${this.title}${this.details?.length > 0 ? ` (${this.details})` : ''}`
  }
}
