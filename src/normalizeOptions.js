import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import _isRegExp from 'lodash/isRegExp'

export const normalizeOptions = (opts = {}) => {
  let {include, exclude} = opts

  if (!_isArray(include)) {
    include = [include]
  }

  if (!_isArray(exclude)) {
    exclude = [exclude]
  }

  include = include.map(i => {
    if (_isString(i)) {
      return new RegExp(`^${i}$`)
    } else if (!_isRegExp(i)) {
      return /./
    }

    return i
  })

  exclude = exclude.map(e => {
    if (_isString(e)) {
      return new RegExp(`^${e}$`)
    } else if (!_isRegExp(e)) {
      return /[^a-zA-Z0-9]/
    }

    return e
  })


  return {...opts, include, exclude}
}
