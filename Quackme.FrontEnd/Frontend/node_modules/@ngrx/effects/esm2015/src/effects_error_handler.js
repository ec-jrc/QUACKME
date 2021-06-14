/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_error_handler.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { catchError } from 'rxjs/operators';
/** @type {?} */
const MAX_NUMBER_OF_RETRY_ATTEMPTS = 10;
/**
 * @template T
 * @param {?} observable$
 * @param {?} errorHandler
 * @param {?=} retryAttemptLeft
 * @return {?}
 */
export function defaultEffectsErrorHandler(observable$, errorHandler, retryAttemptLeft = MAX_NUMBER_OF_RETRY_ATTEMPTS) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19lcnJvcl9oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9lZmZlY3RzL3NyYy9lZmZlY3RzX2Vycm9yX2hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O01BT3RDLDRCQUE0QixHQUFHLEVBQUU7Ozs7Ozs7O0FBRXZDLE1BQU0sVUFBVSwwQkFBMEIsQ0FDeEMsV0FBMEIsRUFDMUIsWUFBMEIsRUFDMUIsbUJBQTJCLDRCQUE0QjtJQUV2RCxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQ3JCLFVBQVU7Ozs7SUFBQyxLQUFLLENBQUMsRUFBRTtRQUNqQixJQUFJLFlBQVk7WUFBRSxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELElBQUksZ0JBQWdCLElBQUksQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sV0FBVyxDQUFDLENBQUMsZUFBZTtTQUNwQztRQUNELHlEQUF5RDtRQUN6RCxPQUFPLDBCQUEwQixDQUMvQixXQUFXLEVBQ1gsWUFBWSxFQUNaLGdCQUFnQixHQUFHLENBQUMsQ0FDckIsQ0FBQztJQUNKLENBQUMsRUFBQyxDQUNILENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXJyb3JIYW5kbGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5leHBvcnQgdHlwZSBFZmZlY3RzRXJyb3JIYW5kbGVyID0gPFQgZXh0ZW5kcyBBY3Rpb24+KFxuICBvYnNlcnZhYmxlJDogT2JzZXJ2YWJsZTxUPixcbiAgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXJcbikgPT4gT2JzZXJ2YWJsZTxUPjtcblxuY29uc3QgTUFYX05VTUJFUl9PRl9SRVRSWV9BVFRFTVBUUyA9IDEwO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdEVmZmVjdHNFcnJvckhhbmRsZXI8VCBleHRlbmRzIEFjdGlvbj4oXG4gIG9ic2VydmFibGUkOiBPYnNlcnZhYmxlPFQ+LFxuICBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgcmV0cnlBdHRlbXB0TGVmdDogbnVtYmVyID0gTUFYX05VTUJFUl9PRl9SRVRSWV9BVFRFTVBUU1xuKTogT2JzZXJ2YWJsZTxUPiB7XG4gIHJldHVybiBvYnNlcnZhYmxlJC5waXBlKFxuICAgIGNhdGNoRXJyb3IoZXJyb3IgPT4ge1xuICAgICAgaWYgKGVycm9ySGFuZGxlcikgZXJyb3JIYW5kbGVyLmhhbmRsZUVycm9yKGVycm9yKTtcbiAgICAgIGlmIChyZXRyeUF0dGVtcHRMZWZ0IDw9IDEpIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUkOyAvLyBsYXN0IGF0dGVtcHRcbiAgICAgIH1cbiAgICAgIC8vIFJldHVybiBvYnNlcnZhYmxlIHRoYXQgcHJvZHVjZXMgdGhpcyBwYXJ0aWN1bGFyIGVmZmVjdFxuICAgICAgcmV0dXJuIGRlZmF1bHRFZmZlY3RzRXJyb3JIYW5kbGVyKFxuICAgICAgICBvYnNlcnZhYmxlJCxcbiAgICAgICAgZXJyb3JIYW5kbGVyLFxuICAgICAgICByZXRyeUF0dGVtcHRMZWZ0IC0gMVxuICAgICAgKTtcbiAgICB9KVxuICApO1xufVxuIl19