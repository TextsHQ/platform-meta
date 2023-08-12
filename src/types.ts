import type { PlatformAPI } from '@textshq/platform-sdk'
import type { CookieJar } from 'tough-cookie'

export type MethodReturnType<T, K extends keyof T> = T[K] extends (...args: any[]) => infer R ? R : never

export type PAPIReturn<K extends keyof PlatformAPI> = Promise<Awaited<MethodReturnType<PlatformAPI, K>>>

export interface SerializedSession {
  jar: CookieJar.Serialized
  ua?: string
  authMethod?: 'login-window' | 'extension'
  _v: 'v3'
  // clientId: string
  // dtsg: string
  // fbid: string
  // igUserId: string
  // lsd: string
  // wwwClaim: string
  // lastCursor: string
}
