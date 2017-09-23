import {classifyDiff, DIFF_TYPES} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

function createComponentDidUpdate (opts) {
  return function componentDidUpdate (prevProps, prevState) {
    const displayName = getDisplayName(this)

    if (!shouldInclude(displayName, opts)) {
      return
    }

    const propsDiff = classifyDiff(prevProps, this.props, `${displayName}.props`)
    if (propsDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return
    }

    const stateDiff = classifyDiff(prevState, this.state, `${displayName}.state`)
    if (stateDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return
    }

    opts.notifier(displayName, [propsDiff, stateDiff])
  }
}

export const whyDidYouUpdate = (React, opts = {}) => {
  const _componentDidUpdate = React.Component.prototype.componentDidUpdate
  const _createClass = React.createClass
  opts = normalizeOptions(opts)

  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts)

  if (_createClass) {
    React.createClass = function createClass (obj) {
      const Mixin = {
        componentDidUpdate: createComponentDidUpdate(opts)
      }

      if (obj.mixins) {
        obj.mixins = [Mixin].concat(obj.mixins)
      } else {
        obj.mixins = [Mixin]
      }

      return _createClass.call(React, obj)
    }
  }

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate
    React.createClass = _createClass
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export default whyDidYouUpdate
