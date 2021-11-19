'use strict';
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var jestDOMElementSerializer = require('pretty-format').plugins.DOMElement;
var attributesToRemovePatterns = ['ng-reflect', '_nghost', '_ngcontent', 'ng-version'];
var hasAttributesToRemove = function (attribute) {
    return attributesToRemovePatterns
        .some(function (removePattern) { return attribute.name.startsWith(removePattern); });
};
var serialize = function (node) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    var nodeCopy = node.cloneNode(true);
    Object.values(nodeCopy.attributes)
        .filter(hasAttributesToRemove)
        .forEach(function (attribute) { return nodeCopy.attributes.removeNamedItem(attribute.name); });
    return jestDOMElementSerializer.serialize.apply(jestDOMElementSerializer, __spreadArrays([nodeCopy], rest));
};
var serializeTestFn = function (val) {
    return val.attributes !== undefined && Object.values(val.attributes)
        .some(hasAttributesToRemove);
};
var test = function (val) {
    return jestDOMElementSerializer.test(val) && serializeTestFn(val);
};
module.exports = {
    serialize: serialize,
    test: test
};
