import { readFile } from 'fs/promises'
// @ts-expect-error
import { expect, test } from 'bun:test'
import { extractMessengerConfig, SupportedCalls } from './messenger-config'

const instagramHtml = readFile('./fixtures/instagram.com.direct.html', 'utf-8')
const messengerHtml = readFile('./fixtures/messenger.com.html', 'utf-8')
const facebookHtml = readFile('./fixtures/facebook.com.messages.html', 'utf-8')

test('parse instagram.com/direct html for values', async () => {
  const html = await instagramHtml
  const calls = extractMessengerConfig(html, [SupportedCalls.MqttWebConfig])
  expect(calls).toMatchSnapshot()
})

test('parse messenger.com html for values', async () => {
  const html = await messengerHtml
  const calls = extractMessengerConfig(html, [SupportedCalls.MqttWebConfig])
  expect(calls).toMatchSnapshot()
})

test('parse facebook.com/messages html for values', async () => {
  const html = await facebookHtml
  const calls = extractMessengerConfig(html, [SupportedCalls.MqttWebConfig])
  expect(calls).toMatchSnapshot()
})
