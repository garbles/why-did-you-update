"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var FUNC_WARNING = "Value is a function. Possibly avoidable re-render?";
var IMMUTABLE_WARNING = "Immutables are deeply equal. Possibly avoidable re-render?";
var AVOIDABLE_WARNING = "Value did not change. Avoidable re-render!";

var defaultNotifier = function defaultNotifier(_ref) {
  var name = _ref.name;
  var prev = _ref.prev;
  var next = _ref.next;
  var type = _ref.type;

  console.group(name);

  if (type === "avoidable") {
    console.warn("%c%s", "font-weight: bold", AVOIDABLE_WARNING);
  } else if (type === "immutable") {
    console.warn("%c%s", "font-weight: bold", IMMUTABLE_WARNING);
  } else if (type === "function") {
    console.warn(FUNC_WARNING);
  }

  console.log("%cbefore", "font-weight: bold", prev);
  console.log("%cafter ", "font-weight: bold", next);
  console.groupEnd();
};
exports.defaultNotifier = defaultNotifier;