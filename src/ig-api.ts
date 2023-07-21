import { CookieJar } from "tough-cookie";
import axios, { type AxiosInstance } from 'axios'
import type Instagram from "./api";
import { FetchOptions, RateLimitError, User, texts } from "@textshq/platform-sdk";
import InstagramWebSocket from "./ig-socket";
import parseConversationsResponse from "./parsers/conversations";

const USER_AGENT_TEMPORARY =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";

const INSTAGRAM_BASE_URL = "https://www.instagram.com/" as const

const fixUrl = (url: string) => url && decodeURIComponent(url.replace(/\\u0026/g, "&"));

type Session = {
  clientId: string;
  dtsg: string;
  fbid: string;
}

interface InstagramParsedViewerConfig {
  biography: string;
  business_address_json: null;
  business_contact_method: string;
  business_email: null;
  business_phone_number: null;
  can_see_organic_insights: boolean;
  category_name: null;
  external_url: null;
  fbid: string;
  full_name: string;
  has_phone_number: boolean;
  has_profile_pic: boolean;
  has_tabbed_inbox: boolean;
  hide_like_and_view_counts: boolean;
  id: string;
  is_business_account: boolean;
  is_joined_recently: boolean;
  is_supervised_user: boolean;
  guardian_id: null;
  is_private: boolean;
  is_professional_account: boolean;
  is_supervision_enabled: boolean;
  profile_pic_url: string;
  profile_pic_url_hd: string;
  should_show_category: boolean;
  should_show_public_contacts: boolean;
  username: string;
}

export default class InstagramAPI {
  // @TODO: move to `this.http`
  private axios: AxiosInstance

  session: Session

  viewerConfig: InstagramParsedViewerConfig

  private socket: InstagramWebSocket
  private http = texts.createHttpClient()

  constructor(private readonly papi: Instagram) {
    this.axios = axios.create({
      baseURL: "https://www.instagram.com/",
      headers: {
        ...this.headers,
      },
      // transformRequest: [
      //   (data, headers) => {

      //   headers["cookie"] = this.jar.getCookies();
      //   return data;
      //   },
      //   ...(Array.isArray(axios.defaults.transformRequest)
      //     ? axios.defaults.transformRequest
      //     : [axios.defaults.transformRequest]),
      // ],
    })

    this.axios.interceptors.request.use (
      async (config) => {
        config.headers.set('cookie', this.getCookies())
        return config;
      },
      (error) => {
        return Promise.reject (error);
      }
    );

    // this.init();
  }

  authMethod: 'login-window' | 'extension' = 'login-window'

  jar: CookieJar;

  ua = USER_AGENT_TEMPORARY || texts.constants.USER_AGENT;

  currentUser: InstagramParsedViewerConfig;

  async init() {
    texts.log("Initializing Instagram API...");
    const { clientId, dtsg, fbid, config } = await this.getClientID();
    this.session = { clientId, dtsg, fbid  };
    this.papi.currentUser = {
      id: config.id,
      fullName: config.full_name,
      imgURL: fixUrl(config.profile_pic_url_hd),
      username: config.username,
    }
    texts.log(`Session: ${JSON.stringify(this.session)}`);
    this.socket = new InstagramWebSocket(this);
    try {
      const me = await this.getMe();
      texts.log(`Logged in as someone ${JSON.stringify(me)}`);
    } catch (e) {
      texts.error(e);
    }

    try {
      const user = await this.getUserByUsername('texts_hq')
      texts.log(`getUserByUsername ${'texts_hq'} response: ${JSON.stringify(user, null, 2)}`)
    } catch (e) {
      texts.error(e);
    }
  }

  async getClientID() {
    const response = await this.axios.get("https://www.instagram.com/direct/");
    const resp = response.data;
    const clientId = resp.slice(resp.indexOf('{"clientID":')).split('"')[3];
    const dtsg = resp.slice(resp.indexOf("DTSGInitialData")).split('"')[4];
    const fbid = resp.match(/"IG_USER_EIMU":"([^"]+)"/)?.[1]; // fbid
    const sharedData = resp.match(/"XIGSharedData",\[\],({.*?})/s)[1];
    // @TODO: this is disgusting
    const config: InstagramParsedViewerConfig = JSON.parse(`${sharedData.split('"viewer\\":')[1].split(',\\"badge_count')[0]}}`.replace(/\\\"/g, '"'))
    console.log({
      clientId,
      dtsg,
      fbid,
      config,
    })
    return { clientId, dtsg, fbid, config };
  }

  getCookies() {
    // @TODO:use our http client for requests
    return this.jar.getCookieStringSync(INSTAGRAM_BASE_URL);
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

  // they have different gql endpoints will merge these later
  async getUserByUsername(username: string) {
    texts.log(`getUserByUsername ${username}`)
    const csrf = this.getCSRFToken()
    texts.log(`getUserByUsername ${username} csrf: ${csrf}`)
    // const req = await this.http.requestAsString(
    //   `${INSTAGRAM_BASE_URL}api/v1/users/web_profile_info/?username=${username}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "accept": "*/*",
    //       "accept-language": "en-US,en;q=0.9",
    //       "sec-ch-prefers-color-scheme": "dark",
    //       "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\"",
    //       "sec-ch-ua-full-version-list": "\"Not.A/Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"114.0.5735.198\"",
    //       "sec-ch-ua-mobile": "?0",
    //       "sec-ch-ua-platform": "\"macOS\"",
    //       "sec-ch-ua-platform-version": "\"13.5.0\"",
    //       "sec-fetch-dest": "empty",
    //       "sec-fetch-mode": "cors",
    //       "sec-fetch-site": "same-origin",
    //       "viewport-width": "881",
    //       "x-asbd-id": "129477",
    //       "x-csrftoken": "u3QVKfG9QNxZqEVLK2YcLKvuAYt87vSv",
    //       "x-ig-app-id": "936619743392459",
    //       "x-ig-www-claim": "hmac.AR2iCvyZhuDG-oJQ0b4-4DlKN9a9bGK2Ovat6h04VbnVxuUU",
    //       "x-requested-with": "XMLHttpRequest",
    //       // "cookie": "mid=ZLl6YgAEAAFgZv0wP7kmw9Uve5up; ig_did=FD68E647-03A8-46BE-9857-B22F379603B9; csrftoken=u3QVKfG9QNxZqEVLK2YcLKvuAYt87vSv; ds_user_id=61202728161; datr=zJu5ZJIC4XmnHt3l2wMwYZM4; dpr=1; rur=\"ODN\\05461202728161\\0541721487538:01f7a92043ac734c4325c6cc22ed9f446a650adecc328eab4a57b62220af7646c6d9308a\"; sessionid=61202728161%3A2THbT3AI1z4NBY%3A18%3AAYdYi8_qIbwwojaIh6UuGsTijP_T1SdffwaFBHlMGQ",
    //       "Referer": `https://www.instagram.com/${username}/`,
    //       "Referrer-Policy": "strict-origin-when-cross-origin"
    //     },
    //     body: null,
    //     cookieJar: this.jar,
    //   }
    // )
    const response = await this.axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\"",
        "sec-ch-ua-full-version-list": "\"Not.A/Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"114.0.5735.198\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-ch-ua-platform-version": "\"13.5.0\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "viewport-width": "881",
        "x-asbd-id": "129477",
        "x-csrftoken": "u3QVKfG9QNxZqEVLK2YcLKvuAYt87vSv",
        "x-ig-app-id": "936619743392459",
        "x-ig-www-claim": "hmac.AR2iCvyZhuDG-oJQ0b4-4DlKN9a9bGK2Ovat6h04VbnVxuUU",
        "x-requested-with": "XMLHttpRequest",
        "cookie": this.getCookies(),
        "Referer": `https://www.instagram.com/${username}/`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
    });
    // const json = JSON.parse(req.body)
    const data = await response.data
    const userInfo = data?.data?.user
    const user: User = {
      id: userInfo?.id,
      fullName:  userInfo?.full_name,
      username: userInfo?.username,
    }
    texts.log(`getUserByUsername ${username} response: ${JSON.stringify(user, null, 2)}`)
    return user
  }

  async apiCall<T extends {}>(doc_id: string, variables: T) {
    const response = await this.axios.post(
      "https://www.instagram.com/api/graphql/",
      `fb_dtsg=${this.session.dtsg}&variables=${JSON.stringify(variables)}&doc_id=${doc_id}`,
      {
        headers: {
          authority: 'www.instagram.com',
          'content-type': 'application/x-www-form-urlencoded',
          cookie: this.getCookies(),
        },
        method: 'POST',
      }
    );
    texts.log(`apiCall ${doc_id} response: ${JSON.stringify(response.data, null, 2)}`)
    return response;
  }

  // get username from here
  async getUserById(userID: string) {
    texts.log(`getUser ${userID}`)
    const response = await this.apiCall('6083412141754133', {
      userID,
    });
    texts.log(`getUser ${userID} response: ${JSON.stringify(response.data)}`)
    const data = response.data as {
      data: {
        userInfo: {
          user: {
            username: string
            show_ig_app_switcher_badge: boolean
            id: string
          }
        }
      }
      extensions: {
        is_final: boolean
      }
    }
    return {
      id: data?.data?.userInfo?.user?.id,
      username: data?.data?.userInfo?.user?.username,
      fullName: data?.data?.userInfo?.user?.username, //@TODO
    }
  }

  async getMe() {
    if (!this.viewerConfig) return
    const data = await this.getUserById(this.viewerConfig.id)
    const username = data.username
    if (!username) return
    const user = await this.getUserByUsername(username)
    return user
  }

  getCSRFToken() {
    return this.jar.getCookiesSync(INSTAGRAM_BASE_URL).find(c => c.key === 'csrftoken')?.value
  }

  async apiCallForConversations(cursor = null) {
    const response = await this.axios.post(
      "https://www.instagram.com/api/graphql/",
      new URLSearchParams({
        fb_dtsg: this.session.dtsg,
        variables: JSON.stringify({
          deviceId: this.session.clientId,
          requestId: 0,
          requestPayload: JSON.stringify({
            database: 1,
            epoch_id: 0,
            last_applied_cursor: cursor,
            sync_params: JSON.stringify({}),
            version: 9477666248971112,
          }),
          requestType: 1,
        }),
        doc_id: "6195354443842040",
      }),
      {
        headers: {
          authority: "www.instagram.com",
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
          "cache-control": "no-cache",
          origin: "https://www.instagram.com",
          pragma: "no-cache",
          referer: "https://www.instagram.com/",
          "sec-ch-prefers-color-scheme": "dark",
          "sec-ch-ua":
            '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          "sec-ch-ua-full-version-list":
            '"Not.A/Brand";v="8.0.0.0", "Chromium";v="114.0.5735.133", "Google Chrome";v="114.0.5735.133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-ch-ua-platform-version": '"13.2.1"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          "x-ig-app-id": "936619743392459",
        },
      }
    );
    return response;
  }

  async fetchInitialConversations() {
    const response = await this.apiCallForConversations();
    const { newConversations, cursor } = parseConversationsResponse(
      this.session.fbid,
      response.data.data.lightspeed_web_request_for_igd.payload
    );
    return { newConversations, cursor };
  }
}
