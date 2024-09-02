import PlatformAPI from '../api'

interface ProxyConfig {
  host: string
  port: number
  auth?: {
    username: string
    password: string
  }
}

export default class PlatformInstagram extends PlatformAPI {
  private proxyConfig?: ProxyConfig

  constructor(readonly accountID: string, proxyConfig?: ProxyConfig) {
    super(accountID, 'IG')
    this.proxyConfig = proxyConfig
  }
}
