// initially stolen from https://github.com/pladaria/reconnecting-websocket
import WebSocket from 'ws'

export class Event {
  public target: any

  public type: string

  constructor(type: string, target: any) {
    this.target = target
    this.type = type
  }
}

export class ErrorEvent extends Event {
  public message: string

  public error: Error

  constructor(error: Error, target: any) {
    super('error', target)
    this.message = error.message
    this.error = error
  }
}

export class CloseEvent extends Event {
  public code: number

  public reason: string

  public wasClean = true

  constructor(code = 1000, reason = '', target: any = undefined) {
    super('close', target)
    this.code = code
    this.reason = reason
  }
}
export interface WebSocketEventMap {
  close: CloseEvent
  error: ErrorEvent
  message: WebSocket.RawData
  open: Event
}

export interface WebSocketEventListenerMap {
  close: (event: CloseEvent) => void | { handleEvent: (event: CloseEvent) => void }
  error: (event: ErrorEvent) => void | { handleEvent: (event: ErrorEvent) => void }
  message: (event: WebSocket.RawData) => void | { handleEvent: (event: WebSocket.RawData) => void }
  open: (event: Event) => void | { handleEvent: (event: Event) => void }
}
