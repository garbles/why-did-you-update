'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashIsString = require('lodash/isString');

var _lodashIsString2 = _interopRequireDefault(_lodashIsString);

var _defaultNotifier = require('./defaultNotifier');

var DEFAULT_INCLUDE = /./;
exports.DEFAULT_INCLUDE = DEFAULT_INCLUDE;
var DEFAULT_EXCLUDE = /[^a-zA-Z0-9]/;

exports.DEFAULT_EXCLUDE = DEFAULT_EXCLUDE;
var toRegExp = function toRegExp(s) {
  return (0, _lodashIsString2['default'])(s) ? new RegExp('^' + s + '$') : s;
};
var toArray = function toArray(o) {
  return o ? [].concat(o) : [];
};

var normalizeOptions = function normalizeOptions() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _opts$include = opts.include;
  var include = _opts$include === undefined ? [DEFAULT_INCLUDE] : _opts$include;
  var _opts$exclude = opts.exclude;
  var exclude = _opts$exclude === undefined ? [DEFAULT_EXCLUDE] : _opts$exclude;
  var _opts$notifier = opts.notifier;
  var notifier = _opts$notifier === undefined ? _defaultNotifier.defaultNotifier : _opts$notifier;

  return {
    notifier: notifier,
    include: toArray(include).map(toRegExp),
    exclude: toArray(exclude).map(toRegExp)
  };
};
exports.normalizeOptions = normalizeOptions;