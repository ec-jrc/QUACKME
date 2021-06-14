/**
 * @license NgRx 9.1.0
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('tslib'), require('@ngrx/store'), require('rxjs'), require('rxjs/operators'), require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('@ngrx/effects', ['exports', 'tslib', '@ngrx/store', 'rxjs', 'rxjs/operators', '@angular/core'], factory) :
    (global = global || self, factory((global.ngrx = global.ngrx || {}, global.ngrx.effects = {}), global.tslib, global.ngrx.store, global.rxjs, global.rxjs.operators, global.ng.core));
}(this, (function (exports, tslib, store, rxjs, operators, core) { 'use strict';

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
        var value = tslib.__assign(tslib.__assign({}, DEFAULT_EFFECT_CONFIG), config);
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
            return tslib.__assign({ propertyName: propertyName }, metaData);
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
            var metadata = tslib.__assign(tslib.__assign(tslib.__assign({}, DEFAULT_EFFECT_CONFIG), config), { // Overrides any defaults if values are provided
                propertyName: propertyName });
            addEffectMetadataEntry(target, metadata);
        };
    }
    function getEffectDecoratorMetadata(instance) {
        var effectsDecorators = store.compose(getEffectMetadataEntries, getSourceForInstance)(instance);
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
                return effectAction$.pipe(operators.ignoreElements());
            }
            var materialized$ = effectAction$.pipe(operators.materialize());
            return materialized$.pipe(operators.map(function (notification) { return ({
                effect: sourceInstance[propertyName],
                notification: notification,
                propertyName: propertyName,
                sourceName: sourceName,
                sourceInstance: sourceInstance,
            }); }));
        });
        return rxjs.merge.apply(void 0, tslib.__spread(observables$));
    }

    var MAX_NUMBER_OF_RETRY_ATTEMPTS = 10;
    function defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft) {
        if (retryAttemptLeft === void 0) { retryAttemptLeft = MAX_NUMBER_OF_RETRY_ATTEMPTS; }
        return observable$.pipe(operators.catchError(function (error) {
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
        tslib.__extends(Actions, _super);
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
        Actions = Actions_1 = tslib.__decorate([
            core.Injectable(),
            tslib.__param(0, core.Inject(store.ScannedActionsSubject)),
            tslib.__metadata("design:paramtypes", [rxjs.Observable])
        ], Actions);
        return Actions;
    }(rxjs.Observable));
    function ofType() {
        var allowedTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            allowedTypes[_i] = arguments[_i];
        }
        return operators.filter(function (action) {
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

    var _ROOT_EFFECTS_GUARD = new core.InjectionToken('@ngrx/effects Internal Root Guard');
    var IMMEDIATE_EFFECTS = new core.InjectionToken('ngrx/effects: Immediate Effects');
    var USER_PROVIDED_EFFECTS = new core.InjectionToken('ngrx/effects: User Provided Effects');
    var _ROOT_EFFECTS = new core.InjectionToken('ngrx/effects: Internal Root Effects');
    var ROOT_EFFECTS = new core.InjectionToken('ngrx/effects: Root Effects');
    var _FEATURE_EFFECTS = new core.InjectionToken('ngrx/effects: Internal Feature Effects');
    var FEATURE_EFFECTS = new core.InjectionToken('ngrx/effects: Feature Effects');
    var EFFECTS_ERROR_HANDLER = new core.InjectionToken('ngrx/effects: Effects Error Handler');

    var EffectSources = /** @class */ (function (_super) {
        tslib.__extends(EffectSources, _super);
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
            return this.pipe(operators.groupBy(getSourceForInstance), operators.mergeMap(function (source$) {
                return source$.pipe(operators.groupBy(effectsInstance));
            }), operators.mergeMap(function (source$) {
                var effect$ = source$.pipe(operators.exhaustMap(function (sourceInstance) {
                    return resolveEffectSource(_this.errorHandler, _this.effectsErrorHandler)(sourceInstance);
                }), operators.map(function (output) {
                    reportInvalidActions(output, _this.errorHandler);
                    return output.notification;
                }), operators.filter(function (notification) {
                    return notification.kind === 'N';
                }), operators.dematerialize());
                // start the stream with an INIT action
                // do this only for the first Effect instance
                var init$ = source$.pipe(operators.take(1), operators.filter(isOnInitEffects), operators.map(function (instance) { return instance.ngrxOnInitEffects(); }));
                return rxjs.merge(effect$, init$);
            }));
        };
        EffectSources = tslib.__decorate([
            core.Injectable(),
            tslib.__param(1, core.Inject(EFFECTS_ERROR_HANDLER)),
            tslib.__metadata("design:paramtypes", [core.ErrorHandler, Function])
        ], EffectSources);
        return EffectSources;
    }(rxjs.Subject));
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
        EffectsRunner = tslib.__decorate([
            core.Injectable(),
            tslib.__metadata("design:paramtypes", [EffectSources,
                store.Store])
        ], EffectsRunner);
        return EffectsRunner;
    }());

    var ROOT_EFFECTS_INIT = '@ngrx/effects/init';
    var rootEffectsInit = store.createAction(ROOT_EFFECTS_INIT);
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
        EffectsRootModule = tslib.__decorate([
            core.NgModule({}),
            tslib.__param(3, core.Inject(ROOT_EFFECTS)),
            tslib.__param(4, core.Optional()),
            tslib.__param(5, core.Optional()),
            tslib.__param(6, core.Optional()),
            tslib.__param(6, core.Inject(_ROOT_EFFECTS_GUARD)),
            tslib.__metadata("design:paramtypes", [EffectSources,
                EffectsRunner,
                store.Store, Array, store.StoreRootModule,
                store.StoreFeatureModule, Object])
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
        EffectsFeatureModule = tslib.__decorate([
            core.NgModule({}),
            tslib.__param(1, core.Inject(FEATURE_EFFECTS)),
            tslib.__param(2, core.Optional()),
            tslib.__param(3, core.Optional()),
            tslib.__metadata("design:paramtypes", [EffectsRootModule, Array, store.StoreRootModule,
                store.StoreFeatureModule])
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
                        deps: [core.Injector, _FEATURE_EFFECTS, USER_PROVIDED_EFFECTS],
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
                        deps: [[EffectsRunner, new core.Optional(), new core.SkipSelf()]],
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
                        deps: [core.Injector, _ROOT_EFFECTS, USER_PROVIDED_EFFECTS],
                    },
                ],
            };
        };
        EffectsModule = tslib.__decorate([
            core.NgModule({})
        ], EffectsModule);
        return EffectsModule;
    }());
    function createEffects(injector, effectGroups, userProvidedEffectGroups) {
        var e_1, _a, e_2, _b;
        var mergedEffects = [];
        try {
            for (var effectGroups_1 = tslib.__values(effectGroups), effectGroups_1_1 = effectGroups_1.next(); !effectGroups_1_1.done; effectGroups_1_1 = effectGroups_1.next()) {
                var effectGroup = effectGroups_1_1.value;
                mergedEffects.push.apply(mergedEffects, tslib.__spread(effectGroup));
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
            for (var userProvidedEffectGroups_1 = tslib.__values(userProvidedEffectGroups), userProvidedEffectGroups_1_1 = userProvidedEffectGroups_1.next(); !userProvidedEffectGroups_1_1.done; userProvidedEffectGroups_1_1 = userProvidedEffectGroups_1.next()) {
                var userProvidedEffectGroup = userProvidedEffectGroups_1_1.value;
                mergedEffects.push.apply(mergedEffects, tslib.__spread(userProvidedEffectGroup));
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
                operator: operators.concatMap,
                complete: undefined,
                unsubscribe: undefined,
            }
            : tslib.__assign(tslib.__assign({}, configOrProject), { operator: configOrProject.operator || operators.concatMap }), project = _a.project, error = _a.error, complete = _a.complete, operator = _a.operator, unsubscribe = _a.unsubscribe;
        return function (source) {
            return rxjs.defer(function () {
                var subject = new rxjs.Subject();
                return rxjs.merge(source.pipe(operator(function (input, index) {
                    return rxjs.defer(function () {
                        var completed = false;
                        var errored = false;
                        var projectedCount = 0;
                        return project(input, index).pipe(operators.materialize(), operators.map(function (notification) {
                            switch (notification.kind) {
                                case 'E':
                                    errored = true;
                                    return new rxjs.Notification(
                                    // TODO: remove any in RxJS 6.5
                                    'N', error(notification.error, input));
                                case 'C':
                                    completed = true;
                                    return complete
                                        ? new rxjs.Notification(
                                        // TODO: remove any in RxJS 6.5
                                        'N', complete(projectedCount, input))
                                        : undefined;
                                default:
                                    ++projectedCount;
                                    return notification;
                            }
                        }), operators.filter(function (n) { return n != null; }), operators.dematerialize(), operators.finalize(function () {
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

    exports.Actions = Actions;
    exports.EFFECTS_ERROR_HANDLER = EFFECTS_ERROR_HANDLER;
    exports.Effect = Effect;
    exports.EffectSources = EffectSources;
    exports.EffectsFeatureModule = EffectsFeatureModule;
    exports.EffectsModule = EffectsModule;
    exports.EffectsRootModule = EffectsRootModule;
    exports.EffectsRunner = EffectsRunner;
    exports.ROOT_EFFECTS_INIT = ROOT_EFFECTS_INIT;
    exports.USER_PROVIDED_EFFECTS = USER_PROVIDED_EFFECTS;
    exports.act = act;
    exports.createEffect = createEffect;
    exports.defaultEffectsErrorHandler = defaultEffectsErrorHandler;
    exports.getEffectsMetadata = getEffectsMetadata;
    exports.mergeEffects = mergeEffects;
    exports.ofType = ofType;
    exports.rootEffectsInit = rootEffectsInit;
    exports.ɵngrx_modules_effects_effects_a = getSourceMetadata;
    exports.ɵngrx_modules_effects_effects_b = createEffects;
    exports.ɵngrx_modules_effects_effects_c = _provideForRootGuard;
    exports.ɵngrx_modules_effects_effects_d = _ROOT_EFFECTS_GUARD;
    exports.ɵngrx_modules_effects_effects_e = _ROOT_EFFECTS;
    exports.ɵngrx_modules_effects_effects_f = ROOT_EFFECTS;
    exports.ɵngrx_modules_effects_effects_g = _FEATURE_EFFECTS;
    exports.ɵngrx_modules_effects_effects_h = FEATURE_EFFECTS;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=effects.umd.js.map
