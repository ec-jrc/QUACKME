/**
 * @license NgRx 9.1.0
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
import { __assign, __spread, __extends, __decorate, __param, __metadata, __values } from 'tslib';
import { compose, ScannedActionsSubject, Store, createAction, StoreRootModule, StoreFeatureModule } from '@ngrx/store';
import { merge, Observable, Subject, defer, Notification } from 'rxjs';
import { ignoreElements, materialize, map, catchError, filter, groupBy, mergeMap, exhaustMap, dematerialize, take, concatMap, finalize } from 'rxjs/operators';
import { Injectable, Inject, InjectionToken, ErrorHandler, NgModule, Optional, Injector, SkipSelf } from '@angular/core';

var DEFAULT_EFFECT_CONFIG = {
    dispatch: true,
    useEffectsErrorHandler: true,
};
var CREATE_EFFECT_METADATA_KEY = '__@ngrx/effects_create__';

/**
 * @description
 * Creates an effect from an `Observable` and an `EffectConfig`.
 *
 * @param source A function which returns an `Observable`.
 * @param config A `Partial<EffectConfig>` to configure the effect.  By default, `dispatch` is true and `useEffectsErrorHandler` is true.
 * @returns If `EffectConfig`#`dispatch` is true, returns `Observable<Action>`.  Else, returns `Observable<unknown>`.
 *
 * @usageNotes
 *
 * ** Mapping to a different action **
 * ```ts
 * effectName$ = createEffect(
 *   () => this.actions$.pipe(
 *     ofType(FeatureActions.actionOne),
 *     map(() => FeatureActions.actionTwo())
 *   )
 * );
 * ```
 *
 *  ** Non-dispatching effects **
 * ```ts
 * effectName$ = createEffect(
 *   () => this.actions$.pipe(
 *     ofType(FeatureActions.actionOne),
 *     tap(() => console.log('Action One Dispatched'))
 *   ),
 *   { dispatch: false }
 *   // FeatureActions.actionOne is not dispatched
 * );
 * ```
 */
function createEffect(source, config) {
    var effect = source();
    var value = __assign(__assign({}, DEFAULT_EFFECT_CONFIG), config);
    Object.defineProperty(effect, CREATE_EFFECT_METADATA_KEY, {
        value: value,
    });
    return effect;
}
function getCreateEffectMetadata(instance) {
    var propertyNames = Object.getOwnPropertyNames(instance);
    var metadata = propertyNames
        .filter(function (propertyName) {
        return instance[propertyName] &&
            instance[propertyName].hasOwnProperty(CREATE_EFFECT_METADATA_KEY);
    })
        .map(function (propertyName) {
        var metaData = instance[propertyName][CREATE_EFFECT_METADATA_KEY];
        return __assign({ propertyName: propertyName }, metaData);
    });
    return metadata;
}

function getSourceForInstance(instance) {
    return Object.getPrototypeOf(instance);
}

var METADATA_KEY = '__@ngrx/effects__';
function Effect(config) {
    if (config === void 0) { config = {}; }
    return function (target, propertyName) {
        var metadata = __assign(__assign(__assign({}, DEFAULT_EFFECT_CONFIG), config), { // Overrides any defaults if values are provided
            propertyName: propertyName });
        addEffectMetadataEntry(target, metadata);
    };
}
function getEffectDecoratorMetadata(instance) {
    var effectsDecorators = compose(getEffectMetadataEntries, getSourceForInstance)(instance);
    return effectsDecorators;
}
/**
 * Type guard to detemine whether METADATA_KEY is already present on the Class
 * constructor
 */
function hasMetadataEntries(sourceProto) {
    return sourceProto.constructor.hasOwnProperty(METADATA_KEY);
}
/** Add Effect Metadata to the Effect Class constructor under specific key */
function addEffectMetadataEntry(sourceProto, metadata) {
    if (hasMetadataEntries(sourceProto)) {
        sourceProto.constructor[METADATA_KEY].push(metadata);
    }
    else {
        Object.defineProperty(sourceProto.constructor, METADATA_KEY, {
            value: [metadata],
        });
    }
}
function getEffectMetadataEntries(sourceProto) {
    return hasMetadataEntries(sourceProto)
        ? sourceProto.constructor[METADATA_KEY]
        : [];
}

function getEffectsMetadata(instance) {
    return getSourceMetadata(instance).reduce(function (acc, _a) {
        var propertyName = _a.propertyName, dispatch = _a.dispatch, useEffectsErrorHandler = _a.useEffectsErrorHandler;
        acc[propertyName] = { dispatch: dispatch, useEffectsErrorHandler: useEffectsErrorHandler };
        return acc;
    }, {});
}
function getSourceMetadata(instance) {
    var effects = [
        getEffectDecoratorMetadata,
        getCreateEffectMetadata,
    ];
    return effects.reduce(function (sources, source) { return sources.concat(source(instance)); }, []);
}

function mergeEffects(sourceInstance, globalErrorHandler, effectsErrorHandler) {
    var sourceName = getSourceForInstance(sourceInstance).constructor.name;
    var observables$ = getSourceMetadata(sourceInstance).map(function (_a) {
        var propertyName = _a.propertyName, dispatch = _a.dispatch, useEffectsErrorHandler = _a.useEffectsErrorHandler;
        var observable$ = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        var effectAction$ = useEffectsErrorHandler
            ? effectsErrorHandler(observable$, globalErrorHandler)
            : observable$;
        if (dispatch === false) {
            return effectAction$.pipe(ignoreElements());
        }
        var materialized$ = effectAction$.pipe(materialize());
        return materialized$.pipe(map(function (notification) { return ({
            effect: sourceInstance[propertyName],
            notification: notification,
            propertyName: propertyName,
            sourceName: sourceName,
            sourceInstance: sourceInstance,
        }); }));
    });
    return merge.apply(void 0, __spread(observables$));
}

var MAX_NUMBER_OF_RETRY_ATTEMPTS = 10;
function defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft) {
    if (retryAttemptLeft === void 0) { retryAttemptLeft = MAX_NUMBER_OF_RETRY_ATTEMPTS; }
    return observable$.pipe(catchError(function (error) {
        if (errorHandler)
            errorHandler.handleError(error);
        if (retryAttemptLeft <= 1) {
            return observable$; // last attempt
        }
        // Return observable that produces this particular effect
        return defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft - 1);
    }));
}

var Actions = /** @class */ (function (_super) {
    __extends(Actions, _super);
    function Actions(source) {
        var _this = _super.call(this) || this;
        if (source) {
            _this.source = source;
        }
        return _this;
    }
    Actions_1 = Actions;
    Actions.prototype.lift = function (operator) {
        var observable = new Actions_1();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    var Actions_1;
    Actions = Actions_1 = __decorate([
        Injectable(),
        __param(0, Inject(ScannedActionsSubject)),
        __metadata("design:paramtypes", [Observable])
    ], Actions);
    return Actions;
}(Observable));
function ofType() {
    var allowedTypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allowedTypes[_i] = arguments[_i];
    }
    return filter(function (action) {
        return allowedTypes.some(function (typeOrActionCreator) {
            if (typeof typeOrActionCreator === 'string') {
                // Comparing the string to type
                return typeOrActionCreator === action.type;
            }
            // We are filtering by ActionCreator
            return typeOrActionCreator.type === action.type;
        });
    });
}

function reportInvalidActions(output, reporter) {
    if (output.notification.kind === 'N') {
        var action = output.notification.value;
        var isInvalidAction = !isAction(action);
        if (isInvalidAction) {
            reporter.handleError(new Error("Effect " + getEffectName(output) + " dispatched an invalid action: " + stringify(action)));
        }
    }
}
function isAction(action) {
    return (typeof action !== 'function' &&
        action &&
        action.type &&
        typeof action.type === 'string');
}
function getEffectName(_a) {
    var propertyName = _a.propertyName, sourceInstance = _a.sourceInstance, sourceName = _a.sourceName;
    var isMethod = typeof sourceInstance[propertyName] === 'function';
    return "\"" + sourceName + "." + String(propertyName) + (isMethod ? '()' : '') + "\"";
}
function stringify(action) {
    try {
        return JSON.stringify(action);
    }
    catch (_a) {
        return action;
    }
}

var onIdentifyEffectsKey = 'ngrxOnIdentifyEffects';
function isOnIdentifyEffects(instance) {
    return isFunction(instance, onIdentifyEffectsKey);
}
var onRunEffectsKey = 'ngrxOnRunEffects';
function isOnRunEffects(instance) {
    return isFunction(instance, onRunEffectsKey);
}
var onInitEffects = 'ngrxOnInitEffects';
function isOnInitEffects(instance) {
    return isFunction(instance, onInitEffects);
}
function isFunction(instance, functionName) {
    return (instance &&
        functionName in instance &&
        typeof instance[functionName] === 'function');
}

var _ROOT_EFFECTS_GUARD = new InjectionToken('@ngrx/effects Internal Root Guard');
var IMMEDIATE_EFFECTS = new InjectionToken('ngrx/effects: Immediate Effects');
var USER_PROVIDED_EFFECTS = new InjectionToken('ngrx/effects: User Provided Effects');
var _ROOT_EFFECTS = new InjectionToken('ngrx/effects: Internal Root Effects');
var ROOT_EFFECTS = new InjectionToken('ngrx/effects: Root Effects');
var _FEATURE_EFFECTS = new InjectionToken('ngrx/effects: Internal Feature Effects');
var FEATURE_EFFECTS = new InjectionToken('ngrx/effects: Feature Effects');
var EFFECTS_ERROR_HANDLER = new InjectionToken('ngrx/effects: Effects Error Handler');

var EffectSources = /** @class */ (function (_super) {
    __extends(EffectSources, _super);
    function EffectSources(errorHandler, effectsErrorHandler) {
        var _this = _super.call(this) || this;
        _this.errorHandler = errorHandler;
        _this.effectsErrorHandler = effectsErrorHandler;
        return _this;
    }
    EffectSources.prototype.addEffects = function (effectSourceInstance) {
        this.next(effectSourceInstance);
    };
    /**
     * @internal
     */
    EffectSources.prototype.toActions = function () {
        var _this = this;
        return this.pipe(groupBy(getSourceForInstance), mergeMap(function (source$) {
            return source$.pipe(groupBy(effectsInstance));
        }), mergeMap(function (source$) {
            var effect$ = source$.pipe(exhaustMap(function (sourceInstance) {
                return resolveEffectSource(_this.errorHandler, _this.effectsErrorHandler)(sourceInstance);
            }), map(function (output) {
                reportInvalidActions(output, _this.errorHandler);
                return output.notification;
            }), filter(function (notification) {
                return notification.kind === 'N';
            }), dematerialize());
            // start the stream with an INIT action
            // do this only for the first Effect instance
            var init$ = source$.pipe(take(1), filter(isOnInitEffects), map(function (instance) { return instance.ngrxOnInitEffects(); }));
            return merge(effect$, init$);
        }));
    };
    EffectSources = __decorate([
        Injectable(),
        __param(1, Inject(EFFECTS_ERROR_HANDLER)),
        __metadata("design:paramtypes", [ErrorHandler, Function])
    ], EffectSources);
    return EffectSources;
}(Subject));
function effectsInstance(sourceInstance) {
    if (isOnIdentifyEffects(sourceInstance)) {
        return sourceInstance.ngrxOnIdentifyEffects();
    }
    return '';
}
function resolveEffectSource(errorHandler, effectsErrorHandler) {
    return function (sourceInstance) {
        var mergedEffects$ = mergeEffects(sourceInstance, errorHandler, effectsErrorHandler);
        if (isOnRunEffects(sourceInstance)) {
            return sourceInstance.ngrxOnRunEffects(mergedEffects$);
        }
        return mergedEffects$;
    };
}

var EffectsRunner = /** @class */ (function () {
    function EffectsRunner(effectSources, store) {
        this.effectSources = effectSources;
        this.store = store;
        this.effectsSubscription = null;
    }
    EffectsRunner.prototype.start = function () {
        if (!this.effectsSubscription) {
            this.effectsSubscription = this.effectSources
                .toActions()
                .subscribe(this.store);
        }
    };
    EffectsRunner.prototype.ngOnDestroy = function () {
        if (this.effectsSubscription) {
            this.effectsSubscription.unsubscribe();
            this.effectsSubscription = null;
        }
    };
    EffectsRunner = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [EffectSources,
            Store])
    ], EffectsRunner);
    return EffectsRunner;
}());

var ROOT_EFFECTS_INIT = '@ngrx/effects/init';
var rootEffectsInit = createAction(ROOT_EFFECTS_INIT);
var EffectsRootModule = /** @class */ (function () {
    function EffectsRootModule(sources, runner, store, rootEffects, storeRootModule, storeFeatureModule, guard) {
        this.sources = sources;
        runner.start();
        rootEffects.forEach(function (effectSourceInstance) {
            return sources.addEffects(effectSourceInstance);
        });
        store.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    EffectsRootModule.prototype.addEffects = function (effectSourceInstance) {
        this.sources.addEffects(effectSourceInstance);
    };
    EffectsRootModule = __decorate([
        NgModule({}),
        __param(3, Inject(ROOT_EFFECTS)),
        __param(4, Optional()),
        __param(5, Optional()),
        __param(6, Optional()),
        __param(6, Inject(_ROOT_EFFECTS_GUARD)),
        __metadata("design:paramtypes", [EffectSources,
            EffectsRunner,
            Store, Array, StoreRootModule,
            StoreFeatureModule, Object])
    ], EffectsRootModule);
    return EffectsRootModule;
}());

var EffectsFeatureModule = /** @class */ (function () {
    function EffectsFeatureModule(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        effectSourceGroups.forEach(function (group) {
            return group.forEach(function (effectSourceInstance) {
                return root.addEffects(effectSourceInstance);
            });
        });
    }
    EffectsFeatureModule = __decorate([
        NgModule({}),
        __param(1, Inject(FEATURE_EFFECTS)),
        __param(2, Optional()),
        __param(3, Optional()),
        __metadata("design:paramtypes", [EffectsRootModule, Array, StoreRootModule,
            StoreFeatureModule])
    ], EffectsFeatureModule);
    return EffectsFeatureModule;
}());

var EffectsModule = /** @class */ (function () {
    function EffectsModule() {
    }
    EffectsModule.forFeature = function (featureEffects) {
        if (featureEffects === void 0) { featureEffects = []; }
        return {
            ngModule: EffectsFeatureModule,
            providers: [
                featureEffects,
                {
                    provide: _FEATURE_EFFECTS,
                    multi: true,
                    useValue: featureEffects,
                },
                {
                    provide: USER_PROVIDED_EFFECTS,
                    multi: true,
                    useValue: [],
                },
                {
                    provide: FEATURE_EFFECTS,
                    multi: true,
                    useFactory: createEffects,
                    deps: [Injector, _FEATURE_EFFECTS, USER_PROVIDED_EFFECTS],
                },
            ],
        };
    };
    EffectsModule.forRoot = function (rootEffects) {
        if (rootEffects === void 0) { rootEffects = []; }
        return {
            ngModule: EffectsRootModule,
            providers: [
                {
                    provide: _ROOT_EFFECTS_GUARD,
                    useFactory: _provideForRootGuard,
                    deps: [[EffectsRunner, new Optional(), new SkipSelf()]],
                },
                {
                    provide: EFFECTS_ERROR_HANDLER,
                    useValue: defaultEffectsErrorHandler,
                },
                EffectsRunner,
                EffectSources,
                Actions,
                rootEffects,
                {
                    provide: _ROOT_EFFECTS,
                    useValue: [rootEffects],
                },
                {
                    provide: USER_PROVIDED_EFFECTS,
                    multi: true,
                    useValue: [],
                },
                {
                    provide: ROOT_EFFECTS,
                    useFactory: createEffects,
                    deps: [Injector, _ROOT_EFFECTS, USER_PROVIDED_EFFECTS],
                },
            ],
        };
    };
    EffectsModule = __decorate([
        NgModule({})
    ], EffectsModule);
    return EffectsModule;
}());
function createEffects(injector, effectGroups, userProvidedEffectGroups) {
    var e_1, _a, e_2, _b;
    var mergedEffects = [];
    try {
        for (var effectGroups_1 = __values(effectGroups), effectGroups_1_1 = effectGroups_1.next(); !effectGroups_1_1.done; effectGroups_1_1 = effectGroups_1.next()) {
            var effectGroup = effectGroups_1_1.value;
            mergedEffects.push.apply(mergedEffects, __spread(effectGroup));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (effectGroups_1_1 && !effectGroups_1_1.done && (_a = effectGroups_1.return)) _a.call(effectGroups_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var userProvidedEffectGroups_1 = __values(userProvidedEffectGroups), userProvidedEffectGroups_1_1 = userProvidedEffectGroups_1.next(); !userProvidedEffectGroups_1_1.done; userProvidedEffectGroups_1_1 = userProvidedEffectGroups_1.next()) {
            var userProvidedEffectGroup = userProvidedEffectGroups_1_1.value;
            mergedEffects.push.apply(mergedEffects, __spread(userProvidedEffectGroup));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (userProvidedEffectGroups_1_1 && !userProvidedEffectGroups_1_1.done && (_b = userProvidedEffectGroups_1.return)) _b.call(userProvidedEffectGroups_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return createEffectInstances(injector, mergedEffects);
}
function createEffectInstances(injector, effects) {
    return effects.map(function (effect) { return injector.get(effect); });
}
function _provideForRootGuard(runner) {
    if (runner) {
        throw new TypeError("EffectsModule.forRoot() called twice. Feature modules should use EffectsModule.forFeature() instead.");
    }
    return 'guarded';
}

function act(
/** Allow to take either config object or project/error functions */
configOrProject, errorFn) {
    var _a = typeof configOrProject === 'function'
        ? {
            project: configOrProject,
            error: errorFn,
            operator: concatMap,
            complete: undefined,
            unsubscribe: undefined,
        }
        : __assign(__assign({}, configOrProject), { operator: configOrProject.operator || concatMap }), project = _a.project, error = _a.error, complete = _a.complete, operator = _a.operator, unsubscribe = _a.unsubscribe;
    return function (source) {
        return defer(function () {
            var subject = new Subject();
            return merge(source.pipe(operator(function (input, index) {
                return defer(function () {
                    var completed = false;
                    var errored = false;
                    var projectedCount = 0;
                    return project(input, index).pipe(materialize(), map(function (notification) {
                        switch (notification.kind) {
                            case 'E':
                                errored = true;
                                return new Notification(
                                // TODO: remove any in RxJS 6.5
                                'N', error(notification.error, input));
                            case 'C':
                                completed = true;
                                return complete
                                    ? new Notification(
                                    // TODO: remove any in RxJS 6.5
                                    'N', complete(projectedCount, input))
                                    : undefined;
                            default:
                                ++projectedCount;
                                return notification;
                        }
                    }), filter(function (n) { return n != null; }), dematerialize(), finalize(function () {
                        if (!completed && !errored && unsubscribe) {
                            subject.next(unsubscribe(projectedCount, input));
                        }
                    }));
                });
            })), subject);
        });
    };
}

/**
 * DO NOT EDIT
 *
 * This file is automatically generated at build
 */

/**
 * Generated bundle index. Do not edit.
 */

export { Actions, EFFECTS_ERROR_HANDLER, Effect, EffectSources, EffectsFeatureModule, EffectsModule, EffectsRootModule, EffectsRunner, ROOT_EFFECTS_INIT, USER_PROVIDED_EFFECTS, act, createEffect, defaultEffectsErrorHandler, getEffectsMetadata, mergeEffects, ofType, rootEffectsInit, getSourceMetadata as ɵngrx_modules_effects_effects_a, createEffects as ɵngrx_modules_effects_effects_b, _provideForRootGuard as ɵngrx_modules_effects_effects_c, _ROOT_EFFECTS_GUARD as ɵngrx_modules_effects_effects_d, _ROOT_EFFECTS as ɵngrx_modules_effects_effects_e, ROOT_EFFECTS as ɵngrx_modules_effects_effects_f, _FEATURE_EFFECTS as ɵngrx_modules_effects_effects_g, FEATURE_EFFECTS as ɵngrx_modules_effects_effects_h };
//# sourceMappingURL=effects.js.map
