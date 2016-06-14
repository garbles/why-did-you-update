const FUNC_WARNING = `Value is a function. Possibly avoidable re-render?`
const AVOIDABLE_WARNING = `Value did not change. Avoidable re-render!`

export const defaultNotifier = (groupByComponent, collapseComponentGroups, displayName, diffs) => {
  if (groupByComponent && collapseComponentGroups) {
    console.groupCollapsed(displayName)
  } else if (groupByComponent) {
    console.group(displayName)
  }

  diffs.forEach(notifyDiff)

  if (groupByComponent) {
    console.groupEnd()
  }
}

const notifyDiff = ({name, prev, next, type}) => {
  console.group(name)

  if (type === `avoidable`) {
    console.warn(`%c%s`, `font-weight: bold`, AVOIDABLE_WARNING)
  } else {
    console.warn(FUNC_WARNING)
  }

  console.log(`%cbefore`, `font-weight: bold`, prev)
  console.log(`%cafter `, `font-weight: bold`, next)
  console.groupEnd()
}
