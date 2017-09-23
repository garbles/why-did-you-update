import {deepDiff} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

function diffProps (prev, next, displayName) {
  return deepDiff(prev, next, `${displayName}.props`, [])
}

function diffState (prev, next , displayName) {
  if (prev && next) {
    return deepDiff(prev, next, `${displayName}.state`, [])
  }

  return []
}

function createComponentDidUpdate (opts) {
  return function componentDidUpdate (prevProps, prevState) {
    const displayName = getDisplayName(this)

    if (!shouldInclude(displayName, opts)) {
      return
    }

    const diffs =
      diffProps(prevProps, this.props, displayName)
        .concat(diffState(prevState, this.state, displayName))

    diffs.forEach(opts.notifier)
  }
}

export const whyDidYouUpdate = (React, opts = {}) => {
  const _componentDidUpdate = React.Component.prototype.componentDidUpdate
  opts = normalizeOptions(opts)

  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts)

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export default whyDidYouUpdate
