import {DIFF_TYPES} from './deepDiff'

export const defaultNotifier = (groupName, changes) => {
  console.group(groupName)

  changes.forEach(({type, name, prev, next}) => {
    switch (type) {
      case DIFF_TYPES.SAME:
        console.warn(`${name}: Value is the same (equal by reference). Avoidable re-render!`)
        console.log(`Value:`, prev)
        break;
      case DIFF_TYPES.EQUAL:
        console.warn(`${name}: Value did not change. Avoidable re-render!`)
        console.log(`Before:`, prev)
        console.log(`After:`, next)
        break;
      case DIFF_TYPES.FUNCTIONS:
        console.warn(`${name}: Changes are in functions only. Possibly avoidable re-render?`)
        console.log(`Functions before:`, prev)
        console.log(`Functions after:`, next)
        break;
    }
  })

  console.groupEnd();
}
