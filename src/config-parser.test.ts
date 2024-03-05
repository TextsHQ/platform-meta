import injectGlobals from '@textshq/platform-test-lib'
injectGlobals(true, false, __dirname)

import { readFile } from 'fs/promises'
import { describe, expect, test } from 'bun:test'

const instagramHtml = readFile('./fixtures/instagram.com.direct.html', 'utf-8')
const messengerHtml = readFile('./fixtures/messenger.com.html', 'utf-8')
const facebookHtml = readFile('./fixtures/facebook.com.messages.html', 'utf-8')

function makeTests(getHtml: Promise<string>) {
  test('parse initially loaded html', async () => {
    const { getMessengerConfig } = await import('./config-parser')
    const config = getMessengerConfig(await getHtml)

    expect(config.env).toMatchSnapshot()
    expect(config.appId).toMatchSnapshot()
    expect(config.clientId).toMatchSnapshot()
    expect(config.fb_dtsg).toMatchSnapshot()
    expect(config.fbid).toMatchSnapshot()
    expect(config.name).toMatchSnapshot()
    expect(config.polarisViewer).toMatchSnapshot()
    expect(config.lsdToken).toMatchSnapshot()
    expect(config.siteData).toMatchSnapshot()
    expect(config.mqttEndpoint).toMatchSnapshot()
    expect(config.mqttCapabilities).toMatchSnapshot()
    expect(config.mqttClientCapabilities).toMatchSnapshot()
    expect(config.syncParams).toMatchSnapshot()
    expect(config.initialPayloads.length).toMatchSnapshot()
    expect(config.gqlEndpointPath).toMatchSnapshot()
    expect(config.gqlCustomHeaders).toMatchSnapshot()
    expect(config.sprinkleConfig).toMatchSnapshot()
    expect(config.currentLocale).toMatchSnapshot()
    expect(config.bitmaps).toMatchSnapshot()
    expect(config.eqmc).toMatchSnapshot()
    expect(config.server_app_id).toMatchSnapshot()
    expect(config.jsErrorLogging).toMatchSnapshot()
    expect(config.webConnectionClassServerGuess).toMatchSnapshot()
    expect(config.webSessionId).toMatchSnapshot()
    expect(config.syncData.version).toMatchSnapshot()
    expect(config.syncData.needSync).toMatchSnapshot()
    expect(config.syncData.syncPayloads.length).toMatchSnapshot()
    expect(config.syncData.links.length).toMatchSnapshot()
  })

}

describe('parse https://www.instagram.com/direct/', async () => {
  makeTests(instagramHtml)
})

describe('parse https://www.messenger.com/', async () => {
  makeTests(messengerHtml)
})

describe('parse https://www.facebook.com/messages/', async () => {
  makeTests(facebookHtml)
})
