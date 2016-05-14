import _some from 'lodash/some'
import _isFunction from 'lodash/isFunction'

export const shouldInclude = (displayName, {include, exclude}) => {
  let isIncluded = _some(include, r => r.test(displayName))
  let isExcluded = _some(exclude, r => r.test(displayName))

  return isIncluded && !isExcluded
}
