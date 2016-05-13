import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _union from 'lodash/union'

const isReferenceEntity = o => Array.isArray(o) || _isObject(o)

export const deepDiff = (prev, next, name) => {
  const notify = (status, bold) => {
    console.group(name)

    if (bold) {
      console.warn(`%c%s`, `font-weight: bold`, status)
    } else {
      console.warn(status)
    }

    console.log(`%cbefore`, `font-weight: bold`, prev)
    console.log(`%cafter `, `font-weight: bold`, next)
    console.groupEnd()
  }

  const isRefEntity = isReferenceEntity(prev) && isReferenceEntity(next)

  if (!_isEqual(prev, next)) {
    const isFunc = _isFunction(prev) && _isFunction(next)

    if (isFunc) {
      if (prev.name === next.name) {
        notify(`Value is a function. Possibly avoidable re-render?`, false)
      }
    } else if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      keys.forEach(key => deepDiff(prev[key], next[key], `${name}.${key}`))
    }
  } else if (prev !== next) {
    notify(`Value did not change. Avoidable re-render!`, true)

    if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      keys.forEach(key => deepDiff(prev[key], next[key], `${name}.${key}`))
    }
  }
}

