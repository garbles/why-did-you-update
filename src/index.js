import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _keys from 'lodash/keys'
import _union from 'lodash/union'

const noop = Object.freeze(() => {})
const isRequiredUpdateObject = o => Array.isArray(o) || _isObject(o)
const getDisplayName = o => o.displayName || o.constructor.displayName || o.constructor.name

const deepDiff = (prev, next, name) => {
  const notify = (status, bold) => {
    console.group(name)

    if (bold) {
      console.warn(`%c%s`, `font-weight: bold`, status)
    } else {
      console.warn(status)
    }

    console.log(`%cbefore`, `font-weight: bold`, prev)
    console.log(`%cafter `, `font-weight: bold`, next)
    console.groupEnd()
  }

  const isRefEntity = isRequiredUpdateObject(prev) && isRequiredUpdateObject(next)

  if (!_isEqual(prev, next)) {
    const isFunc = _isFunction(prev) && _isFunction(next)

    if (isFunc) {
      if (prev.name === next.name) {
        notify(`Value is a function. Possibly avoidable re-render?`, false)
      }
    } else if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      keys.forEach(key => deepDiff(prev[key], next[key], `${name}.${key}`))
    }
  } else if (prev !== next) {
    notify(`Value did not change. Avoidable re-render!`, true)

    if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      keys.forEach(key => deepDiff(prev[key], next[key], `${name}.${key}`))
    }
  }
}

const shouldIncludeDisplayName = (displayName, {include, exclude}) => {
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

function createComponentDidUpdateProxy (componentDidUpdate = noop, opts = {}) {
  let {include, exclude} = opts

  if (_isString(include)) {
    include = new RegExp(include)
  }

  if (_isString(exclude)) {
    exclude = new RegExp(exclude)
  }

  opts = {...opts, include, exclude}

  return function componentDidUpdateProxy (prevProps, prevState) {
    const displayName = getDisplayName(this)

    componentDidUpdate.call(this, prevProps, prevState)

    if (!shouldIncludeDisplayName(displayName, opts)) {
      return
    }

    deepDiff(prevProps, this.props, `${displayName}.props`)

    if (prevState && this.state) {
      deepDiff(prevState, this.state, `${displayName}.state`)
    }
  }
}

export const whyDidYouUpdate = (React, opts = {}) => {
  const _componentDidUpdate = React.Component.prototype.componentDidUpdate
  const _createClass = React.createClass

  React.Component.prototype.componentDidUpdate = createComponentDidUpdateProxy(_componentDidUpdate, opts)

  React.createClass = function createClass (obj) {
    obj.componentDidUpdate = createComponentDidUpdateProxy(obj.componentDidUpdate, opts)
    return _createClass.call(React, obj)
  }

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate
    React.createClass = _createClass
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export default whyDidYouUpdate
