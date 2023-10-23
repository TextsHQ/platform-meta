export const id = {
  contents: 0,
}

export function create(str) {
  id.contents = id.contents + 1 | 0
  return str + ('/' + id.contents)
}

export function is_extension(e) {
  if (e == null) {
    return false
  }
  return typeof e.RE_EXN_ID === 'string'
}

export function exn_slot_name(x) {
  return x.RE_EXN_ID
}
