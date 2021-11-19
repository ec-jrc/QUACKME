/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_sources.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { dematerialize, exhaustMap, filter, groupBy, map, mergeMap, take, } from 'rxjs/operators';
import { reportInvalidActions, } from './effect_notification';
import { mergeEffects } from './effects_resolver';
import { isOnIdentifyEffects, isOnRunEffects, isOnInitEffects, } from './lifecycle_hooks';
import { EFFECTS_ERROR_HANDLER } from './tokens';
import { getSourceForInstance } from './utils';
export class EffectSources extends Subject {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X3NvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdF9zb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpFLE9BQU8sRUFBNEIsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNoRSxPQUFPLEVBQ0wsYUFBYSxFQUNiLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLEdBQUcsRUFDSCxRQUFRLEVBQ1IsSUFBSSxHQUNMLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUNMLG9CQUFvQixHQUVyQixNQUFNLHVCQUF1QixDQUFDO0FBRS9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEVBS0wsbUJBQW1CLEVBQ25CLGNBQWMsRUFDZCxlQUFlLEdBQ2hCLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2pELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUcvQyxNQUFNLE9BQU8sYUFBYyxTQUFRLE9BQVk7Ozs7O0lBQzdDLFlBQ1UsWUFBMEIsRUFFMUIsbUJBQXdDO1FBRWhELEtBQUssRUFBRSxDQUFDO1FBSkEsaUJBQVksR0FBWixZQUFZLENBQWM7UUFFMUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtJQUdsRCxDQUFDOzs7OztJQUVELFVBQVUsQ0FBQyxvQkFBeUI7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Ozs7O0lBS0QsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FDZCxPQUFPLENBQUMsb0JBQW9CLENBQUMsRUFDN0IsUUFBUTs7OztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2pCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDLEVBQUMsRUFDRixRQUFROzs7O1FBQUMsT0FBTyxDQUFDLEVBQUU7O2tCQUNYLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUMxQixVQUFVOzs7O1lBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sbUJBQW1CLENBQ3hCLElBQUksQ0FBQyxZQUFZLEVBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FDekIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwQixDQUFDLEVBQUMsRUFDRixHQUFHOzs7O1lBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ1gsb0JBQW9CLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDaEQsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDO1lBQzdCLENBQUMsRUFBQyxFQUNGLE1BQU07Ozs7WUFDSixDQUFDLFlBQVksRUFBd0MsRUFBRSxDQUNyRCxZQUFZLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFDNUIsRUFDRCxhQUFhLEVBQUUsQ0FDaEI7Ozs7a0JBSUssS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQ3hCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDUCxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQ3ZCLEdBQUc7Ozs7WUFBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFDLENBQzlDO1lBRUQsT0FBTyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9CLENBQUMsRUFBQyxDQUNILENBQUM7SUFDSixDQUFDOzs7WUFyREYsVUFBVTs7OztZQS9CRixZQUFZOzRDQW1DaEIsTUFBTSxTQUFDLHFCQUFxQjs7Ozs7OztJQUQ3QixxQ0FBa0M7Ozs7O0lBQ2xDLDRDQUNnRDs7Ozs7O0FBbURwRCxTQUFTLGVBQWUsQ0FBQyxjQUFtQjtJQUMxQyxJQUFJLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxFQUFFO1FBQ3ZDLE9BQU8sY0FBYyxDQUFDLHFCQUFxQixFQUFFLENBQUM7S0FDL0M7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7Ozs7OztBQUVELFNBQVMsbUJBQW1CLENBQzFCLFlBQTBCLEVBQzFCLG1CQUF3QztJQUV4Qzs7OztJQUFPLGNBQWMsQ0FBQyxFQUFFOztjQUNoQixjQUFjLEdBQUcsWUFBWSxDQUNqQyxjQUFjLEVBQ2QsWUFBWSxFQUNaLG1CQUFtQixDQUNwQjtRQUVELElBQUksY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sY0FBYyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3hEO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQyxFQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVycm9ySGFuZGxlciwgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBOb3RpZmljYXRpb24sIE9ic2VydmFibGUsIFN1YmplY3QsIG1lcmdlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBkZW1hdGVyaWFsaXplLFxuICBleGhhdXN0TWFwLFxuICBmaWx0ZXIsXG4gIGdyb3VwQnksXG4gIG1hcCxcbiAgbWVyZ2VNYXAsXG4gIHRha2UsXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtcbiAgcmVwb3J0SW52YWxpZEFjdGlvbnMsXG4gIEVmZmVjdE5vdGlmaWNhdGlvbixcbn0gZnJvbSAnLi9lZmZlY3Rfbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IEVmZmVjdHNFcnJvckhhbmRsZXIgfSBmcm9tICcuL2VmZmVjdHNfZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQgeyBtZXJnZUVmZmVjdHMgfSBmcm9tICcuL2VmZmVjdHNfcmVzb2x2ZXInO1xuaW1wb3J0IHtcbiAgb25JZGVudGlmeUVmZmVjdHNLZXksXG4gIG9uUnVuRWZmZWN0c0tleSxcbiAgT25SdW5FZmZlY3RzLFxuICBvbkluaXRFZmZlY3RzLFxuICBpc09uSWRlbnRpZnlFZmZlY3RzLFxuICBpc09uUnVuRWZmZWN0cyxcbiAgaXNPbkluaXRFZmZlY3RzLFxufSBmcm9tICcuL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQgeyBFRkZFQ1RTX0VSUk9SX0hBTkRMRVIgfSBmcm9tICcuL3Rva2Vucyc7XG5pbXBvcnQgeyBnZXRTb3VyY2VGb3JJbnN0YW5jZSB9IGZyb20gJy4vdXRpbHMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWZmZWN0U291cmNlcyBleHRlbmRzIFN1YmplY3Q8YW55PiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXIsXG4gICAgQEluamVjdChFRkZFQ1RTX0VSUk9SX0hBTkRMRVIpXG4gICAgcHJpdmF0ZSBlZmZlY3RzRXJyb3JIYW5kbGVyOiBFZmZlY3RzRXJyb3JIYW5kbGVyXG4gICkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhZGRFZmZlY3RzKGVmZmVjdFNvdXJjZUluc3RhbmNlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm5leHQoZWZmZWN0U291cmNlSW5zdGFuY2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgdG9BY3Rpb25zKCk6IE9ic2VydmFibGU8QWN0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMucGlwZShcbiAgICAgIGdyb3VwQnkoZ2V0U291cmNlRm9ySW5zdGFuY2UpLFxuICAgICAgbWVyZ2VNYXAoc291cmNlJCA9PiB7XG4gICAgICAgIHJldHVybiBzb3VyY2UkLnBpcGUoZ3JvdXBCeShlZmZlY3RzSW5zdGFuY2UpKTtcbiAgICAgIH0pLFxuICAgICAgbWVyZ2VNYXAoc291cmNlJCA9PiB7XG4gICAgICAgIGNvbnN0IGVmZmVjdCQgPSBzb3VyY2UkLnBpcGUoXG4gICAgICAgICAgZXhoYXVzdE1hcChzb3VyY2VJbnN0YW5jZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUVmZmVjdFNvdXJjZShcbiAgICAgICAgICAgICAgdGhpcy5lcnJvckhhbmRsZXIsXG4gICAgICAgICAgICAgIHRoaXMuZWZmZWN0c0Vycm9ySGFuZGxlclxuICAgICAgICAgICAgKShzb3VyY2VJbnN0YW5jZSk7XG4gICAgICAgICAgfSksXG4gICAgICAgICAgbWFwKG91dHB1dCA9PiB7XG4gICAgICAgICAgICByZXBvcnRJbnZhbGlkQWN0aW9ucyhvdXRwdXQsIHRoaXMuZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQubm90aWZpY2F0aW9uO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGZpbHRlcihcbiAgICAgICAgICAgIChub3RpZmljYXRpb24pOiBub3RpZmljYXRpb24gaXMgTm90aWZpY2F0aW9uPEFjdGlvbj4gPT5cbiAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmtpbmQgPT09ICdOJ1xuICAgICAgICAgICksXG4gICAgICAgICAgZGVtYXRlcmlhbGl6ZSgpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gc3RhcnQgdGhlIHN0cmVhbSB3aXRoIGFuIElOSVQgYWN0aW9uXG4gICAgICAgIC8vIGRvIHRoaXMgb25seSBmb3IgdGhlIGZpcnN0IEVmZmVjdCBpbnN0YW5jZVxuICAgICAgICBjb25zdCBpbml0JCA9IHNvdXJjZSQucGlwZShcbiAgICAgICAgICB0YWtlKDEpLFxuICAgICAgICAgIGZpbHRlcihpc09uSW5pdEVmZmVjdHMpLFxuICAgICAgICAgIG1hcChpbnN0YW5jZSA9PiBpbnN0YW5jZS5uZ3J4T25Jbml0RWZmZWN0cygpKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBtZXJnZShlZmZlY3QkLCBpbml0JCk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZWZmZWN0c0luc3RhbmNlKHNvdXJjZUluc3RhbmNlOiBhbnkpIHtcbiAgaWYgKGlzT25JZGVudGlmeUVmZmVjdHMoc291cmNlSW5zdGFuY2UpKSB7XG4gICAgcmV0dXJuIHNvdXJjZUluc3RhbmNlLm5ncnhPbklkZW50aWZ5RWZmZWN0cygpO1xuICB9XG5cbiAgcmV0dXJuICcnO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRWZmZWN0U291cmNlKFxuICBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgZWZmZWN0c0Vycm9ySGFuZGxlcjogRWZmZWN0c0Vycm9ySGFuZGxlclxuKTogKHNvdXJjZUluc3RhbmNlOiBhbnkpID0+IE9ic2VydmFibGU8RWZmZWN0Tm90aWZpY2F0aW9uPiB7XG4gIHJldHVybiBzb3VyY2VJbnN0YW5jZSA9PiB7XG4gICAgY29uc3QgbWVyZ2VkRWZmZWN0cyQgPSBtZXJnZUVmZmVjdHMoXG4gICAgICBzb3VyY2VJbnN0YW5jZSxcbiAgICAgIGVycm9ySGFuZGxlcixcbiAgICAgIGVmZmVjdHNFcnJvckhhbmRsZXJcbiAgICApO1xuXG4gICAgaWYgKGlzT25SdW5FZmZlY3RzKHNvdXJjZUluc3RhbmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZUluc3RhbmNlLm5ncnhPblJ1bkVmZmVjdHMobWVyZ2VkRWZmZWN0cyQpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZWRFZmZlY3RzJDtcbiAgfTtcbn1cbiJdfQ==