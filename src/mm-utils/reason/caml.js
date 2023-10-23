export function int_compare(x, y) {
  if (x < y) {
    return -1
  } if (x === y) {
    return 0
  }
  return 1
}

export function bool_compare(x, y) {
  if (x) {
    if (y) {
      return 0
    }
    return 1
  } if (y) {
    return -1
  }
  return 0
}

export function float_compare(x, y) {
  if (x === y) {
    return 0
  } if (x < y) {
    return -1
    // eslint-disable-next-line no-self-compare
  } if (x > y || x === x) {
    return 1
    // eslint-disable-next-line no-self-compare
  } if (y === y) {
    return -1
  }
  return 0
}

export function string_compare(s1, s2) {
  if (s1 === s2) {
    return 0
  } if (s1 < s2) {
    return -1
  }
  return 1
}

export function bool_min(x, y) {
  if (x) {
    return y
  }
  return x
}

export function int_min(x, y) {
  if (x < y) {
    return x
  }
  return y
}

export function float_min(x, y) {
  if (x < y) {
    return x
  }
  return y
}

export function string_min(x, y) {
  if (x < y) {
    return x
  }
  return y
}

export function bool_max(x, y) {
  if (x) {
    return x
  }
  return y
}

export function int_max(x, y) {
  if (x > y) {
    return x
  }
  return y
}

export function float_max(x, y) {
  if (x > y) {
    return x
  }
  return y
}

export function string_max(x, y) {
  if (x > y) {
    return x
  }
  return y
}

export function i64_eq(x, y) {
  if (x[1] === y[1]) {
    return x[0] === y[0]
  }
  return false
}

export function i64_ge(param, param$1) {
  const other_hi = param$1[0]
  const hi = param[0]
  if (hi > other_hi) {
    return true
  } if (hi < other_hi) {
    return false
  }
  return param[1] >= param$1[1]
}

export function i64_neq(x, y) {
  return !i64_eq(x, y)
}

export function i64_lt(x, y) {
  return !i64_ge(x, y)
}

/**
 * int64 greater than
 * @param x {[number,number]}
 * @param y {[number,number]}
 * @returns {boolean}
 */
export function i64_gt(x, y) {
  if (x[0] > y[0]) {
    return true
  } if (x[0] < y[0]) {
    return false
  }
  return x[1] > y[1]
}

export function i64_le(x, y) {
  return !i64_gt(x, y)
}

export function i64_min(x, y) {
  if (i64_ge(x, y)) {
    return y
  }
  return x
}

export function i64_max(x, y) {
  if (i64_gt(x, y)) {
    return x
  }
  return y
}
