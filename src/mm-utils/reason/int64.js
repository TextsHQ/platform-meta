import * as Caml from './caml'
import * as Caml_int64 from './caml_int64'
import * as Caml_format from './caml_format'
import * as Caml_js_exceptions from './caml_js_exceptions'

function pred(n) {
  return Caml_int64.sub(n, Caml_int64.one)
}

function abs(n) {
  if (Caml.i64_ge(n, Caml_int64.zero)) {
    return n
  }
  return Caml_int64.neg(n)
}

function lognot(n) {
  return Caml_int64.xor(n, Caml_int64.neg_one)
}

function of_string_opt(s) {
  try {
    return Caml_format.int64_of_string(s)
  } catch (raw_exn) {
    const exn = Caml_js_exceptions.internalToOCamlException(raw_exn)
    if (exn.RE_EXN_ID === 'Failure') {
      return
    }
    throw exn
  }
}

const { compare } = Caml_int64

const { equal } = Caml_int64

const { zero } = Caml_int64

const { one } = Caml_int64

const minus_one = Caml_int64.neg_one

const { succ } = Caml_int64

const { max_int } = Caml_int64

const { min_int } = Caml_int64

const { to_string } = Caml_int64

export {
  zero,
  one,
  minus_one,
  succ,
  pred,
  abs,
  max_int,
  min_int,
  lognot,
  of_string_opt,
  to_string,
  compare,
  equal,
}
/* No side effect */
