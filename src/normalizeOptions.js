import _isString from 'lodash/isString'

export const normalizeOptions = (opts = {}) => {
  let {include, exclude} = opts

  if (_isString(include)) {
    include = new RegExp(include)
  }

  if (_isString(exclude)) {
    exclude = new RegExp(exclude)
  }

  return {...opts, include, exclude}
}
