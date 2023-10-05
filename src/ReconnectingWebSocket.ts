// initially stolen from https://github.com/pladaria/reconnecting-websocket
import WebSocket from 'ws'
import * as Events from './ReconnectingWebSocketEvents'
import type { MetaMessengerWebSocketMQTTConfig } from './socket'
import { getLogger, Logger } from './logger'
import { EnvKey } from './env'

export type Event = Events.Event
export type Options = {
  WebSocket?: any
  maxReconnectionDelay?: number
  minReconnectionDelay?: number
  reconnectionDelayGrowFactor?: number
  minUptime?: number
  connectionTimeout?: number
  maxRetries?: number
  maxEnqueuedMessages?: number
  startClosed?: boolean
  debug?: boolean
}

export type Message = Parameters<WebSocket['send']>[0]

export type ListenersMap = {
  error: Array<Events.WebSocketEventListenerMap['error']>
  message: Array<Events.WebSocketEventListenerMap['message']>
  open: Array<Events.WebSocketEventListenerMap['open']>
  close: Array<Events.WebSocketEventListenerMap['close']>
}

export default class ReconnectingWebSocket {
  private _ws?: WebSocket

  private _listeners: ListenersMap = {
    error: [],
    message: [],
    open: [],
    close: [],
  }

  private _retryCount = -1

  private _uptimeTimeout: any

  private _connectTimeout: any

  private _logger: Logger

  private _shouldReconnect = true

  private _connectLock = false

  // private _binaryType: BinaryType = 'blob'

  private _closeCalled = false

  private _messageQueue: Message[] = []

  private readonly _options: Options

  constructor(
    env: EnvKey,
    private readonly _getConfig: () => MetaMessengerWebSocketMQTTConfig,
    options: Options = {},
  ) {
    this._options = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000 + Math.random() * 1000,
      minUptime: 5000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 2000,
      maxRetries: 12,
      maxEnqueuedMessages: Infinity,
      startClosed: false,
      debug: false,
      ...options,
    }
    this._logger = getLogger(env, 'ReconnectingWebSocket')
    if (this._options.startClosed) {
      this._shouldReconnect = false
    }
    this._connect()
  }

  static get CONNECTING() {
    return 0
  }

  static get OPEN() {
    return 1
  }

  static get CLOSING() {
    return 2
  }

  static get CLOSED() {
    return 3
  }

  // eslint-disable-next-line class-methods-use-this
  get CONNECTING() {
    return ReconnectingWebSocket.CONNECTING
  }

  // eslint-disable-next-line class-methods-use-this
  get OPEN() {
    return ReconnectingWebSocket.OPEN
  }

  // eslint-disable-next-line class-methods-use-this
  get CLOSING() {
    return ReconnectingWebSocket.CLOSING
  }

  // eslint-disable-next-line class-methods-use-this
  get CLOSED() {
    return ReconnectingWebSocket.CLOSED
  }

  /**
   * Returns the number or connection retries
   */
  get retryCount(): number {
    return Math.max(this._retryCount, 0)
  }

  /**
   * The current state of the connection; this is one of the Ready state constants
   */
  get readyState(): number {
    if (this._ws) {
      return this._ws.readyState
    }
    return this._options.startClosed
      ? ReconnectingWebSocket.CLOSED
      : ReconnectingWebSocket.CONNECTING
  }

  /**
   * The URL as resolved by the constructor
   */
  get url(): string {
    return this._ws ? this._ws.url : ''
  }

  /**
   * An event listener to be called when the WebSocket connection's readyState changes to CLOSED
   */
  public onclose: ((event: Events.CloseEvent) => void) = null

  /**
   * An event listener to be called when an error occurs
   */
  public onerror: ((event: Events.ErrorEvent) => void) = null

  /**
   * An event listener to be called when a message is received from the server
   */
  public onmessage: ((event: WebSocket.MessageEvent) => void) = null

  /**
   * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
   * this indicates that the connection is ready to send and receive data
   */
  public onopen: () => void = null

  /**
   * Closes the WebSocket connection or connection attempt, if any. If the connection is already
   * CLOSED, this method does nothing
   */
  public close(code = 1000, reason?: string) {
    this._closeCalled = true
    this._shouldReconnect = false
    this._clearTimeouts()
    if (!this._ws) {
      this._logger.debug('close enqueued: no ws instance')
      return
    }
    if (this._ws.readyState === this.CLOSED) {
      this._logger.info('close: already closed')
      return
    }
    this._ws.close(code, reason)
  }

  /**
   * Closes the WebSocket connection or connection attempt and connects again.
   * Resets retry counter;
   */
  public reconnect(code?: number, reason?: string) {
    this._shouldReconnect = true
    this._closeCalled = false
    this._retryCount = -1
    if (!this._ws || this._ws.readyState === this.CLOSED) {
      this._connect()
    } else {
      this._disconnect(code, reason)
      this._connect()
    }
  }

  /**
   * Enqueue specified data to be transmitted to the server over the WebSocket connection
   */
  public send(data: Message) {
    if (this._ws && this._ws.readyState === this.OPEN) {
      // this._logger.debug('send', data)
      this._ws.send(data)
    } else {
      const { maxEnqueuedMessages } = this._options
      if (this._messageQueue.length < maxEnqueuedMessages) {
        // this._logger.debug('enqueue', data)
        this._messageQueue.push(data)
      }
    }
  }

  /**
   * Register an event handler of a specific event type
   */
  public addEventListener<T extends keyof Events.WebSocketEventListenerMap>(
    type: T,
    listener: Events.WebSocketEventListenerMap[T],
  ): void {
    if (this._listeners[type]) {
      // @ts-expect-error
      this._listeners[type].push(listener)
    }
  }

  /**
   * Removes an event listener
   */
  public removeEventListener<T extends keyof Events.WebSocketEventListenerMap>(
    type: T,
    listener: Events.WebSocketEventListenerMap[T],
  ): void {
    if (this._listeners[type]) {
      // @ts-expect-error
      this._listeners[type] = this._listeners[type].filter(l => l !== listener)
    }
  }

  private _getNextDelay() {
    const {
      reconnectionDelayGrowFactor,
      minReconnectionDelay,
      maxReconnectionDelay,
    } = this._options
    let delay = 0
    if (this._retryCount > 0) {
      delay = minReconnectionDelay * reconnectionDelayGrowFactor ** (this._retryCount - 1)
      if (delay > maxReconnectionDelay) {
        delay = maxReconnectionDelay
      }
    }
    this._logger.debug('next delay', delay)
    return delay
  }

  private _wait(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, this._getNextDelay())
    })
  }

  private _connect() {
    if (this._connectLock || !this._shouldReconnect) {
      return
    }
    this._connectLock = true

    const {
      maxRetries,
      connectionTimeout,
    } = this._options

    if (this._retryCount >= maxRetries) {
      this._logger.debug('max retries reached', this._retryCount, '>=', maxRetries)
      return
    }

    this._retryCount++

    this._logger.debug('connect', this._retryCount)
    this._removeListeners()
    // if (!isWebSocket(WebSocket)) {
    //   throw Error('No valid WebSocket class provided')
    // }
    this._wait()
      .then(() => {
        // close could be called before creating the ws
        if (this._closeCalled) {
          return
        }
        const { endpoint, wsOptions } = this._getConfig()
        const url = endpoint.toString()
        this._logger.debug('connect', { url, wsOptions })
        this._ws = new WebSocket(url, wsOptions)
        // this._ws!.binaryType = this._binaryType
        this._connectLock = false
        this._addListeners()

        this._connectTimeout = setTimeout(() => this._handleTimeout(), connectionTimeout)
      })
  }

  private _handleTimeout() {
    this._logger.debug('timeout event')
    this._handleError(new Events.ErrorEvent(Error('TIMEOUT'), this._ws))
  }

  private _disconnect(code = 1000, reason?: string) {
    this._clearTimeouts()
    if (!this._ws) {
      return
    }
    this._removeListeners()
    try {
      this._ws.close(code, reason)
      this._handleClose(new Events.CloseEvent(code, reason, this))
    } catch (error) {
      // ignore
    }
  }

  private _acceptOpen() {
    this._logger.info('accept open')
    this._retryCount = 0
  }

  private _handleOpen = () => {
    this._logger.debug('open event')
    const { minUptime } = this._options

    clearTimeout(this._connectTimeout)
    this._uptimeTimeout = setTimeout(() => this._acceptOpen(), minUptime)

    // send enqueued messages (messages sent before websocket open event)
    this._messageQueue.forEach(message => this._ws?.send(message))
    this._messageQueue = []

    if (this.onopen) {
      this.onopen()
    }

    this._listeners.open.forEach(listener => listener())
  }

  private _handleMessage = (event: WebSocket.MessageEvent) => {
    this._logger.debug('message event')

    if (this.onmessage) {
      this.onmessage(event)
    }
    this._listeners.message.forEach(listener => listener(event))
  }

  private _handleError = (event: Events.ErrorEvent) => {
    this._logger.error(event.message)
    this._disconnect(undefined, event.message === 'TIMEOUT' ? 'timeout' : undefined)

    this._logger.debug('exec error listeners')
    this._listeners.error.forEach(listener => listener(event))

    this._connect()
  }

  private _handleClose = (event: Events.CloseEvent) => {
    this._logger.debug('close event')
    this._clearTimeouts()

    if (this._shouldReconnect) {
      this._connect()
    }

    if (this.onclose) {
      this.onclose(event)
    }

    this._listeners.close.forEach(listener => listener(event))
  }

  private _removeListeners() {
    if (!this._ws) {
      return
    }
    this._logger.debug('removeListeners')
    this._ws.removeEventListener('open', () => this._handleOpen())
    this._ws.removeEventListener('close', event => this._handleClose(event))
    this._ws.removeEventListener('message', event => this._handleMessage(event as any))
    this._ws.removeEventListener('error', event => this._handleError(event))
  }

  private _addListeners() {
    if (!this._ws) {
      return
    }
    this._logger.debug('addListeners')
    this._ws.addEventListener('open', _event => this._handleOpen())
    this._ws.addEventListener('close', event => this._handleClose(event))
    this._ws.addEventListener('message', event => this._handleMessage(event as any))
    this._ws.addEventListener('error', event => this._handleError(event))
  }

  private _clearTimeouts() {
    clearTimeout(this._connectTimeout)
    clearTimeout(this._uptimeTimeout)
  }
}
