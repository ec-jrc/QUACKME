"use strict";
var METADATA_KEY_PARAMTYPES = "design:paramtypes";
var CTOR_PARAMETERS_JPA = "ctorParametersJPA";
// weird workaround to avoid 'ReferenceError: globalThis is not defined' in node version < 11
global.globalThis = global.globalThis || undefined;
var _global = globalThis || global; // globalThis available since node v12/TS v3.4
var reflect = _global["Reflect"]; // reflect type in global has not these methods
// let's not blindly override, maybe there is already a reflect lib in use
// but just overriding one of the two functions does not serve any purpose
if (!reflect.metadata && !reflect.getOwnMetadata) {
    reflect.metadata = function (metadataKey, metadataValue) { return function (target, key) {
        if (metadataKey === METADATA_KEY_PARAMTYPES && key === undefined) { // key undefined is ctor
            target[CTOR_PARAMETERS_JPA] = metadataValue;
        }
    }; };
    reflect.getOwnMetadata = function (metadata, target, key) {
        if (metadata === METADATA_KEY_PARAMTYPES && key === undefined) { // key undefined is ctor
            return target[CTOR_PARAMETERS_JPA];
        }
    };
}
