'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _deepDiff = require('./deepDiff');

var _getDisplayName = require('./getDisplayName');

var _normalizeOptions = require('./normalizeOptions');

var _shouldInclude = require('./shouldInclude');

function diffProps(prev, next, displayName) {
  return (0, _deepDiff.deepDiff)(prev, next, displayName + '.props', []);
}

function diffState(prev, next, displayName) {
  if (prev && next) {
    return (0, _deepDiff.deepDiff)(prev, next, displayName + '.state', []);
  }

  return [];
}

function createComponentDidUpdate(opts) {
  return function componentDidUpdate(prevProps, prevState) {
    var displayName = (0, _getDisplayName.getDisplayName)(this);

    if (!(0, _shouldInclude.shouldInclude)(displayName, opts)) {
      return;
    }

    var diffs = diffProps(prevProps, this.props, displayName).concat(diffState(prevState, this.state, displayName));

    diffs.forEach(opts.notifier);
  };
}

var whyDidYouUpdate = function whyDidYouUpdate(React) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _componentDidUpdate = React.Component.prototype.componentDidUpdate;
  var _createClass = React.createClass;
  opts = (0, _normalizeOptions.normalizeOptions)(opts);

  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts);

  if (_createClass) {
    React.createClass = function createClass(obj) {
      if (!obj.mixins) {
        obj.mixins = [];
      }

      var Mixin = {
        componentDidUpdate: createComponentDidUpdate(opts)
      };

      obj.mixins = [Mixin].concat(obj.mixins);

      return _createClass.call(React, obj);
    };
  }

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = function () {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate;
    React.createClass = _createClass;
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__;
  };

  return React;
};

exports.whyDidYouUpdate = whyDidYouUpdate;
exports['default'] = whyDidYouUpdate;