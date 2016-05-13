import _isString from 'lodash/isString'
import _isArray from 'lodash/isArray'
import _isRegExp from 'lodash/isRegExp'

export const normalizeOptions = (opts = {}) => {
  let {include, exclude} = opts

  if (_isString(include)) {
    include = new RegExp(include)
  } else if (!_isRegExp(include)) {
    include = /./
  }

  if (_isArray(exclude)) {
    for (let i = 0; i < exclude.length; i++) {
      if (_isString(exclude[i])) {
        exclude[i] = new RegExp(exclude[i]);
      } else if (!_isRegExp(exclude[i])){
        exclude[i] = /[^a-zA-Z0-9]/;
      }
    }
  } else if (_isString(exclude)) {
    exclude = new RegExp(exclude)
  } else if (!_isRegExp(exclude)) {
    exclude = /[^a-zA-Z0-9]/
  }

  return {...opts, include, exclude}
}
