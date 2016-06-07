import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _union from 'lodash/union'

const isReferenceEntity = o => Array.isArray(o) || _isObject(o)

export const deepDiff = (prev, next, name, notes) => {
  const isRefEntity = isReferenceEntity(prev) && isReferenceEntity(next)

  if (!_isEqual(prev, next)) {
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

