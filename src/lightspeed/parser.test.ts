import { readFileSync } from 'fs'
import { expect, test } from 'bun:test'
import { join } from 'path'
import LightSpeedParser from './parser'

test('parse lightspeed', () => {
  console.time('benchmark')
  const test_data = JSON.parse(readFileSync(join(__dirname, './test_data.json'), 'utf-8'))
  const parser = new LightSpeedParser()
  parser.decode(JSON.parse(test_data.__bbox?.result?.data?.viewer?.lightspeed_web_request?.payload).step)
  expect(parser.table).toMatchSnapshot()
  console.timeEnd('benchmark')
})
