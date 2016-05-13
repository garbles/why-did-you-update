import _isFunction from 'lodash/isFunction'

export const shouldInclude = (displayName, {include, exclude}) => {
  let isIncluded
  let isExcluded

  if (include && _isFunction(include.test)) {
    isIncluded = include.test(displayName)
  } else {
    isIncluded = true
  }

  if (exclude && _isFunction(exclude.test)) {
    isExcluded = exclude.test(displayName)
  } else {
    isExcluded = false
  }

  return isIncluded && !isExcluded
}
