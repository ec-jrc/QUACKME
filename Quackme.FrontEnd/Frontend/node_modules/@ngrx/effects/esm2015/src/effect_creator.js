/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_creator.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { DEFAULT_EFFECT_CONFIG, CREATE_EFFECT_METADATA_KEY, } from './models';
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
export function createEffect(source, config) {
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
export function getCreateEffectMetadata(instance) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X2NyZWF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdF9jcmVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsT0FBTyxFQUdMLHFCQUFxQixFQUVyQiwwQkFBMEIsR0FDM0IsTUFBTSxVQUFVLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQ2xCLE1BQU0sVUFBVSxZQUFZLENBSzFCLE1BQWUsRUFBRSxNQUFtQjs7VUFDOUIsTUFBTSxHQUFHLE1BQU0sRUFBRTs7VUFDakIsS0FBSyxtQ0FDTixxQkFBcUIsR0FDckIsTUFBTSxDQUNWO0lBQ0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsMEJBQTBCLEVBQUU7UUFDeEQsS0FBSztLQUNOLENBQUMsQ0FBQztJQUNILE9BQU8sbUJBQUEsTUFBTSxFQUF3QyxDQUFDO0FBQ3hELENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSx1QkFBdUIsQ0FFckMsUUFBVzs7VUFDTCxhQUFhLEdBQUcsbUJBQUEsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFrQjs7VUFFdEUsUUFBUSxHQUF3QixhQUFhO1NBQ2hELE1BQU07Ozs7SUFDTCxZQUFZLENBQUMsRUFBRSxDQUNiLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFDdEIsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQyxFQUNwRTtTQUNBLEdBQUc7Ozs7SUFBQyxZQUFZLENBQUMsRUFBRTs7Y0FDWixRQUFRLEdBQUcsQ0FBQyxtQkFBQSxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQU8sQ0FBQyxDQUM5QywwQkFBMEIsQ0FDM0I7UUFDRCx1QkFDRSxZQUFZLElBQ1QsUUFBUSxFQUNYO0lBQ0osQ0FBQyxFQUFDO0lBRUosT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7XG4gIEVmZmVjdE1ldGFkYXRhLFxuICBFZmZlY3RDb25maWcsXG4gIERFRkFVTFRfRUZGRUNUX0NPTkZJRyxcbiAgQ3JlYXRlRWZmZWN0TWV0YWRhdGEsXG4gIENSRUFURV9FRkZFQ1RfTUVUQURBVEFfS0VZLFxufSBmcm9tICcuL21vZGVscyc7XG5cbnR5cGUgRGlzcGF0Y2hUeXBlPFQ+ID0gVCBleHRlbmRzIHsgZGlzcGF0Y2g6IGluZmVyIFUgfSA/IFUgOiB0cnVlO1xudHlwZSBPYnNlcnZhYmxlVHlwZTxULCBPcmlnaW5hbFR5cGU+ID0gVCBleHRlbmRzIGZhbHNlID8gT3JpZ2luYWxUeXBlIDogQWN0aW9uO1xuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENyZWF0ZXMgYW4gZWZmZWN0IGZyb20gYW4gYE9ic2VydmFibGVgIGFuZCBhbiBgRWZmZWN0Q29uZmlnYC5cbiAqXG4gKiBAcGFyYW0gc291cmNlIEEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhbiBgT2JzZXJ2YWJsZWAuXG4gKiBAcGFyYW0gY29uZmlnIEEgYFBhcnRpYWw8RWZmZWN0Q29uZmlnPmAgdG8gY29uZmlndXJlIHRoZSBlZmZlY3QuICBCeSBkZWZhdWx0LCBgZGlzcGF0Y2hgIGlzIHRydWUgYW5kIGB1c2VFZmZlY3RzRXJyb3JIYW5kbGVyYCBpcyB0cnVlLlxuICogQHJldHVybnMgSWYgYEVmZmVjdENvbmZpZ2AjYGRpc3BhdGNoYCBpcyB0cnVlLCByZXR1cm5zIGBPYnNlcnZhYmxlPEFjdGlvbj5gLiAgRWxzZSwgcmV0dXJucyBgT2JzZXJ2YWJsZTx1bmtub3duPmAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAqKiBNYXBwaW5nIHRvIGEgZGlmZmVyZW50IGFjdGlvbiAqKlxuICogYGBgdHNcbiAqIGVmZmVjdE5hbWUkID0gY3JlYXRlRWZmZWN0KFxuICogICAoKSA9PiB0aGlzLmFjdGlvbnMkLnBpcGUoXG4gKiAgICAgb2ZUeXBlKEZlYXR1cmVBY3Rpb25zLmFjdGlvbk9uZSksXG4gKiAgICAgbWFwKCgpID0+IEZlYXR1cmVBY3Rpb25zLmFjdGlvblR3bygpKVxuICogICApXG4gKiApO1xuICogYGBgXG4gKlxuICogICoqIE5vbi1kaXNwYXRjaGluZyBlZmZlY3RzICoqXG4gKiBgYGB0c1xuICogZWZmZWN0TmFtZSQgPSBjcmVhdGVFZmZlY3QoXG4gKiAgICgpID0+IHRoaXMuYWN0aW9ucyQucGlwZShcbiAqICAgICBvZlR5cGUoRmVhdHVyZUFjdGlvbnMuYWN0aW9uT25lKSxcbiAqICAgICB0YXAoKCkgPT4gY29uc29sZS5sb2coJ0FjdGlvbiBPbmUgRGlzcGF0Y2hlZCcpKVxuICogICApLFxuICogICB7IGRpc3BhdGNoOiBmYWxzZSB9XG4gKiAgIC8vIEZlYXR1cmVBY3Rpb25zLmFjdGlvbk9uZSBpcyBub3QgZGlzcGF0Y2hlZFxuICogKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWZmZWN0PFxuICBDIGV4dGVuZHMgRWZmZWN0Q29uZmlnLFxuICBEVCBleHRlbmRzIERpc3BhdGNoVHlwZTxDPixcbiAgT1QgZXh0ZW5kcyBPYnNlcnZhYmxlVHlwZTxEVCwgT1Q+LFxuICBSIGV4dGVuZHMgT2JzZXJ2YWJsZTxPVD4gfCAoKC4uLmFyZ3M6IGFueVtdKSA9PiBPYnNlcnZhYmxlPE9UPilcbj4oc291cmNlOiAoKSA9PiBSLCBjb25maWc/OiBQYXJ0aWFsPEM+KTogUiAmIENyZWF0ZUVmZmVjdE1ldGFkYXRhIHtcbiAgY29uc3QgZWZmZWN0ID0gc291cmNlKCk7XG4gIGNvbnN0IHZhbHVlOiBFZmZlY3RDb25maWcgPSB7XG4gICAgLi4uREVGQVVMVF9FRkZFQ1RfQ09ORklHLFxuICAgIC4uLmNvbmZpZywgLy8gT3ZlcnJpZGVzIGFueSBkZWZhdWx0cyBpZiB2YWx1ZXMgYXJlIHByb3ZpZGVkXG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlZmZlY3QsIENSRUFURV9FRkZFQ1RfTUVUQURBVEFfS0VZLCB7XG4gICAgdmFsdWUsXG4gIH0pO1xuICByZXR1cm4gZWZmZWN0IGFzIHR5cGVvZiBlZmZlY3QgJiBDcmVhdGVFZmZlY3RNZXRhZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0ZUVmZmVjdE1ldGFkYXRhPFxuICBUIGV4dGVuZHMgeyBbcHJvcHMgaW4ga2V5b2YgVF06IE9iamVjdCB9XG4+KGluc3RhbmNlOiBUKTogRWZmZWN0TWV0YWRhdGE8VD5bXSB7XG4gIGNvbnN0IHByb3BlcnR5TmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhpbnN0YW5jZSkgYXMgQXJyYXk8a2V5b2YgVD47XG5cbiAgY29uc3QgbWV0YWRhdGE6IEVmZmVjdE1ldGFkYXRhPFQ+W10gPSBwcm9wZXJ0eU5hbWVzXG4gICAgLmZpbHRlcihcbiAgICAgIHByb3BlcnR5TmFtZSA9PlxuICAgICAgICBpbnN0YW5jZVtwcm9wZXJ0eU5hbWVdICYmXG4gICAgICAgIGluc3RhbmNlW3Byb3BlcnR5TmFtZV0uaGFzT3duUHJvcGVydHkoQ1JFQVRFX0VGRkVDVF9NRVRBREFUQV9LRVkpXG4gICAgKVxuICAgIC5tYXAocHJvcGVydHlOYW1lID0+IHtcbiAgICAgIGNvbnN0IG1ldGFEYXRhID0gKGluc3RhbmNlW3Byb3BlcnR5TmFtZV0gYXMgYW55KVtcbiAgICAgICAgQ1JFQVRFX0VGRkVDVF9NRVRBREFUQV9LRVlcbiAgICAgIF07XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wZXJ0eU5hbWUsXG4gICAgICAgIC4uLm1ldGFEYXRhLFxuICAgICAgfTtcbiAgICB9KTtcblxuICByZXR1cm4gbWV0YWRhdGE7XG59XG4iXX0=