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

export class ErrorEvent extends Event implements WebSocket.ErrorEvent {
  public message: string

  public error: Error

  constructor(error: Error, target: any) {
    super('error', target)
    this.message = error.message
    this.error = error
  }
}

export class CloseEvent extends Event implements WebSocket.CloseEvent {
  public code: number

  public reason: string

  public wasClean = true

  constructor(code = 1000, reason = '', target: any = undefined) {
    super('close', target)
    this.code = code
    this.reason = reason
  }
}

export interface WebSocketEventListenerMap {
  close: (event: CloseEvent) => void
  error: (event: ErrorEvent) => void
  message: (event: WebSocket.MessageEvent) => void
  open: () => void
}
