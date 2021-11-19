/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_decorator.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { compose } from '@ngrx/store';
import { DEFAULT_EFFECT_CONFIG, } from './models';
import { getSourceForInstance } from './utils';
/** @type {?} */
const METADATA_KEY = '__@ngrx/effects__';
/**
 * @param {?=} config
 * @return {?}
 */
export function Effect(config = {}) {
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
export function getEffectDecoratorMetadata(instance) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X2RlY29yYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0X2RlY29yYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFdEMsT0FBTyxFQUNMLHFCQUFxQixHQUl0QixNQUFNLFVBQVUsQ0FBQztBQUNsQixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7O01BRXpDLFlBQVksR0FBRyxtQkFBbUI7Ozs7O0FBRXhDLE1BQU0sVUFBVSxNQUFNLENBQUMsU0FBdUIsRUFBRTtJQUM5Qzs7Ozs7O0lBQU8sVUFDTCxNQUFTLEVBQ1QsWUFBZTs7Y0FFVCxRQUFRLGlEQUNULHFCQUFxQixHQUNyQixNQUFNLEtBQUUsZ0RBQWdEO1lBQzNELFlBQVksR0FDYjtRQUNELHNCQUFzQixDQUFJLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM5QyxDQUFDLEVBQUM7QUFDSixDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLFFBQVc7O1VBRUwsaUJBQWlCLEdBQXdCLE9BQU8sQ0FDcEQsd0JBQXdCLEVBQ3hCLG9CQUFvQixDQUNyQixDQUFDLFFBQVEsQ0FBQztJQUVYLE9BQU8saUJBQWlCLENBQUM7QUFDM0IsQ0FBQzs7Ozs7Ozs7QUFNRCxTQUFTLGtCQUFrQixDQUN6QixXQUFjO0lBTWQsT0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM5RCxDQUFDOzs7Ozs7OztBQUdELFNBQVMsc0JBQXNCLENBQzdCLFdBQWMsRUFDZCxRQUEyQjtJQUUzQixJQUFJLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ25DLFdBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3REO1NBQU07UUFDTCxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFO1lBQzNELEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQztTQUNsQixDQUFDLENBQUM7S0FDSjtBQUNILENBQUM7Ozs7OztBQUVELFNBQVMsd0JBQXdCLENBQy9CLFdBQWM7SUFFZCxPQUFPLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztRQUNwQyxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7UUFDdkMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNULENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb21wb3NlIH0gZnJvbSAnQG5ncngvc3RvcmUnO1xuXG5pbXBvcnQge1xuICBERUZBVUxUX0VGRkVDVF9DT05GSUcsXG4gIEVmZmVjdENvbmZpZyxcbiAgRWZmZWN0TWV0YWRhdGEsXG4gIEVmZmVjdFByb3BlcnR5S2V5LFxufSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQgeyBnZXRTb3VyY2VGb3JJbnN0YW5jZSB9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBNRVRBREFUQV9LRVkgPSAnX19AbmdyeC9lZmZlY3RzX18nO1xuXG5leHBvcnQgZnVuY3Rpb24gRWZmZWN0KGNvbmZpZzogRWZmZWN0Q29uZmlnID0ge30pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uPFQgZXh0ZW5kcyBPYmplY3QsIEsgZXh0ZW5kcyBFZmZlY3RQcm9wZXJ0eUtleTxUPj4oXG4gICAgdGFyZ2V0OiBULFxuICAgIHByb3BlcnR5TmFtZTogS1xuICApIHtcbiAgICBjb25zdCBtZXRhZGF0YTogRWZmZWN0TWV0YWRhdGE8VD4gPSB7XG4gICAgICAuLi5ERUZBVUxUX0VGRkVDVF9DT05GSUcsXG4gICAgICAuLi5jb25maWcsIC8vIE92ZXJyaWRlcyBhbnkgZGVmYXVsdHMgaWYgdmFsdWVzIGFyZSBwcm92aWRlZFxuICAgICAgcHJvcGVydHlOYW1lLFxuICAgIH07XG4gICAgYWRkRWZmZWN0TWV0YWRhdGFFbnRyeTxUPih0YXJnZXQsIG1ldGFkYXRhKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVmZmVjdERlY29yYXRvck1ldGFkYXRhPFQ+KFxuICBpbnN0YW5jZTogVFxuKTogRWZmZWN0TWV0YWRhdGE8VD5bXSB7XG4gIGNvbnN0IGVmZmVjdHNEZWNvcmF0b3JzOiBFZmZlY3RNZXRhZGF0YTxUPltdID0gY29tcG9zZShcbiAgICBnZXRFZmZlY3RNZXRhZGF0YUVudHJpZXMsXG4gICAgZ2V0U291cmNlRm9ySW5zdGFuY2VcbiAgKShpbnN0YW5jZSk7XG5cbiAgcmV0dXJuIGVmZmVjdHNEZWNvcmF0b3JzO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgdG8gZGV0ZW1pbmUgd2hldGhlciBNRVRBREFUQV9LRVkgaXMgYWxyZWFkeSBwcmVzZW50IG9uIHRoZSBDbGFzc1xuICogY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gaGFzTWV0YWRhdGFFbnRyaWVzPFQgZXh0ZW5kcyBPYmplY3Q+KFxuICBzb3VyY2VQcm90bzogVFxuKTogc291cmNlUHJvdG8gaXMgdHlwZW9mIHNvdXJjZVByb3RvICYge1xuICBjb25zdHJ1Y3RvcjogdHlwZW9mIHNvdXJjZVByb3RvLmNvbnN0cnVjdG9yICYge1xuICAgIFtNRVRBREFUQV9LRVldOiBFZmZlY3RNZXRhZGF0YTxUPltdO1xuICB9O1xufSB7XG4gIHJldHVybiBzb3VyY2VQcm90by5jb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eShNRVRBREFUQV9LRVkpO1xufVxuXG4vKiogQWRkIEVmZmVjdCBNZXRhZGF0YSB0byB0aGUgRWZmZWN0IENsYXNzIGNvbnN0cnVjdG9yIHVuZGVyIHNwZWNpZmljIGtleSAqL1xuZnVuY3Rpb24gYWRkRWZmZWN0TWV0YWRhdGFFbnRyeTxUIGV4dGVuZHMgb2JqZWN0PihcbiAgc291cmNlUHJvdG86IFQsXG4gIG1ldGFkYXRhOiBFZmZlY3RNZXRhZGF0YTxUPlxuKSB7XG4gIGlmIChoYXNNZXRhZGF0YUVudHJpZXMoc291cmNlUHJvdG8pKSB7XG4gICAgc291cmNlUHJvdG8uY29uc3RydWN0b3JbTUVUQURBVEFfS0VZXS5wdXNoKG1ldGFkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc291cmNlUHJvdG8uY29uc3RydWN0b3IsIE1FVEFEQVRBX0tFWSwge1xuICAgICAgdmFsdWU6IFttZXRhZGF0YV0sXG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RWZmZWN0TWV0YWRhdGFFbnRyaWVzPFQgZXh0ZW5kcyBvYmplY3Q+KFxuICBzb3VyY2VQcm90bzogVFxuKTogRWZmZWN0TWV0YWRhdGE8VD5bXSB7XG4gIHJldHVybiBoYXNNZXRhZGF0YUVudHJpZXMoc291cmNlUHJvdG8pXG4gICAgPyBzb3VyY2VQcm90by5jb25zdHJ1Y3RvcltNRVRBREFUQV9LRVldXG4gICAgOiBbXTtcbn1cbiJdfQ==