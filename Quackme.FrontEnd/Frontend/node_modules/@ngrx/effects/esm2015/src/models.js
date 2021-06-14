/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/models.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Configures an effect created by `createEffect`.
 * @record
 */
export function EffectConfig() { }
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
export const DEFAULT_EFFECT_CONFIG = {
    dispatch: true,
    useEffectsErrorHandler: true,
};
/** @type {?} */
export const CREATE_EFFECT_METADATA_KEY = '__@ngrx/effects_create__';
/**
 * @record
 */
export function CreateEffectMetadata() { }
if (false) {
    /* Skipping unnamed member:
    [CREATE_EFFECT_METADATA_KEY]: EffectConfig;*/
}
/**
 * @record
 * @template T
 */
export function EffectMetadata() { }
if (false) {
    /** @type {?} */
    EffectMetadata.prototype.propertyName;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9lZmZlY3RzL3NyYy9tb2RlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBR0Esa0NBVUM7Ozs7Ozs7SUFMQyxnQ0FBbUI7Ozs7O0lBSW5CLDhDQUFpQzs7O0FBR25DLE1BQU0sT0FBTyxxQkFBcUIsR0FBcUM7SUFDckUsUUFBUSxFQUFFLElBQUk7SUFDZCxzQkFBc0IsRUFBRSxJQUFJO0NBQzdCOztBQUVELE1BQU0sT0FBTywwQkFBMEIsR0FBRywwQkFBMEI7Ozs7QUFFcEUsMENBRUM7Ozs7Ozs7OztBQU9ELG9DQUdDOzs7SUFEQyxzQ0FBbUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbmZpZ3VyZXMgYW4gZWZmZWN0IGNyZWF0ZWQgYnkgYGNyZWF0ZUVmZmVjdGAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRWZmZWN0Q29uZmlnIHtcbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhlIGFjdGlvbiBlbWl0dGVkIGJ5IHRoZSBlZmZlY3QgaXMgZGlzcGF0Y2hlZCB0byB0aGUgc3RvcmUuXG4gICAqIElmIGZhbHNlLCBlZmZlY3QgZG9lcyBub3QgbmVlZCB0byByZXR1cm4gdHlwZSBgT2JzZXJ2YWJsZTxBY3Rpb24+YC5cbiAgICovXG4gIGRpc3BhdGNoPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhlIGVmZmVjdCB3aWxsIGJlIHJlc3Vic2NyaWJlZCB0byBpZiBhbiBlcnJvciBvY2N1cnMgaW4gdGhlIG1haW4gYWN0aW9ucyBzdHJlYW0uXG4gICAqL1xuICB1c2VFZmZlY3RzRXJyb3JIYW5kbGVyPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRUZGRUNUX0NPTkZJRzogUmVhZG9ubHk8UmVxdWlyZWQ8RWZmZWN0Q29uZmlnPj4gPSB7XG4gIGRpc3BhdGNoOiB0cnVlLFxuICB1c2VFZmZlY3RzRXJyb3JIYW5kbGVyOiB0cnVlLFxufTtcblxuZXhwb3J0IGNvbnN0IENSRUFURV9FRkZFQ1RfTUVUQURBVEFfS0VZID0gJ19fQG5ncngvZWZmZWN0c19jcmVhdGVfXyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlRWZmZWN0TWV0YWRhdGEge1xuICBbQ1JFQVRFX0VGRkVDVF9NRVRBREFUQV9LRVldOiBFZmZlY3RDb25maWc7XG59XG5cbmV4cG9ydCB0eXBlIEVmZmVjdFByb3BlcnR5S2V5PFQgZXh0ZW5kcyBPYmplY3Q+ID0gRXhjbHVkZTxcbiAga2V5b2YgVCxcbiAga2V5b2YgT2JqZWN0XG4+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEVmZmVjdE1ldGFkYXRhPFQgZXh0ZW5kcyBPYmplY3Q+XG4gIGV4dGVuZHMgUmVxdWlyZWQ8RWZmZWN0Q29uZmlnPiB7XG4gIHByb3BlcnR5TmFtZTogRWZmZWN0UHJvcGVydHlLZXk8VD47XG59XG5cbmV4cG9ydCB0eXBlIEVmZmVjdHNNZXRhZGF0YTxUPiA9IHtcbiAgW2tleSBpbiBFZmZlY3RQcm9wZXJ0eUtleTxUPl0/OiBFZmZlY3RDb25maWdcbn07XG4iXX0=