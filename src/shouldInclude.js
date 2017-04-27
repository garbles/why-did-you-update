import _some from 'lodash/some'

export const shouldInclude = (displayName, {include, exclude}) => {
  return _some(include, r => r.test(displayName)) &&
    !_some(exclude, r => r.test(displayName))
}
