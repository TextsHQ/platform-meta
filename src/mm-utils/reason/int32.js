import * as Caml from './caml'
import * as Caml_format from './caml_format'
import * as Caml_js_exceptions from './caml_js_exceptions'

export function succ(n) {
  return n + 1 | 0
}

export function pred(n) {
  return n - 1 | 0
}

export function abs(n) {
  if (n >= 0) {
    return n
  }
  return -n | 0
}

export function lognot(n) {
  return n ^ -1
}

export function to_string(n) {
  return Caml_format.format_int('%d', n)
}

export function of_string_opt(s) {
  try {
    return Caml_format.int_of_string(s)
  } catch (raw_exn) {
    const exn = Caml_js_exceptions.internalToOCamlException(raw_exn)
    if (exn.RE_EXN_ID === 'Failure') {
      return
    }
    throw exn
  }
}

export const compare = Caml.int_compare

export function equal(x, y) {
  return x === y
}

export const zero = 0

export const one = 1

export const minus_one = -1

export const max_int = 2147483647

export const min_int = -2147483648
