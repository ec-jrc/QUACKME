/**
 * @license NgRx 9.1.0
 * (c) 2015-2018 Brandon Roberts, Mike Ryan, Rob Wormald, Victor Savkin
 * License: MIT
 */
import { compose, ScannedActionsSubject, Store, createAction, StoreRootModule, StoreFeatureModule } from '@ngrx/store';
import { merge, Observable, Subject, defer, Notification } from 'rxjs';
import { ignoreElements, materialize, map, catchError, filter, groupBy, mergeMap, exhaustMap, dematerialize, take, concatMap, finalize } from 'rxjs/operators';
import { Injectable, Inject, InjectionToken, ErrorHandler, NgModule, Optional, Injector, SkipSelf } from '@angular/core';

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/models.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Configures an effect created by `createEffect`.
 * @record
 */
function EffectConfig() { }
if (false) {
    /**
     * Determines if the action emitted by the effect is dispatched to the store.
     * If false, effect does not need to return type `Observable<Action>`.
     * @type {?|undefined}
     */
    EffectConfig.prototype.dispatch;
    /**
     * Determines if the effect will be resubscribed to if an error occurs in the main actions stream.
     * @type {?|undefined}
     */
    EffectConfig.prototype.useEffectsErrorHandler;
}
/** @type {?} */
const DEFAULT_EFFECT_CONFIG = {
    dispatch: true,
    useEffectsErrorHandler: true,
};
/** @type {?} */
const CREATE_EFFECT_METADATA_KEY = '__@ngrx/effects_create__';
/**
 * @record
 */
function CreateEffectMetadata() { }
if (false) {
    /* Skipping unnamed member:
    [CREATE_EFFECT_METADATA_KEY]: EffectConfig;*/
}
/**
 * @record
 * @template T
 */
function EffectMetadata() { }
if (false) {
    /** @type {?} */
    EffectMetadata.prototype.propertyName;
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_creator.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * \@description
 * Creates an effect from an `Observable` and an `EffectConfig`.
 *
 * \@usageNotes
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
 * @template C, DT, OT, R
 * @param {?} source A function which returns an `Observable`.
 * @param {?=} config A `Partial<EffectConfig>` to configure the effect.  By default, `dispatch` is true and `useEffectsErrorHandler` is true.
 * @return {?} If `EffectConfig`#`dispatch` is true, returns `Observable<Action>`.  Else, returns `Observable<unknown>`.
 *
 */
function createEffect(source, config) {
    /** @type {?} */
    const effect = source();
    /** @type {?} */
    const value = Object.assign(Object.assign({}, DEFAULT_EFFECT_CONFIG), config);
    Object.defineProperty(effect, CREATE_EFFECT_METADATA_KEY, {
        value,
    });
    return (/** @type {?} */ (effect));
}
/**
 * @template T
 * @param {?} instance
 * @return {?}
 */
function getCreateEffectMetadata(instance) {
    /** @type {?} */
    const propertyNames = (/** @type {?} */ (Object.getOwnPropertyNames(instance)));
    /** @type {?} */
    const metadata = propertyNames
        .filter((/**
     * @param {?} propertyName
     * @return {?}
     */
    propertyName => instance[propertyName] &&
        instance[propertyName].hasOwnProperty(CREATE_EFFECT_METADATA_KEY)))
        .map((/**
     * @param {?} propertyName
     * @return {?}
     */
    propertyName => {
        /** @type {?} */
        const metaData = ((/** @type {?} */ (instance[propertyName])))[CREATE_EFFECT_METADATA_KEY];
        return Object.assign({ propertyName }, metaData);
    }));
    return metadata;
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/utils.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @template T
 * @param {?} instance
 * @return {?}
 */
function getSourceForInstance(instance) {
    return Object.getPrototypeOf(instance);
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_decorator.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const METADATA_KEY = '__@ngrx/effects__';
/**
 * @param {?=} config
 * @return {?}
 */
function Effect(config = {}) {
    return (/**
     * @template T, K
     * @param {?} target
     * @param {?} propertyName
     * @return {?}
     */
    function (target, propertyName) {
        /** @type {?} */
        const metadata = Object.assign(Object.assign(Object.assign({}, DEFAULT_EFFECT_CONFIG), config), { // Overrides any defaults if values are provided
            propertyName });
        addEffectMetadataEntry(target, metadata);
    });
}
/**
 * @template T
 * @param {?} instance
 * @return {?}
 */
function getEffectDecoratorMetadata(instance) {
    /** @type {?} */
    const effectsDecorators = compose(getEffectMetadataEntries, getSourceForInstance)(instance);
    return effectsDecorators;
}
/**
 * Type guard to detemine whether METADATA_KEY is already present on the Class
 * constructor
 * @template T
 * @param {?} sourceProto
 * @return {?}
 */
function hasMetadataEntries(sourceProto) {
    return sourceProto.constructor.hasOwnProperty(METADATA_KEY);
}
/**
 * Add Effect Metadata to the Effect Class constructor under specific key
 * @template T
 * @param {?} sourceProto
 * @param {?} metadata
 * @return {?}
 */
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
/**
 * @template T
 * @param {?} sourceProto
 * @return {?}
 */
function getEffectMetadataEntries(sourceProto) {
    return hasMetadataEntries(sourceProto)
        ? sourceProto.constructor[METADATA_KEY]
        : [];
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_metadata.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @template T
 * @param {?} instance
 * @return {?}
 */
function getEffectsMetadata(instance) {
    return getSourceMetadata(instance).reduce((/**
     * @param {?} acc
     * @param {?} __1
     * @return {?}
     */
    (acc, { propertyName, dispatch, useEffectsErrorHandler }) => {
        acc[propertyName] = { dispatch, useEffectsErrorHandler };
        return acc;
    }), {});
}
/**
 * @template T
 * @param {?} instance
 * @return {?}
 */
function getSourceMetadata(instance) {
    /** @type {?} */
    const effects = [
        getEffectDecoratorMetadata,
        getCreateEffectMetadata,
    ];
    return effects.reduce((/**
     * @param {?} sources
     * @param {?} source
     * @return {?}
     */
    (sources, source) => sources.concat(source(instance))), []);
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_resolver.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @param {?} sourceInstance
 * @param {?} globalErrorHandler
 * @param {?} effectsErrorHandler
 * @return {?}
 */
function mergeEffects(sourceInstance, globalErrorHandler, effectsErrorHandler) {
    /** @type {?} */
    const sourceName = getSourceForInstance(sourceInstance).constructor.name;
    /** @type {?} */
    const observables$ = getSourceMetadata(sourceInstance).map((/**
     * @param {?} __0
     * @return {?}
     */
    ({ propertyName, dispatch, useEffectsErrorHandler, }) => {
        /** @type {?} */
        const observable$ = typeof sourceInstance[propertyName] === 'function'
            ? sourceInstance[propertyName]()
            : sourceInstance[propertyName];
        /** @type {?} */
        const effectAction$ = useEffectsErrorHandler
            ? effectsErrorHandler(observable$, globalErrorHandler)
            : observable$;
        if (dispatch === false) {
            return effectAction$.pipe(ignoreElements());
        }
        /** @type {?} */
        const materialized$ = effectAction$.pipe(materialize());
        return materialized$.pipe(map((/**
         * @param {?} notification
         * @return {?}
         */
        (notification) => ({
            effect: sourceInstance[propertyName],
            notification,
            propertyName,
            sourceName,
            sourceInstance,
        }))));
    }));
    return merge(...observables$);
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_error_handler.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const MAX_NUMBER_OF_RETRY_ATTEMPTS = 10;
/**
 * @template T
 * @param {?} observable$
 * @param {?} errorHandler
 * @param {?=} retryAttemptLeft
 * @return {?}
 */
function defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft = MAX_NUMBER_OF_RETRY_ATTEMPTS) {
    return observable$.pipe(catchError((/**
     * @param {?} error
     * @return {?}
     */
    error => {
        if (errorHandler)
            errorHandler.handleError(error);
        if (retryAttemptLeft <= 1) {
            return observable$; // last attempt
        }
        // Return observable that produces this particular effect
        return defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft - 1);
    })));
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/actions.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @template V
 */
class Actions extends Observable {
    /**
     * @param {?=} source
     */
    constructor(source) {
        super();
        if (source) {
            this.source = source;
        }
    }
    /**
     * @template R
     * @param {?} operator
     * @return {?}
     */
    lift(operator) {
        /** @type {?} */
        const observable = new Actions();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
}
Actions.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Actions.ctorParameters = () => [
    { type: Observable, decorators: [{ type: Inject, args: [ScannedActionsSubject,] }] }
];
/**
 * @param {...?} allowedTypes
 * @return {?}
 */
function ofType(...allowedTypes) {
    return filter((/**
     * @param {?} action
     * @return {?}
     */
    (action) => allowedTypes.some((/**
     * @param {?} typeOrActionCreator
     * @return {?}
     */
    typeOrActionCreator => {
        if (typeof typeOrActionCreator === 'string') {
            // Comparing the string to type
            return typeOrActionCreator === action.type;
        }
        // We are filtering by ActionCreator
        return typeOrActionCreator.type === action.type;
    }))));
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_notification.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
function EffectNotification() { }
if (false) {
    /** @type {?} */
    EffectNotification.prototype.effect;
    /** @type {?} */
    EffectNotification.prototype.propertyName;
    /** @type {?} */
    EffectNotification.prototype.sourceName;
    /** @type {?} */
    EffectNotification.prototype.sourceInstance;
    /** @type {?} */
    EffectNotification.prototype.notification;
}
/**
 * @param {?} output
 * @param {?} reporter
 * @return {?}
 */
function reportInvalidActions(output, reporter) {
    if (output.notification.kind === 'N') {
        /** @type {?} */
        const action = output.notification.value;
        /** @type {?} */
        const isInvalidAction = !isAction(action);
        if (isInvalidAction) {
            reporter.handleError(new Error(`Effect ${getEffectName(output)} dispatched an invalid action: ${stringify(action)}`));
        }
    }
}
/**
 * @param {?} action
 * @return {?}
 */
function isAction(action) {
    return (typeof action !== 'function' &&
        action &&
        action.type &&
        typeof action.type === 'string');
}
/**
 * @param {?} __0
 * @return {?}
 */
function getEffectName({ propertyName, sourceInstance, sourceName, }) {
    /** @type {?} */
    const isMethod = typeof sourceInstance[propertyName] === 'function';
    return `"${sourceName}.${String(propertyName)}${isMethod ? '()' : ''}"`;
}
/**
 * @param {?} action
 * @return {?}
 */
function stringify(action) {
    try {
        return JSON.stringify(action);
    }
    catch (_a) {
        return action;
    }
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/lifecycle_hooks.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const onIdentifyEffectsKey = 'ngrxOnIdentifyEffects';
/**
 * @param {?} instance
 * @return {?}
 */
function isOnIdentifyEffects(instance) {
    return isFunction(instance, onIdentifyEffectsKey);
}
/** @type {?} */
const onRunEffectsKey = 'ngrxOnRunEffects';
/**
 * @param {?} instance
 * @return {?}
 */
function isOnRunEffects(instance) {
    return isFunction(instance, onRunEffectsKey);
}
/** @type {?} */
const onInitEffects = 'ngrxOnInitEffects';
/**
 * @param {?} instance
 * @return {?}
 */
function isOnInitEffects(instance) {
    return isFunction(instance, onInitEffects);
}
/**
 * @param {?} instance
 * @param {?} functionName
 * @return {?}
 */
function isFunction(instance, functionName) {
    return (instance &&
        functionName in instance &&
        typeof instance[functionName] === 'function');
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/tokens.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const _ROOT_EFFECTS_GUARD = new InjectionToken('@ngrx/effects Internal Root Guard');
/** @type {?} */
const IMMEDIATE_EFFECTS = new InjectionToken('ngrx/effects: Immediate Effects');
/** @type {?} */
const USER_PROVIDED_EFFECTS = new InjectionToken('ngrx/effects: User Provided Effects');
/** @type {?} */
const _ROOT_EFFECTS = new InjectionToken('ngrx/effects: Internal Root Effects');
/** @type {?} */
const ROOT_EFFECTS = new InjectionToken('ngrx/effects: Root Effects');
/** @type {?} */
const _FEATURE_EFFECTS = new InjectionToken('ngrx/effects: Internal Feature Effects');
/** @type {?} */
const FEATURE_EFFECTS = new InjectionToken('ngrx/effects: Feature Effects');
/** @type {?} */
const EFFECTS_ERROR_HANDLER = new InjectionToken('ngrx/effects: Effects Error Handler');

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_sources.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class EffectSources extends Subject {
    /**
     * @param {?} errorHandler
     * @param {?} effectsErrorHandler
     */
    constructor(errorHandler, effectsErrorHandler) {
        super();
        this.errorHandler = errorHandler;
        this.effectsErrorHandler = effectsErrorHandler;
    }
    /**
     * @param {?} effectSourceInstance
     * @return {?}
     */
    addEffects(effectSourceInstance) {
        this.next(effectSourceInstance);
    }
    /**
     * \@internal
     * @return {?}
     */
    toActions() {
        return this.pipe(groupBy(getSourceForInstance), mergeMap((/**
         * @param {?} source$
         * @return {?}
         */
        source$ => {
            return source$.pipe(groupBy(effectsInstance));
        })), mergeMap((/**
         * @param {?} source$
         * @return {?}
         */
        source$ => {
            /** @type {?} */
            const effect$ = source$.pipe(exhaustMap((/**
             * @param {?} sourceInstance
             * @return {?}
             */
            sourceInstance => {
                return resolveEffectSource(this.errorHandler, this.effectsErrorHandler)(sourceInstance);
            })), map((/**
             * @param {?} output
             * @return {?}
             */
            output => {
                reportInvalidActions(output, this.errorHandler);
                return output.notification;
            })), filter((/**
             * @param {?} notification
             * @return {?}
             */
            (notification) => notification.kind === 'N')), dematerialize());
            // start the stream with an INIT action
            // do this only for the first Effect instance
            /** @type {?} */
            const init$ = source$.pipe(take(1), filter(isOnInitEffects), map((/**
             * @param {?} instance
             * @return {?}
             */
            instance => instance.ngrxOnInitEffects())));
            return merge(effect$, init$);
        })));
    }
}
EffectSources.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EffectSources.ctorParameters = () => [
    { type: ErrorHandler },
    { type: undefined, decorators: [{ type: Inject, args: [EFFECTS_ERROR_HANDLER,] }] }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    EffectSources.prototype.errorHandler;
    /**
     * @type {?}
     * @private
     */
    EffectSources.prototype.effectsErrorHandler;
}
/**
 * @param {?} sourceInstance
 * @return {?}
 */
function effectsInstance(sourceInstance) {
    if (isOnIdentifyEffects(sourceInstance)) {
        return sourceInstance.ngrxOnIdentifyEffects();
    }
    return '';
}
/**
 * @param {?} errorHandler
 * @param {?} effectsErrorHandler
 * @return {?}
 */
function resolveEffectSource(errorHandler, effectsErrorHandler) {
    return (/**
     * @param {?} sourceInstance
     * @return {?}
     */
    sourceInstance => {
        /** @type {?} */
        const mergedEffects$ = mergeEffects(sourceInstance, errorHandler, effectsErrorHandler);
        if (isOnRunEffects(sourceInstance)) {
            return sourceInstance.ngrxOnRunEffects(mergedEffects$);
        }
        return mergedEffects$;
    });
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_runner.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class EffectsRunner {
    /**
     * @param {?} effectSources
     * @param {?} store
     */
    constructor(effectSources, store) {
        this.effectSources = effectSources;
        this.store = store;
        this.effectsSubscription = null;
    }
    /**
     * @return {?}
     */
    start() {
        if (!this.effectsSubscription) {
            this.effectsSubscription = this.effectSources
                .toActions()
                .subscribe(this.store);
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.effectsSubscription) {
            this.effectsSubscription.unsubscribe();
            this.effectsSubscription = null;
        }
    }
}
EffectsRunner.decorators = [
    { type: Injectable }
];
/** @nocollapse */
EffectsRunner.ctorParameters = () => [
    { type: EffectSources },
    { type: Store }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    EffectsRunner.prototype.effectsSubscription;
    /**
     * @type {?}
     * @private
     */
    EffectsRunner.prototype.effectSources;
    /**
     * @type {?}
     * @private
     */
    EffectsRunner.prototype.store;
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_root_module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const ROOT_EFFECTS_INIT = '@ngrx/effects/init';
/** @type {?} */
const rootEffectsInit = createAction(ROOT_EFFECTS_INIT);
class EffectsRootModule {
    /**
     * @param {?} sources
     * @param {?} runner
     * @param {?} store
     * @param {?} rootEffects
     * @param {?} storeRootModule
     * @param {?} storeFeatureModule
     * @param {?} guard
     */
    constructor(sources, runner, store, rootEffects, storeRootModule, storeFeatureModule, guard) {
        this.sources = sources;
        runner.start();
        rootEffects.forEach((/**
         * @param {?} effectSourceInstance
         * @return {?}
         */
        effectSourceInstance => sources.addEffects(effectSourceInstance)));
        store.dispatch({ type: ROOT_EFFECTS_INIT });
    }
    /**
     * @param {?} effectSourceInstance
     * @return {?}
     */
    addEffects(effectSourceInstance) {
        this.sources.addEffects(effectSourceInstance);
    }
}
EffectsRootModule.decorators = [
    { type: NgModule, args: [{},] }
];
/** @nocollapse */
EffectsRootModule.ctorParameters = () => [
    { type: EffectSources },
    { type: EffectsRunner },
    { type: Store },
    { type: Array, decorators: [{ type: Inject, args: [ROOT_EFFECTS,] }] },
    { type: StoreRootModule, decorators: [{ type: Optional }] },
    { type: StoreFeatureModule, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [_ROOT_EFFECTS_GUARD,] }] }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    EffectsRootModule.prototype.sources;
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_feature_module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class EffectsFeatureModule {
    /**
     * @param {?} root
     * @param {?} effectSourceGroups
     * @param {?} storeRootModule
     * @param {?} storeFeatureModule
     */
    constructor(root, effectSourceGroups, storeRootModule, storeFeatureModule) {
        effectSourceGroups.forEach((/**
         * @param {?} group
         * @return {?}
         */
        group => group.forEach((/**
         * @param {?} effectSourceInstance
         * @return {?}
         */
        effectSourceInstance => root.addEffects(effectSourceInstance)))));
    }
}
EffectsFeatureModule.decorators = [
    { type: NgModule, args: [{},] }
];
/** @nocollapse */
EffectsFeatureModule.ctorParameters = () => [
    { type: EffectsRootModule },
    { type: Array, decorators: [{ type: Inject, args: [FEATURE_EFFECTS,] }] },
    { type: StoreRootModule, decorators: [{ type: Optional }] },
    { type: StoreFeatureModule, decorators: [{ type: Optional }] }
];

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class EffectsModule {
    /**
     * @param {?=} featureEffects
     * @return {?}
     */
    static forFeature(featureEffects = []) {
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
    }
    /**
     * @param {?=} rootEffects
     * @return {?}
     */
    static forRoot(rootEffects = []) {
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
    }
}
EffectsModule.decorators = [
    { type: NgModule, args: [{},] }
];
/**
 * @param {?} injector
 * @param {?} effectGroups
 * @param {?} userProvidedEffectGroups
 * @return {?}
 */
function createEffects(injector, effectGroups, userProvidedEffectGroups) {
    /** @type {?} */
    const mergedEffects = [];
    for (let effectGroup of effectGroups) {
        mergedEffects.push(...effectGroup);
    }
    for (let userProvidedEffectGroup of userProvidedEffectGroups) {
        mergedEffects.push(...userProvidedEffectGroup);
    }
    return createEffectInstances(injector, mergedEffects);
}
/**
 * @param {?} injector
 * @param {?} effects
 * @return {?}
 */
function createEffectInstances(injector, effects) {
    return effects.map((/**
     * @param {?} effect
     * @return {?}
     */
    effect => injector.get(effect)));
}
/**
 * @param {?} runner
 * @return {?}
 */
function _provideForRootGuard(runner) {
    if (runner) {
        throw new TypeError(`EffectsModule.forRoot() called twice. Feature modules should use EffectsModule.forFeature() instead.`);
    }
    return 'guarded';
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/act.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Represents config with named paratemeters for act
 * @record
 * @template Input, OutputAction, ErrorAction, CompleteAction, UnsubscribeAction
 */
function ActConfig() { }
if (false) {
    /** @type {?} */
    ActConfig.prototype.project;
    /** @type {?} */
    ActConfig.prototype.error;
    /** @type {?|undefined} */
    ActConfig.prototype.complete;
    /** @type {?|undefined} */
    ActConfig.prototype.operator;
    /** @type {?|undefined} */
    ActConfig.prototype.unsubscribe;
}
/**
 * @template Input, OutputAction, ErrorAction, CompleteAction, UnsubscribeAction
 * @param {?} configOrProject
 * @param {?=} errorFn
 * @return {?}
 */
function act(
/** Allow to take either config object or project/error functions */
configOrProject, errorFn) {
    const { project, error, complete, operator, unsubscribe } = typeof configOrProject === 'function'
        ? {
            project: configOrProject,
            error: (/** @type {?} */ (errorFn)),
            operator: concatMap,
            complete: undefined,
            unsubscribe: undefined,
        }
        : Object.assign(Object.assign({}, configOrProject), { operator: configOrProject.operator || concatMap });
    return (/**
     * @param {?} source
     * @return {?}
     */
    source => defer((/**
     * @return {?}
     */
    () => {
        /** @type {?} */
        const subject = new Subject();
        return merge(source.pipe(operator((/**
         * @param {?} input
         * @param {?} index
         * @return {?}
         */
        (input, index) => defer((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            let completed = false;
            /** @type {?} */
            let errored = false;
            /** @type {?} */
            let projectedCount = 0;
            return project(input, index).pipe(materialize(), map((/**
             * @param {?} notification
             * @return {?}
             */
            (notification) => {
                switch (notification.kind) {
                    case 'E':
                        errored = true;
                        return new Notification((/** @type {?} */ (
                        // TODO: remove any in RxJS 6.5
                        'N')), error(notification.error, input));
                    case 'C':
                        completed = true;
                        return complete
                            ? new Notification((/** @type {?} */ (
                            // TODO: remove any in RxJS 6.5
                            'N')), complete(projectedCount, input))
                            : undefined;
                    default:
                        ++projectedCount;
                        return notification;
                }
            })), filter((/**
             * @param {?} n
             * @return {?}
             */
            (n) => n != null)), dematerialize(), finalize((/**
             * @return {?}
             */
            () => {
                if (!completed && !errored && unsubscribe) {
                    subject.next(unsubscribe(projectedCount, input));
                }
            })));
        }))))), subject);
    })));
}

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/index.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/public_api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/index.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { Actions, EFFECTS_ERROR_HANDLER, Effect, EffectSources, EffectsFeatureModule, EffectsModule, EffectsRootModule, EffectsRunner, ROOT_EFFECTS_INIT, USER_PROVIDED_EFFECTS, act, createEffect, defaultEffectsErrorHandler, getEffectsMetadata, mergeEffects, ofType, rootEffectsInit, getSourceMetadata as ɵngrx_modules_effects_effects_a, createEffects as ɵngrx_modules_effects_effects_b, _provideForRootGuard as ɵngrx_modules_effects_effects_c, _ROOT_EFFECTS_GUARD as ɵngrx_modules_effects_effects_d, _ROOT_EFFECTS as ɵngrx_modules_effects_effects_e, ROOT_EFFECTS as ɵngrx_modules_effects_effects_f, _FEATURE_EFFECTS as ɵngrx_modules_effects_effects_g, FEATURE_EFFECTS as ɵngrx_modules_effects_effects_h };
//# sourceMappingURL=effects.js.map
