import {DeepDiff} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

function createComponentDidUpdate (opts) {
  return function componentDidUpdate (prevProps, prevState) {
    const displayName = getDisplayName(this)

    if (!shouldInclude(displayName, opts)) {
      return
    }

    new DeepDiff(prevProps, this.props, `${displayName}.props`, opts).run()

    if (prevState && this.state) {
      new DeepDiff(prevState, this.state, `${displayName}.state`, opts).run()
    }
  }
}

export const whyDidYouUpdate = (React, opts = {useImmutable: false}) => {
  const _componentDidUpdate = React.Component.prototype.componentDidUpdate
  const _createClass = React.createClass
  opts = normalizeOptions(opts)

  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts)

  if (_createClass) {
    React.createClass = function createClass (obj) {
      if (!obj.mixins) {
        obj.mixins = []
      }

      const Mixin = {
        componentDidUpdate: createComponentDidUpdate(opts)
      }

      obj.mixins = [Mixin].concat(obj.mixins)

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
