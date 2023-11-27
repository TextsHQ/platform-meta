import { readFile } from 'fs/promises'
// @ts-expect-error
import { describe, expect, test } from 'bun:test'
import { getMessengerConfig, parseMessengerInitialPage } from './messenger-config'
import { generateCallList } from '../payload-parser'
import { EnvKey } from '../env'

const instagramHtml = readFile('./fixtures/instagram.com.direct.html', 'utf-8')
const messengerHtml = readFile('./fixtures/messenger.com.html', 'utf-8')
const facebookHtml = readFile('./fixtures/facebook.com.messages.html', 'utf-8')

function makeTests(
  html: string,
  env: string,
  appId: string,
  mqttEndpoint: string,
) {
  const parsed = parseMessengerInitialPage(html)
  const config = getMessengerConfig(html)

  test('parse initially loaded html', async () => {
    expect(parsed).toMatchSnapshot()
  })

  test('parse config & initial payloads', () => {
    expect(config).toMatchSnapshot()
    expect(config.env).toMatch(env)
    expect(String(config.appId)).toMatch(appId)
    expect(String(config.mqttEndpoint)).toMatch(mqttEndpoint)
    config.initialPayloads?.forEach(fixture => {
      const callList = generateCallList(env as EnvKey, fixture)
      expect(callList).toMatchSnapshot()
    })
  })
}

describe('parse https://www.instagram.com/direct/', async () => {
  makeTests(await instagramHtml, 'IG', '936619743392459', 'wss://edge-chat.instagram.com/chat')
})

describe('parse https://www.messenger.com/', async () => {
  makeTests(await messengerHtml, 'MESSENGER', '772021112871879', 'wss://edge-chat.messenger.com/chat')
})

describe('parse https://www.facebook.com/messages/', async () => {
  makeTests(await facebookHtml, 'FB', '2220391788200892', 'wss://edge-chat.facebook.com/chat')
})
