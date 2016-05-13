import _isString from 'lodash/isString'
import _isRegExp from 'lodash/isRegExp'

export const normalizeOptions = (opts = {}) => {
  let {include, exclude} = opts

  if (_isString(include)) {
    include = new RegExp(include)
  } else if (!_isRegExp(include)) {
    include = /./
  }

  if (_isString(exclude)) {
    exclude = new RegExp(exclude)
  } else if (!_isRegExp(exclude)) {
    exclude = /[^a-zA-Z0-9]/
  }

  return {...opts, include, exclude}
}
