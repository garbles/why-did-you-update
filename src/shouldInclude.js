import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'

export const shouldInclude = (displayName, {include, exclude}) => {

  let isIncluded;
  let isExcluded;

  if (_isArray(exclude)) {
    isExcluded = false;
    let i = 0;
    for (; i < exclude.length; i++) {
      if (exclude[i] === displayName) {
        isExcluded = true;
        break;
      }
    }
  } else {
    isExcluded = exclude.test(displayName)
  }

  isIncluded = include.test(displayName)

  return isIncluded && !isExcluded
}
