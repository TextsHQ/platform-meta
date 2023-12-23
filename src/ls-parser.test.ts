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
