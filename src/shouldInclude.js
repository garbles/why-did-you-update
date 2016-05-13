import _isFunction from 'lodash/isFunction'

export const shouldInclude = (displayName, {include, exclude}) => {
  let isIncluded = include.test(displayName)
  let isExcluded = exclude.test(displayName)

  return isIncluded && !isExcluded
}
