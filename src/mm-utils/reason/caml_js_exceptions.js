import * as Caml_option from './caml_option'
import * as Caml_exceptions from './caml_exceptions'

export const $$Error = 'JsError'

export function internalToOCamlException(e) {
  if (Caml_exceptions.is_extension(e)) {
    return e
  }
  return {
    RE_EXN_ID: 'JsError',
    _1: e,
  }
}

export function as_js_exn(exn) {
  if (exn.RE_EXN_ID === $$Error) {
    return Caml_option.some(exn._1)
  }
}
