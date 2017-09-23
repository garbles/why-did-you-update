import _ from 'lodash'
import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _union from 'lodash/union'
import _lodashDeep from 'lodash-deep'
import _Immutable from 'immutable'

_.mixin(_lodashDeep)

const isReferenceEntity = o => Array.isArray(o) || _isObject(o)

const isImmutable = (obj) => {
  return _Immutable.Iterable.isIterable(obj)
}

const bothAreImmutableAndStrictlyEqual = (a, b) => {
  return isImmutable(a) && isImmutable(b) && a === b
}

const bothAreImmutableAndDeeplyEqual = (a, b) => {
  return isImmutable(a) && isImmutable(b) && _isEqual(a.toJS(), b.toJS())
}

const atLeastOneIsImmutableAndNotStrictlyEqual = (a, b) => {
  return (isImmutable(a) || isImmutable(b)) && a !== b
}

const getValueAtPath = (obj, path) => {
  try {
    return path.split('.').reduce((acc, key) => acc[key], obj)
  } catch (e) {
  }
}

const containSomeNonStrictlyEqualImmutablesInside = (a, b) => {
  let retval
  _.deepMapValues(a, (value, path) => {
    if (atLeastOneIsImmutableAndNotStrictlyEqual(value, getValueAtPath(b, path))) {
      retval = true
    }
  })
  return retval
}

const containSomeStrictlyEqualImmutablesInside = (a, b) => {
  let retval
  _.deepMapValues(a, (value, path) => {
    if (bothAreImmutableAndStrictlyEqual(value, getValueAtPath(b, path))) {
      retval = true
    }
  })
  return retval
}

const containsOnlyStrictlyEqualImmutablesInside = (a, b) => {
  return (
    !containSomeNonStrictlyEqualImmutablesInside(a, b) &&
    containSomeStrictlyEqualImmutablesInside(a, b))
}

const forEachImmutableInside = (obj, cb) => {
  _.deepMapValues(obj, (value, path) => {
    if (isImmutable(value)) {
      cb(value, path)
    }
  })
}

const forEachNonImmutableInside = (obj, cb) => {
  _.deepMapValues(obj, (value, path) => {
    if (!isImmutable(value)) {
      cb(value, path)
    }
  })
}

const forEachDeeplyEqualImmutableInside = (a, b, cb) => {
  _.deepMapValues(a, (value, path) => {
    if (bothAreImmutableAndDeeplyEqual(value, getValueAtPath(b, path))) {
      cb(value, path)
    }
  })
}

const containsSomeImmutablesInside = (obj) => {
  let retval
  forEachImmutableInside(obj, () => retval = true)
  return retval
}

const containsSomeNonImmutablesInside = (obj) => {
  let retval
  forEachNonImmutableInside(obj, () => retval = true)
  return retval
}

const replaceImmutablesInside = (obj, replacer) => {
  return _.deepMapValues(obj, (value) => {
    return isImmutable(value) ? replacer(value) : value
  })
}

const nonImmutablesInsideAreDeeplyEqual = (a, b) => {
  return _isEqual(
    replaceImmutablesInside(a, () => 0),
    replaceImmutablesInside(b, () => 0))
}

const immutablesInsideAreDeeplyEqual = (a, b) => {
  return _isEqual(
    replaceImmutablesInside(a, (value) => value.toJS()),
    replaceImmutablesInside(b, (value) => value.toJS()))
}

const deepToJS = (obj) => {
  return replaceImmutablesInside(obj, value => value.toJS())
}

export const deepDiff = (prev, next, name, notes) => {
  if (containSomeNonStrictlyEqualImmutablesInside(prev, next)) {
    if (immutablesInsideAreDeeplyEqual(prev, next)) {
      forEachDeeplyEqualImmutableInside(prev, next, (value, path) => {
        const type = `immutable`
        const jsval = value.toJS()
        notes = notes.concat({name: `${name}.${path}`, prev: jsval, next: jsval, type})
      })
    }
    return notes
  }

  if (containsOnlyStrictlyEqualImmutablesInside(prev, next)) {
    if (containsSomeNonImmutablesInside(prev, next)) {
      if (!nonImmutablesInsideAreDeeplyEqual(prev, next)) {
        return notes
      }
    }
  }

  if (containsSomeImmutablesInside(prev)) {
    prev = deepToJS(prev)
  }

  if (containsSomeImmutablesInside(next)) {
    next = deepToJS(next)
  }

  const isRefEntity = isReferenceEntity(prev) && isReferenceEntity(next)
  const isDeepEqual = _isEqual(prev, next)

  if (!isDeepEqual) {
    const isFunc = _isFunction(prev) && _isFunction(next)
    if (isFunc) {
      if (prev.name === next.name) {
        const type = `function`
        return notes.concat({name, prev, next, type})
      }
    } else if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      return keys.reduce((acc, key) => deepDiff(prev[key], next[key], `${name}.${key}`, acc), notes)
    }
  } else if (prev !== next) {
    const type = `avoidable`
    if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      return keys.reduce((acc, key) => deepDiff(prev[key], next[key], `${name}.${key}`, acc), notes.concat({name, prev, next, type}))
    } else {
      return notes.concat({name, prev, next, type})
    }
  }

  return notes
}
