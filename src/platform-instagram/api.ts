import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import PlatformAPI from '../api'

// Load environment variables from .env file
dotenv.config()

interface ProxyConfig {
  host: string
  port: number
  auth?: {
    username: string
    password: string
  }
}

export default class PlatformInstagram extends PlatformAPI {
  private axiosInstance: AxiosInstance

  constructor(readonly accountID: string) {
    super(accountID, 'IG')

    // Create proxy configuration from environment variables
    const proxyConfig: ProxyConfig | undefined = process.env.PROXY_HOST && process.env.PROXY_PORT ? {
      host: process.env.PROXY_HOST,
      port: parseInt(process.env.PROXY_PORT, 10),
      auth: process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD ? {
        username: process.env.PROXY_USERNAME,
        password: process.env.PROXY_PASSWORD,
      } : undefined,
    } : undefined

    // Create an Axios instance with proxy configuration if provided
    this.axiosInstance = axios.create({
      baseURL: 'https://api.instagram.com', // Replace with actual base URL
      headers: {
        'User-Agent': 'Your User Agent', // Replace with appropriate User-Agent
      },
      ...(proxyConfig && {
        proxy: {
          host: proxyConfig.host,
          port: proxyConfig.port,
          auth: proxyConfig.auth ? {
            username: proxyConfig.auth.username,
            password: proxyConfig.auth.password,
          } : undefined,
        },
      }),
    })
  }

  // Example function to fetch Instagram threads using the axios instance
  public async fetchInstagramThreads(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/v1/threads') // Replace with actual endpoint
      return response.data
    } catch (error) {
      console.error('Error fetching Instagram threads:', error)
      throw error
    }
  }

  // Other functions that interact with Instagram can use this.axiosInstance...
}
