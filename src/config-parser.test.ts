import injectGlobals from '@textshq/platform-test-lib'
injectGlobals(true, false, __dirname)

import { readFile } from 'fs/promises'
import { describe, expect, test } from 'bun:test'

const instagramHtml = readFile('./fixtures/instagram.com.direct.html', 'utf-8')
const messengerHtml = readFile('./fixtures/messenger.com.html', 'utf-8')
const facebookHtml = readFile('./fixtures/facebook.com.messages.html', 'utf-8')

async function parse(getHtml: Promise<string>) {
  const { getMessengerConfig, parseMessengerInitialPage } = await import('./config-parser')
  const html = await getHtml
  return {
    parsed: parseMessengerInitialPage(html),
    config: getMessengerConfig(html),
  }
}

function makeTests(
  { parsed , config }: Awaited<ReturnType<typeof parse>>,
  env: string,
  appId: string,
  mqttEndpoint: string,
) {
  test('parse initially loaded html', async () => {
    expect(parsed).toMatchSnapshot()
  })

  test('parse config & initial payloads', () => {
    expect(config).toMatchSnapshot()
    expect(config.env).toMatch(env)
    expect(String(config.appId)).toMatch(appId)
    expect(String(config.mqttEndpoint)).toMatch(mqttEndpoint)
    config.initialPayloads?.forEach(async (fixture) => {
      const { LSParser } = await import('./ls-parser')
      const payloads = LSParser.parse(fixture)
      expect(payloads).toMatchSnapshot()
    })
  })
}

describe('parse https://www.instagram.com/direct/', async () => {
  makeTests(await parse(instagramHtml), 'IG', '936619743392459', 'wss://edge-chat.instagram.com/chat')
})

describe('parse https://www.messenger.com/', async () => {
  makeTests(await parse(messengerHtml), 'MESSENGER', '772021112871879', 'wss://edge-chat.messenger.com/chat')
})

describe('parse https://www.facebook.com/messages/', async () => {
  makeTests(await parse(facebookHtml), 'FB', '2220391788200892', 'wss://edge-chat.facebook.com/chat')
})
