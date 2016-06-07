export const defaultNotifier = ({name, prev, next, status, bold}) => {
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
