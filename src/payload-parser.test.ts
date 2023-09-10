// @ts-expect-error
import { expect, test } from 'bun:test'
import { generateCallList, type MMResponse, safeNumberOrString } from './payload-parser'

const fixtures: MMResponse[] = require('../fixtures/ig-socket-responses.json')

test('parse payloads to calls', () => {
  fixtures.forEach(fixture => {
    expect(generateCallList('IG', fixture.payload)).toMatchSnapshot()
  })
})

test('parse numbers safely', () => {
  expect(safeNumberOrString(1)).toBe(1)
  const bigint = safeNumberOrString(7123610494333461)
  expect(bigint.toString()).toBe('7123610494333461')
})
