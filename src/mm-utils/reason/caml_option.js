export function some(x) {
  if (x === undefined) {
    return {
      BS_PRIVATE_NESTED_SOME_NONE: 0,
    }
  } if (x !== null && x.BS_PRIVATE_NESTED_SOME_NONE !== undefined) {
    return {
      BS_PRIVATE_NESTED_SOME_NONE: x.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0,
    }
  }
  return x
}

export function valFromOption(x) {
  if (!(x !== null && x.BS_PRIVATE_NESTED_SOME_NONE !== undefined)) {
    return x
  }
  const depth = x.BS_PRIVATE_NESTED_SOME_NONE
  if (depth === 0) return

  return {
    BS_PRIVATE_NESTED_SOME_NONE: depth - 1 | 0,
  }
}
