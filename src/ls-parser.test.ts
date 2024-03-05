import injectGlobals from '@textshq/platform-test-lib'
injectGlobals(true, false, __dirname)

import { expect, test } from 'bun:test'

const file = Bun.file('./fixtures/ig-socket-responses.json')

interface MMResponse {
  request_id: number | null
  payload: string
  sp: string[]
  target: number
}

test('parse payloads to calls', async () => {
  const fixtures = await file.json<MMResponse[]>()
  const { LSParser } = await import('./ls-parser')

  fixtures.forEach(({payload}) => {
    const payloads = LSParser.parse(payload)
    expect(payloads).toMatchSnapshot()
  })
})

// test('parse config & initial payloads', async () => {
//   expect(config).toMatchSnapshot()
//   expect(config.env).toMatch(env)
//   expect(String(config.appId)).toMatch(appId)
//   expect(String(config.mqttEndpoint)).toMatch(mqttEndpoint)
//   for (let i = 0; i < config.initialPayloads.length; i++) {
//     const { LSParser } = await import('./ls-parser')
//     const payloads = LSParser.parse(config.initialPayloads[i])
//     expect(payloads).toMatchSnapshot()
//   }
// })
