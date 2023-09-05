// @ts-expect-error
import { expect, test } from 'bun:test'
import { generateCallList, type IGResponse, safeNumberOrString } from './payload-parser'

const fixtures: IGResponse[] = require('../fixtures/ig-socket-responses.json')

test('parse payloads to calls', () => {
  fixtures.forEach(fixture => {
    expect(generateCallList(fixture.payload)).toMatchSnapshot()
  })
})

test('parse numbers safely', () => {
  expect(safeNumberOrString(1)).toBe(1)
  const bigint = safeNumberOrString(7123610494333461)
  expect(bigint.toString()).toBe('7123610494333461')
})
