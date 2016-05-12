import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _union from 'lodash/union'

const noop = Object.freeze(() => {})
const isRequiredUpdateObject = o => Array.isArray(o) || _isObject(o)
const getDisplayName = o => o.displayName || o.constructor.displayName || o.constructor.name

const deepDiff = (prev, next, name) => {
  const notify = (type, status) => {
    console.group(name)
    console[type](`%c%s`, `font-weight: bold`, status)
    console.log(`%cbefore`, `font-weight: bold`, prev)
    console.log(`%cafter `, `font-weight: bold`, next)
    console.groupEnd()
  }

  const isRefEntity = isRequiredUpdateObject(prev) && isRequiredUpdateObject(next)

  if (!_isEqual(prev, next)) {
    const isFunc = _isFunction(prev) && _isFunction(next)

    if (isFunc) {
      if (prev.name === next.name) {
        notify(`warn`, `Value is a function. Possibly avoidable re-render?`)
      }
    } else if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      keys.forEach(key => deepDiff(prev[key], next[key], `${name}.${key}`))
    }
  } else if (prev !== next) {
    notify(`error`, `Value did not change. Avoidable re-render!`)

    if (isRefEntity) {
      const keys = _union(_keys(prev), _keys(next))
      keys.forEach(key => deepDiff(prev[key], next[key], `${name}.${key}`))
    }
  }
}

function createComponentDidUpdateProxy (componentDidUpdate = noop, opts = {}) {
  return function componentDidUpdateProxy (prevProps, prevState) {
    const displayName = getDisplayName(this)

    componentDidUpdate.call(this, prevProps, prevState)

    if (opts.ignore && _isFunction(opts.ignore.test) && opts.ignore.test(displayName)) {
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
