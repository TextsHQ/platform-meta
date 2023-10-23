import { getRandomValues } from 'node:crypto'
import { or_, and_, lsl_, to_int32, of_float, to_string, max_int, min_int, equal } from './reason/caml_int64'
import { i64_gt } from './reason/caml'
import { int64_of_string } from './reason/caml_format'

export type ReasonInt64 = [number, number]

function cast(a: unknown) {
  if (Array.isArray(a) && a.length === 2) return a as ReasonInt64
  throw new Error('invalid int64')
}

function random() {
  const b = Array.from(getRandomValues(new Uint32Array(2)))
  b[0] >>>= 1
  return b
}

export function LSCreateOfflineThreadingID(now = Date.now()) {
  const seed = random()
  return and_(
    or_(
      lsl_(now, to_int32(cast([0, 22]))),
      and_(seed, cast([0, 4194303])),
    ),
    cast([2147483647, 4294967295]),
  )
}

export function int64_to_string(a: ReasonInt64) {
  return to_string(a)
}

export function int64_from_string(s: string) {
  return int64_of_string(s)
}

export function int64_equal(a: ReasonInt64, b: ReasonInt64) {
  return equal(a, b)
}

export function int64_to_float(a: ReasonInt64) {
  return of_float(a)
}

export function int64_zero() {
  return cast([0, 0])
}

export function int64_gt(a: ReasonInt64, b: ReasonInt64) {
  return i64_gt(a, b)
}

export const INT64_MAX: ReasonInt64 = [max_int[0], max_int[1]]
export const INT64_MAX_AS_STRING = int64_to_string(INT64_MAX)

export const INT64_MIN: ReasonInt64 = [min_int[0], min_int[1]]
export const INT64_MIN_AS_STRING = int64_to_string(INT64_MIN)

export const INT64_ZERO: ReasonInt64 = [0, 0]
export const INT64_ZERO_AS_STRING = int64_to_string(INT64_ZERO)
