'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodashIsEqual = require('lodash/isEqual');

var _lodashIsEqual2 = _interopRequireDefault(_lodashIsEqual);

var _lodashIsFunction = require('lodash/isFunction');

var _lodashIsFunction2 = _interopRequireDefault(_lodashIsFunction);

var _lodashIsObject = require('lodash/isObject');

var _lodashIsObject2 = _interopRequireDefault(_lodashIsObject);

var _lodashKeys = require('lodash/keys');

var _lodashKeys2 = _interopRequireDefault(_lodashKeys);

var _lodashUnion = require('lodash/union');

var _lodashUnion2 = _interopRequireDefault(_lodashUnion);

var _lodashDeep2 = require('lodash-deep');

var _lodashDeep3 = _interopRequireDefault(_lodashDeep2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

_lodash2['default'].mixin(_lodashDeep3['default']);

var isReferenceEntity = function isReferenceEntity(o) {
  return Array.isArray(o) || (0, _lodashIsObject2['default'])(o);
};

var isImmutable = function isImmutable(obj) {
  return _immutable2['default'].Iterable.isIterable(obj);
};

var bothAreImmutableAndStrictlyEqual = function bothAreImmutableAndStrictlyEqual(a, b) {
  return isImmutable(a) && isImmutable(b) && a === b;
};

var bothAreImmutableAndDeeplyEqual = function bothAreImmutableAndDeeplyEqual(a, b) {
  return isImmutable(a) && isImmutable(b) && (0, _lodashIsEqual2['default'])(a.toJS(), b.toJS());
};

var atLeastOneIsImmutableAndNotStrictlyEqual = function atLeastOneIsImmutableAndNotStrictlyEqual(a, b) {
  return (isImmutable(a) || isImmutable(b)) && a !== b;
};

var getValueAtPath = function getValueAtPath(obj, path) {
  try {
    return path.split('.').reduce(function (acc, key) {
      return acc[key];
    }, obj);
  } catch (e) {}
};

var containSomeNonStrictlyEqualImmutablesInside = function containSomeNonStrictlyEqualImmutablesInside(a, b) {
  var retval = undefined;
  _lodash2['default'].deepMapValues(a, function (value, path) {
    if (atLeastOneIsImmutableAndNotStrictlyEqual(value, getValueAtPath(b, path))) {
      retval = true;
    }
  });
  return retval;
};

var containSomeStrictlyEqualImmutablesInside = function containSomeStrictlyEqualImmutablesInside(a, b) {
  var retval = undefined;
  _lodash2['default'].deepMapValues(a, function (value, path) {
    if (bothAreImmutableAndStrictlyEqual(value, getValueAtPath(b, path))) {
      retval = true;
    }
  });
  return retval;
};

var containsOnlyStrictlyEqualImmutablesInside = function containsOnlyStrictlyEqualImmutablesInside(a, b) {
  return !containSomeNonStrictlyEqualImmutablesInside(a, b) && containSomeStrictlyEqualImmutablesInside(a, b);
};

var forEachImmutableInside = function forEachImmutableInside(obj, cb) {
  _lodash2['default'].deepMapValues(obj, function (value, path) {
    if (isImmutable(value)) {
      cb(value, path);
    }
  });
};

var forEachNonImmutableInside = function forEachNonImmutableInside(obj, cb) {
  _lodash2['default'].deepMapValues(obj, function (value, path) {
    if (!isImmutable(value)) {
      cb(value, path);
    }
  });
};

var forEachDeeplyEqualImmutableInside = function forEachDeeplyEqualImmutableInside(a, b, cb) {
  _lodash2['default'].deepMapValues(a, function (value, path) {
    if (bothAreImmutableAndDeeplyEqual(value, getValueAtPath(b, path))) {
      cb(value, path);
    }
  });
};

var containsSomeImmutablesInside = function containsSomeImmutablesInside(obj) {
  var retval = undefined;
  forEachImmutableInside(obj, function () {
    return retval = true;
  });
  return retval;
};

var containsSomeNonImmutablesInside = function containsSomeNonImmutablesInside(obj) {
  var retval = undefined;
  forEachNonImmutableInside(obj, function () {
    return retval = true;
  });
  return retval;
};

var replaceImmutablesInside = function replaceImmutablesInside(obj, replacer) {
  return _lodash2['default'].deepMapValues(obj, function (value) {
    return isImmutable(value) ? replacer(value) : value;
  });
};

var nonImmutablesInsideAreDeeplyEqual = function nonImmutablesInsideAreDeeplyEqual(a, b) {
  return (0, _lodashIsEqual2['default'])(replaceImmutablesInside(a, function () {
    return 0;
  }), replaceImmutablesInside(b, function () {
    return 0;
  }));
};

var immutablesInsideAreDeeplyEqual = function immutablesInsideAreDeeplyEqual(a, b) {
  return (0, _lodashIsEqual2['default'])(replaceImmutablesInside(a, function (value) {
    return value.toJS();
  }), replaceImmutablesInside(b, function (value) {
    return value.toJS();
  }));
};

var deepToJS = function deepToJS(obj) {
  return replaceImmutablesInside(obj, function (value) {
    return value.toJS();
  });
};

var deepDiff = function deepDiff(prev, next, name, notes) {
  if (containSomeNonStrictlyEqualImmutablesInside(prev, next)) {
    if (immutablesInsideAreDeeplyEqual(prev, next)) {
      forEachDeeplyEqualImmutableInside(prev, next, function (value, path) {
        var type = 'immutable';
        var jsval = value.toJS();
        notes = notes.concat({ name: name + '.' + path, prev: jsval, next: jsval, type: type });
      });
    }
    return notes;
  }

  if (containsOnlyStrictlyEqualImmutablesInside(prev, next)) {
    if (containsSomeNonImmutablesInside(prev, next)) {
      if (!nonImmutablesInsideAreDeeplyEqual(prev, next)) {
        return notes;
      }
    }
  }

  if (containsSomeImmutablesInside(prev)) {
    prev = deepToJS(prev);
  }

  if (containsSomeImmutablesInside(next)) {
    next = deepToJS(next);
  }

  var isRefEntity = isReferenceEntity(prev) && isReferenceEntity(next);
  var isDeepEqual = (0, _lodashIsEqual2['default'])(prev, next);

  if (!isDeepEqual) {
    var isFunc = (0, _lodashIsFunction2['default'])(prev) && (0, _lodashIsFunction2['default'])(next);
    if (isFunc) {
      if (prev.name === next.name) {
        var type = 'function';
        return notes.concat({ name: name, prev: prev, next: next, type: type });
      }
    } else if (isRefEntity) {
      var keys = (0, _lodashUnion2['default'])((0, _lodashKeys2['default'])(prev), (0, _lodashKeys2['default'])(next));
      return keys.reduce(function (acc, key) {
        return deepDiff(prev[key], next[key], name + '.' + key, acc);
      }, notes);
    }
  } else if (prev !== next) {
    var type = 'avoidable';
    if (isRefEntity) {
      var keys = (0, _lodashUnion2['default'])((0, _lodashKeys2['default'])(prev), (0, _lodashKeys2['default'])(next));
      return keys.reduce(function (acc, key) {
        return deepDiff(prev[key], next[key], name + '.' + key, acc);
      }, notes.concat({ name: name, prev: prev, next: next, type: type }));
    } else {
      return notes.concat({ name: name, prev: prev, next: next, type: type });
    }
  }

  return notes;
};
exports.deepDiff = deepDiff;