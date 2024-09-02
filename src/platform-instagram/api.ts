import axios, { AxiosInstance } from 'axios';
import PlatformAPI from '../api';

interface ProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

export default class PlatformInstagram extends PlatformAPI {
  private proxyConfig?: ProxyConfig;
  private axiosInstance: AxiosInstance;

  constructor(readonly accountID: string, proxyConfig?: ProxyConfig) {
    super(accountID, 'IG');
    this.proxyConfig = proxyConfig;

    // Create an Axios instance with proxy configuration if provided
    this.axiosInstance = axios.create({
      baseURL: 'https://api.instagram.com', // Replace with actual base URL
      ...(proxyConfig && {
        proxy: {
          host: proxyConfig.host,
          port: proxyConfig.port,
          auth: proxyConfig.auth,
        },
      }),
      headers: {
        'User-Agent': 'Your User Agent', // Replace with appropriate User-Agent
      },
    });
  }

  // Example function to fetch Instagram threads using the axios instance

  // Other functions that interact with Instagram can use this.axiosInstance...
}
