import { CookieJar } from "tough-cookie";
import axios, { type AxiosInstance } from 'axios'
import type Instagram from "./api";
import { FetchOptions, RateLimitError, texts } from "@textshq/platform-sdk";
import InstagramWebSocket from "./ig-socket";

const USER_AGENT_TEMPORARY =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";

const INSTAGRAM_BASE_URL = "https://www.instagram.com/";

type Session = {
  clientId: string;
  dtsg: string;
  userId: string;
}

export default class InstagramAPI {
  // @TODO: move to `this.http`
  private axios: AxiosInstance

  session: Session

  private socket: InstagramWebSocket

  constructor(private readonly papi: Instagram) {
    this.axios = axios.create({
      baseURL: "https://www.instagram.com/",
      headers: {
        ...this.headers,
      },
      // transformRequest: [
      //   (data, headers) => {

      //   headers["cookie"] = this.jar.getCookieStringSync(INSTAGRAM_BASE_URL);
      //   return data;
      //   },
      //   ...(Array.isArray(axios.defaults.transformRequest)
      //     ? axios.defaults.transformRequest
      //     : [axios.defaults.transformRequest]),
      // ],
    })

    this.axios.interceptors.request.use (
      async (config) => {
        config.headers.set('cookie', this.jar.getCookieStringSync(INSTAGRAM_BASE_URL))
        return config;
      },
      (error) => {
        return Promise.reject (error);
      }
    );

    // this.init();
  }

  private http = texts.createHttpClient()

  authMethod: 'login-window' | 'extension' = 'login-window'

  jar: CookieJar;

  ua = USER_AGENT_TEMPORARY || texts.constants.USER_AGENT;

  async init() {
    texts.log("Initializing Instagram API...");
    const { clientId, dtsg, userId } = await this.getClientID();
    this.session = { clientId, dtsg, userId };
    texts.log(`Session: ${JSON.stringify(this.session)}`);
    this.socket = new InstagramWebSocket(this);
  }

  async getClientID() {
    const response = await this.axios.get("https://www.instagram.com/direct/");
    const resp = response.data;
    const clientId = resp.slice(resp.indexOf('{"clientID":')).split('"')[3];
    const dtsg = resp.slice(resp.indexOf("DTSGInitialData")).split('"')[4];
    const userId = resp.match(/"IG_USER_EIMU":"([^"]+)"/)?.[1];
    return { clientId, dtsg, userId };
  }

  get headers() {
    return {
      authority: "www.instagram.com",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
      "cache-control": "max-age=0",
      "sec-ch-prefers-color-scheme": "light",
      "sec-ch-ua":
        '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      "sec-ch-ua-full-version-list":
        '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.133", "Google Chrome";v="114.0.5735.133"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua-platform-version": '"13.2.1"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": this.ua,
      "viewport-width": "558",
    };
  }

  // private async call<ResultType = any>(url, jsonBody?: any, optOverrides?: Partial<FetchOptions>, attempt?: number): Promise<ResultType> {
  //   const opts: FetchOptions = {
  //     body: jsonBody ? JSON.stringify(jsonBody) : undefined,
  //     headers: {
  //       ...this.headers,
  //       Referer: 'https://www.instagram.com/',
  //     },
  //     cookieJar: this.jar,
  //     ...optOverrides,
  //   }
  //   const url = `${ENDPOINT}${pathname}`
  //   const res = await this.http.requestAsString(url, opts)
  //   if (res.statusCode === 429) throw new RateLimitError()
  //   if (res.body[0] === '<') {
  //     if (res.statusCode === 403 && !attempt) {
  //       await this.cfChallenge()
  //       return this.call<ResultType>(pathname, jsonBody, optOverrides, (attempt || 0) + 1)
  //     }
  //     if (res.statusCode >= 400) throw Error(`${url} returned status code ${res.statusCode}`)
  //     console.log(res.statusCode, url, res.body)
  //     throw new ExpectedJSONGotHTMLError(res.statusCode, res.body)
  //   } else if (res.body.startsWith('Internal')) {
  //     console.log(res.statusCode, url, res.body)
  //     throw Error(res.body)
  //   } else if (!res.body) {
  //     throw Error('falsey body')
  //   }
  //   const json = JSON.parse(res.body)
  //   if (json?.detail) { // potential error
  //     texts.error(url, json.detail)
  //   }
  //   return json as ResultType
  // }

}
