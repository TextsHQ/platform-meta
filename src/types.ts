import type { PlatformAPI } from '@textshq/platform-sdk'

export type MethodReturnType<T, K extends keyof T> = T[K] extends (...args: any[]) => infer R ? R : never

export type PAPIReturn<K extends keyof PlatformAPI> = Promise<Awaited<MethodReturnType<PlatformAPI, K>>>
