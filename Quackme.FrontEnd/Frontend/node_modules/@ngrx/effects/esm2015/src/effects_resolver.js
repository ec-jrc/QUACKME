/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_resolver.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { merge } from 'rxjs';
import { ignoreElements, map, materialize } from 'rxjs/operators';
import { getSourceMetadata } from './effects_metadata';
import { getSourceForInstance } from './utils';
/**
 * @param {?} sourceInstance
 * @param {?} globalErrorHandler
 * @param {?} effectsErrorHandler
 * @return {?}
 */
export function mergeEffects(sourceInstance, globalErrorHandler, effectsErrorHandler) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE9BQU8sRUFBRSxLQUFLLEVBQTRCLE1BQU0sTUFBTSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR2xFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXZELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLFNBQVMsQ0FBQzs7Ozs7OztBQUcvQyxNQUFNLFVBQVUsWUFBWSxDQUMxQixjQUFtQixFQUNuQixrQkFBZ0MsRUFDaEMsbUJBQXdDOztVQUVsQyxVQUFVLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUk7O1VBRWxFLFlBQVksR0FBc0IsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRzs7OztJQUMzRSxDQUFDLEVBQ0MsWUFBWSxFQUNaLFFBQVEsRUFDUixzQkFBc0IsR0FDdkIsRUFBa0MsRUFBRTs7Y0FDN0IsV0FBVyxHQUNmLE9BQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLFVBQVU7WUFDaEQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNoQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQzs7Y0FFNUIsYUFBYSxHQUFHLHNCQUFzQjtZQUMxQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDO1lBQ3RELENBQUMsQ0FBQyxXQUFXO1FBRWYsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO1lBQ3RCLE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1NBQzdDOztjQUVLLGFBQWEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXZELE9BQU8sYUFBYSxDQUFDLElBQUksQ0FDdkIsR0FBRzs7OztRQUNELENBQUMsWUFBa0MsRUFBc0IsRUFBRSxDQUFDLENBQUM7WUFDM0QsTUFBTSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUM7WUFDcEMsWUFBWTtZQUNaLFlBQVk7WUFDWixVQUFVO1lBQ1YsY0FBYztTQUNmLENBQUMsRUFDSCxDQUNGLENBQUM7SUFDSixDQUFDLEVBQ0Y7SUFFRCxPQUFPLEtBQUssQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBtZXJnZSwgTm90aWZpY2F0aW9uLCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBpZ25vcmVFbGVtZW50cywgbWFwLCBtYXRlcmlhbGl6ZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgRWZmZWN0Tm90aWZpY2F0aW9uIH0gZnJvbSAnLi9lZmZlY3Rfbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGdldFNvdXJjZU1ldGFkYXRhIH0gZnJvbSAnLi9lZmZlY3RzX21ldGFkYXRhJztcbmltcG9ydCB7IEVmZmVjdHNFcnJvckhhbmRsZXIgfSBmcm9tICcuL2VmZmVjdHNfZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQgeyBnZXRTb3VyY2VGb3JJbnN0YW5jZSB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgRXJyb3JIYW5kbGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUVmZmVjdHMoXG4gIHNvdXJjZUluc3RhbmNlOiBhbnksXG4gIGdsb2JhbEVycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyLFxuICBlZmZlY3RzRXJyb3JIYW5kbGVyOiBFZmZlY3RzRXJyb3JIYW5kbGVyXG4pOiBPYnNlcnZhYmxlPEVmZmVjdE5vdGlmaWNhdGlvbj4ge1xuICBjb25zdCBzb3VyY2VOYW1lID0gZ2V0U291cmNlRm9ySW5zdGFuY2Uoc291cmNlSW5zdGFuY2UpLmNvbnN0cnVjdG9yLm5hbWU7XG5cbiAgY29uc3Qgb2JzZXJ2YWJsZXMkOiBPYnNlcnZhYmxlPGFueT5bXSA9IGdldFNvdXJjZU1ldGFkYXRhKHNvdXJjZUluc3RhbmNlKS5tYXAoXG4gICAgKHtcbiAgICAgIHByb3BlcnR5TmFtZSxcbiAgICAgIGRpc3BhdGNoLFxuICAgICAgdXNlRWZmZWN0c0Vycm9ySGFuZGxlcixcbiAgICB9KTogT2JzZXJ2YWJsZTxFZmZlY3ROb3RpZmljYXRpb24+ID0+IHtcbiAgICAgIGNvbnN0IG9ic2VydmFibGUkOiBPYnNlcnZhYmxlPGFueT4gPVxuICAgICAgICB0eXBlb2Ygc291cmNlSW5zdGFuY2VbcHJvcGVydHlOYW1lXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgID8gc291cmNlSW5zdGFuY2VbcHJvcGVydHlOYW1lXSgpXG4gICAgICAgICAgOiBzb3VyY2VJbnN0YW5jZVtwcm9wZXJ0eU5hbWVdO1xuXG4gICAgICBjb25zdCBlZmZlY3RBY3Rpb24kID0gdXNlRWZmZWN0c0Vycm9ySGFuZGxlclxuICAgICAgICA/IGVmZmVjdHNFcnJvckhhbmRsZXIob2JzZXJ2YWJsZSQsIGdsb2JhbEVycm9ySGFuZGxlcilcbiAgICAgICAgOiBvYnNlcnZhYmxlJDtcblxuICAgICAgaWYgKGRpc3BhdGNoID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZWZmZWN0QWN0aW9uJC5waXBlKGlnbm9yZUVsZW1lbnRzKCkpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRlcmlhbGl6ZWQkID0gZWZmZWN0QWN0aW9uJC5waXBlKG1hdGVyaWFsaXplKCkpO1xuXG4gICAgICByZXR1cm4gbWF0ZXJpYWxpemVkJC5waXBlKFxuICAgICAgICBtYXAoXG4gICAgICAgICAgKG5vdGlmaWNhdGlvbjogTm90aWZpY2F0aW9uPEFjdGlvbj4pOiBFZmZlY3ROb3RpZmljYXRpb24gPT4gKHtcbiAgICAgICAgICAgIGVmZmVjdDogc291cmNlSW5zdGFuY2VbcHJvcGVydHlOYW1lXSxcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbixcbiAgICAgICAgICAgIHByb3BlcnR5TmFtZSxcbiAgICAgICAgICAgIHNvdXJjZU5hbWUsXG4gICAgICAgICAgICBzb3VyY2VJbnN0YW5jZSxcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgKTtcblxuICByZXR1cm4gbWVyZ2UoLi4ub2JzZXJ2YWJsZXMkKTtcbn1cbiJdfQ==