// mimics meta's error handling

class MqttError {
  code: number

  name: string

  message: string

  constructor(code: number, name: string, message: string) {
    this.code = code
    this.name = name
    this.message = message
  }
}

export const MqttErrors = Object.freeze({
  SOCKET_ERROR: new MqttError(1, 'SOCKET_ERROR', 'Socket error'),
  SOCKET_MESSAGE: new MqttError(2, 'SOCKET_MESSAGE', 'Unable to parse invalid socket message'),
  INVALID_DATA_TYPE: new MqttError(3, 'INVALID_DATA_TYPE', 'Received non-arraybuffer from socket.'),
  CONNECT_TIMEOUT: new MqttError(4, 'CONNECT_TIMEOUT', 'Connect timed out'),
  CONNACK_FAILURE: new MqttError(5, 'CONNACK_FAILURE', 'Connection failure due to connack'),
  PING_TIMEOUT: new MqttError(6, 'PING_TIMEOUT', 'Ping timeout'),
  APP_DISCONNECT: new MqttError(7, 'APP_DISCONNECT', 'Disconnect initiated by app'),
  SERVER_DISCONNECT: new MqttError(8, 'SERVER_DISCONNECT', 'Disconnect message sent by server'),
  SOCKET_CLOSE: new MqttError(9, 'SOCKET_CLOSE', 'Socket connection closed'),
  RECONNECT: new MqttError(10, 'RECONNECT', 'Reconnecting'),
  BROWSER_CLOSE: new MqttError(11, 'BROWSER_CLOSE', 'Browser closed'),
})

export class ConnectFailure {
  mqttError: MqttError

  connAck: unknown

  constructor(mqttError: MqttError, connAck: unknown) {
    this.mqttError = mqttError
    this.connAck = connAck
  }
}

class MqttChannelError extends Error {
  isRecoverable: boolean

  originalError: Error | null

  constructor(isRecoverable: boolean, message: string, originalError: Error | null = null) {
    super(message)
    this.isRecoverable = isRecoverable
    this.originalError = originalError
  }
}

export { MqttError, MqttChannelError }
