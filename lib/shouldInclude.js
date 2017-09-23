'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashSome = require('lodash/some');

var _lodashSome2 = _interopRequireDefault(_lodashSome);

var _lodashIsFunction = require('lodash/isFunction');

var _lodashIsFunction2 = _interopRequireDefault(_lodashIsFunction);

var shouldInclude = function shouldInclude(displayName, _ref) {
  var include = _ref.include;
  var exclude = _ref.exclude;

  var isIncluded = (0, _lodashSome2['default'])(include, function (r) {
    return r.test(displayName);
  });
  var isExcluded = (0, _lodashSome2['default'])(exclude, function (r) {
    return r.test(displayName);
  });

  return isIncluded && !isExcluded;
};
exports.shouldInclude = shouldInclude;