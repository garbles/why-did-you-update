import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'

export const shouldInclude = (displayName, {include, exclude}) => {

  let isIncluded;
  let isExcluded;

  if (_isArray(exclude)) {
    isExcluded = false;
    for (let i = 0; i < exclude.length; i++) {
      const item = exclude[i];
      if (item.test(displayName)) {
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
