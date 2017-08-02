import _isString from 'lodash/isString'

import {defaultNotifier} from './defaultNotifier'

export const DEFAULT_INCLUDE = /./
export const DEFAULT_EXCLUDE = /[^a-zA-Z0-9]/

const toRegExp = s => _isString(s) ? new RegExp(`^${s}$`) : s
const toArray = o =>  o ? [].concat(o) : []

export const normalizeOptions = (opts = {}) => {
  let {
    include = [DEFAULT_INCLUDE],
    exclude = [DEFAULT_EXCLUDE],
    groupByComponent = true,
    collapseComponentGroups = true,
    notifier = defaultNotifier,
  } = opts


  return {
    notifier,
    include: toArray(include).map(toRegExp),
    exclude: toArray(exclude).map(toRegExp),
    groupByComponent,
    collapseComponentGroups,
  }
}
