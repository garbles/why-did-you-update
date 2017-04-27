import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _keys from 'lodash/keys'
import _union from 'lodash/union'
import _filter from 'lodash/filter'
import _every from 'lodash/every'
import _pick from 'lodash/pick'

export const DIFF_TYPES = {
  UNAVOIDABLE: 'unavoidable',
  SAME: 'same',
  EQUAL: 'equal',
  FUNCTIONS: 'functions'
}

export const classifyDiff = (prev, next, name) => {
  if (prev === next) {
    return {
      type: DIFF_TYPES.SAME,
      name,
      prev,
      next
    }
  }

  if (_isEqual(prev, next)) {
    return {
      type: DIFF_TYPES.EQUAL,
      name,
      prev,
      next
    }
  }

  if (!prev || !next) {
    return {
      type: DIFF_TYPES.UNAVOIDABLE,
      name,
      prev,
      next
    }
  }

  const isChanged = key => (prev[key] !== next[key]) && (!_isEqual(prev[key], next[key]));
  const isSameFunction = key => {
    const prevFn = prev[key];
    const nextFn = next[key];
    return _isFunction(prevFn) && _isFunction(nextFn) && prevFn.name === nextFn.name;
  };

  const keys = _union(_keys(prev), _keys(next));
  const changedKeys = _filter(keys, isChanged);

  if (changedKeys.length && _every(changedKeys, isSameFunction)) {
    return {
      type: DIFF_TYPES.FUNCTIONS,
      name,
      prev: _pick(prev, changedKeys),
      next: _pick(next, changedKeys)
    }
  }

  return {
    type: DIFF_TYPES.UNAVOIDABLE,
    name,
    prev,
    next
  }
}
