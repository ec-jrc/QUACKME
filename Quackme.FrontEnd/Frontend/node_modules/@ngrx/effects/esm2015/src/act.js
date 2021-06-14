/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/act.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { defer, merge, Notification, Subject, } from 'rxjs';
import { concatMap, dematerialize, filter, finalize, map, materialize, } from 'rxjs/operators';
/**
 * Represents config with named paratemeters for act
 * @record
 * @template Input, OutputAction, ErrorAction, CompleteAction, UnsubscribeAction
 */
export function ActConfig() { }
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
export function act(
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9lZmZlY3RzL3NyYy9hY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxPQUFPLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTCxZQUFZLEVBR1osT0FBTyxHQUNSLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUNMLFNBQVMsRUFDVCxhQUFhLEVBQ2IsTUFBTSxFQUNOLFFBQVEsRUFDUixHQUFHLEVBQ0gsV0FBVyxHQUNaLE1BQU0sZ0JBQWdCLENBQUM7Ozs7OztBQUd4QiwrQkF5QkM7OztJQWpCQyw0QkFBbUU7O0lBSW5FLDBCQUFpRDs7SUFJakQsNkJBQTJEOztJQUUzRCw2QkFFMkM7O0lBSTNDLGdDQUFpRTs7Ozs7Ozs7QUFtQ25FLE1BQU0sVUFBVSxHQUFHO0FBT2pCLG9FQUFvRTtBQUNwRSxlQVErRCxFQUMvRCxPQUFtRDtVQU03QyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsR0FDdkQsT0FBTyxlQUFlLEtBQUssVUFBVTtRQUNuQyxDQUFDLENBQUM7WUFDRSxPQUFPLEVBQUUsZUFBZTtZQUN4QixLQUFLLEVBQUUsbUJBQUEsT0FBTyxFQUFDO1lBQ2YsUUFBUSxFQUFFLFNBQVM7WUFDbkIsUUFBUSxFQUFFLFNBQVM7WUFDbkIsV0FBVyxFQUFFLFNBQVM7U0FDdkI7UUFDSCxDQUFDLGlDQUFNLGVBQWUsS0FBRSxRQUFRLEVBQUUsZUFBZSxDQUFDLFFBQVEsSUFBSSxTQUFTLEdBQUU7SUFPN0U7Ozs7SUFBTyxNQUFNLENBQUMsRUFBRSxDQUNkLEtBQUs7OztJQUNILEdBQTZCLEVBQUU7O2NBQ3ZCLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBcUI7UUFDaEQsT0FBTyxLQUFLLENBQ1YsTUFBTSxDQUFDLElBQUksQ0FDVCxRQUFROzs7OztRQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQ3hCLEtBQUs7OztRQUFDLEdBQUcsRUFBRTs7Z0JBQ0wsU0FBUyxHQUFHLEtBQUs7O2dCQUNqQixPQUFPLEdBQUcsS0FBSzs7Z0JBQ2YsY0FBYyxHQUFHLENBQUM7WUFDdEIsT0FBTyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FDL0IsV0FBVyxFQUFFLEVBQ2IsR0FBRzs7OztZQUNELENBQUMsWUFBWSxFQUEwQyxFQUFFO2dCQUN2RCxRQUFRLFlBQVksQ0FBQyxJQUFJLEVBQUU7b0JBQ3pCLEtBQUssR0FBRzt3QkFDTixPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUNmLE9BQU8sSUFBSSxZQUFZLENBRXJCO3dCQURBLCtCQUErQjt3QkFDL0IsR0FBRyxFQUFPLEVBQ1YsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQ2pDLENBQUM7b0JBQ0osS0FBSyxHQUFHO3dCQUNOLFNBQVMsR0FBRyxJQUFJLENBQUM7d0JBQ2pCLE9BQU8sUUFBUTs0QkFDYixDQUFDLENBQUMsSUFBSSxZQUFZLENBRWQ7NEJBREEsK0JBQStCOzRCQUMvQixHQUFHLEVBQU8sRUFDVixRQUFRLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUNoQzs0QkFDSCxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUNoQjt3QkFDRSxFQUFFLGNBQWMsQ0FBQzt3QkFDakIsT0FBTyxZQUFZLENBQUM7aUJBQ3ZCO1lBQ0gsQ0FBQyxFQUNGLEVBQ0QsTUFBTTs7OztZQUFDLENBQUMsQ0FBQyxFQUE4QixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBQyxFQUNwRCxhQUFhLEVBQUUsRUFDZixRQUFROzs7WUFBQyxHQUFHLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUU7b0JBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNsRDtZQUNILENBQUMsRUFBQyxDQUNILENBQUM7UUFDSixDQUFDLEVBQUMsRUFDSCxDQUNGLEVBQ0QsT0FBTyxDQUNSLENBQUM7SUFDSixDQUFDLEVBQ0YsRUFBQztBQUNOLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQge1xuICBkZWZlcixcbiAgbWVyZ2UsXG4gIE5vdGlmaWNhdGlvbixcbiAgT2JzZXJ2YWJsZSxcbiAgT3BlcmF0b3JGdW5jdGlvbixcbiAgU3ViamVjdCxcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1xuICBjb25jYXRNYXAsXG4gIGRlbWF0ZXJpYWxpemUsXG4gIGZpbHRlcixcbiAgZmluYWxpemUsXG4gIG1hcCxcbiAgbWF0ZXJpYWxpemUsXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqIFJlcHJlc2VudHMgY29uZmlnIHdpdGggbmFtZWQgcGFyYXRlbWV0ZXJzIGZvciBhY3QgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0Q29uZmlnPFxuICBJbnB1dCxcbiAgT3V0cHV0QWN0aW9uIGV4dGVuZHMgQWN0aW9uLFxuICBFcnJvckFjdGlvbiBleHRlbmRzIEFjdGlvbixcbiAgQ29tcGxldGVBY3Rpb24gZXh0ZW5kcyBBY3Rpb24sXG4gIFVuc3Vic2NyaWJlQWN0aW9uIGV4dGVuZHMgQWN0aW9uXG4+IHtcbiAgLy8gUHJvamVjdCBmdW5jdGlvbiB0aGF0IHByb2R1Y2VzIHRoZSBvdXRwdXQgYWN0aW9ucyBpbiBzdWNjZXNzIGNhc2VzXG4gIHByb2plY3Q6IChpbnB1dDogSW5wdXQsIGluZGV4OiBudW1iZXIpID0+IE9ic2VydmFibGU8T3V0cHV0QWN0aW9uPjtcbiAgLy8gRXJyb3IgaGFuZGxlIGZ1bmN0aW9uIGZvciBwcm9qZWN0XG4gIC8vIGVycm9yIHRoYXQgaGFwcGVuZWQgZHVyaW5nIHByb2plY3QgZXhlY3V0aW9uXG4gIC8vIGlucHV0IHZhbHVlIHRoYXQgcHJvamVjdCBlcnJvcmVkIHdpdGhcbiAgZXJyb3I6IChlcnJvcjogYW55LCBpbnB1dDogSW5wdXQpID0+IEVycm9yQWN0aW9uO1xuICAvLyBPcHRpb25hbCBjb21wbGV0ZSBhY3Rpb24gcHJvdmlkZXJcbiAgLy8gY291bnQgaXMgdGhlIG51bWJlciBvZiBhY3Rpb25zIHByb2plY3QgZW1pdHRlZCBiZWZvcmUgY29tcGxldGlvblxuICAvLyBpbnB1dCB2YWx1ZSB0aGF0IHByb2plY3QgY29tcGxldGVkIHdpdGhcbiAgY29tcGxldGU/OiAoY291bnQ6IG51bWJlciwgaW5wdXQ6IElucHV0KSA9PiBDb21wbGV0ZUFjdGlvbjtcbiAgLy8gT3B0aW9uYWwgZmxhdHRlbmluZyBvcGVyYXRvclxuICBvcGVyYXRvcj86IDxJbnB1dCwgT3V0cHV0QWN0aW9uPihcbiAgICBwcm9qZWN0OiAoaW5wdXQ6IElucHV0LCBpbmRleDogbnVtYmVyKSA9PiBPYnNlcnZhYmxlPE91dHB1dEFjdGlvbj5cbiAgKSA9PiBPcGVyYXRvckZ1bmN0aW9uPElucHV0LCBPdXRwdXRBY3Rpb24+O1xuICAvLyBPcHRpb25hbCB1bnN1YnNjcmliZSBhY3Rpb24gcHJvdmlkZXJcbiAgLy8gY291bnQgaXMgdGhlIG51bWJlciBvZiBhY3Rpb25zIHByb2plY3QgZW1pdHRlZCBiZWZvcmUgdW5zdWJzY3JpYmluZ1xuICAvLyBpbnB1dCB2YWx1ZSB0aGF0IHdhcyB1bnN1YnNjcmliZWQgZnJvbVxuICB1bnN1YnNjcmliZT86IChjb3VudDogbnVtYmVyLCBpbnB1dDogSW5wdXQpID0+IFVuc3Vic2NyaWJlQWN0aW9uO1xufVxuXG4vKipcbiAqIFdyYXBzIHByb2plY3QgZm4gd2l0aCBlcnJvciBoYW5kbGluZyBtYWtpbmcgaXQgc2FmZSB0byB1c2UgaW4gRWZmZWN0cy5cbiAqIFRha2VzIGVpdGhlciBjb25maWcgd2l0aCBuYW1lZCBwcm9wZXJ0aWVzIHRoYXQgcmVwcmVzZW50IGRpZmZlcmVudCBwb3NzaWJsZVxuICogY2FsbGJhY2tzIG9yIHByb2plY3QvZXJyb3IgY2FsbGJhY2tzIHRoYXQgYXJlIHJlcXVpcmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWN0PFxuICBJbnB1dCxcbiAgT3V0cHV0QWN0aW9uIGV4dGVuZHMgQWN0aW9uLFxuICBFcnJvckFjdGlvbiBleHRlbmRzIEFjdGlvblxuPihcbiAgcHJvamVjdDogKGlucHV0OiBJbnB1dCwgaW5kZXg6IG51bWJlcikgPT4gT2JzZXJ2YWJsZTxPdXRwdXRBY3Rpb24+LFxuICBlcnJvcjogKGVycm9yOiBhbnksIGlucHV0OiBJbnB1dCkgPT4gRXJyb3JBY3Rpb25cbik6IChzb3VyY2U6IE9ic2VydmFibGU8SW5wdXQ+KSA9PiBPYnNlcnZhYmxlPE91dHB1dEFjdGlvbiB8IEVycm9yQWN0aW9uPjtcbmV4cG9ydCBmdW5jdGlvbiBhY3Q8XG4gIElucHV0LFxuICBPdXRwdXRBY3Rpb24gZXh0ZW5kcyBBY3Rpb24sXG4gIEVycm9yQWN0aW9uIGV4dGVuZHMgQWN0aW9uLFxuICBDb21wbGV0ZUFjdGlvbiBleHRlbmRzIEFjdGlvbiA9IG5ldmVyLFxuICBVbnN1YnNjcmliZUFjdGlvbiBleHRlbmRzIEFjdGlvbiA9IG5ldmVyXG4+KFxuICBjb25maWc6IEFjdENvbmZpZzxcbiAgICBJbnB1dCxcbiAgICBPdXRwdXRBY3Rpb24sXG4gICAgRXJyb3JBY3Rpb24sXG4gICAgQ29tcGxldGVBY3Rpb24sXG4gICAgVW5zdWJzY3JpYmVBY3Rpb25cbiAgPlxuKTogKFxuICBzb3VyY2U6IE9ic2VydmFibGU8SW5wdXQ+XG4pID0+IE9ic2VydmFibGU8XG4gIE91dHB1dEFjdGlvbiB8IEVycm9yQWN0aW9uIHwgQ29tcGxldGVBY3Rpb24gfCBVbnN1YnNjcmliZUFjdGlvblxuPjtcbmV4cG9ydCBmdW5jdGlvbiBhY3Q8XG4gIElucHV0LFxuICBPdXRwdXRBY3Rpb24gZXh0ZW5kcyBBY3Rpb24sXG4gIEVycm9yQWN0aW9uIGV4dGVuZHMgQWN0aW9uLFxuICBDb21wbGV0ZUFjdGlvbiBleHRlbmRzIEFjdGlvbiA9IG5ldmVyLFxuICBVbnN1YnNjcmliZUFjdGlvbiBleHRlbmRzIEFjdGlvbiA9IG5ldmVyXG4+KFxuICAvKiogQWxsb3cgdG8gdGFrZSBlaXRoZXIgY29uZmlnIG9iamVjdCBvciBwcm9qZWN0L2Vycm9yIGZ1bmN0aW9ucyAqL1xuICBjb25maWdPclByb2plY3Q6XG4gICAgfCBBY3RDb25maWc8XG4gICAgICAgIElucHV0LFxuICAgICAgICBPdXRwdXRBY3Rpb24sXG4gICAgICAgIEVycm9yQWN0aW9uLFxuICAgICAgICBDb21wbGV0ZUFjdGlvbixcbiAgICAgICAgVW5zdWJzY3JpYmVBY3Rpb25cbiAgICAgID5cbiAgICB8ICgoaW5wdXQ6IElucHV0LCBpbmRleDogbnVtYmVyKSA9PiBPYnNlcnZhYmxlPE91dHB1dEFjdGlvbj4pLFxuICBlcnJvckZuPzogKGVycm9yOiBhbnksIGlucHV0OiBJbnB1dCkgPT4gRXJyb3JBY3Rpb25cbik6IChcbiAgc291cmNlOiBPYnNlcnZhYmxlPElucHV0PlxuKSA9PiBPYnNlcnZhYmxlPFxuICBPdXRwdXRBY3Rpb24gfCBFcnJvckFjdGlvbiB8IENvbXBsZXRlQWN0aW9uIHwgVW5zdWJzY3JpYmVBY3Rpb25cbj4ge1xuICBjb25zdCB7IHByb2plY3QsIGVycm9yLCBjb21wbGV0ZSwgb3BlcmF0b3IsIHVuc3Vic2NyaWJlIH0gPVxuICAgIHR5cGVvZiBjb25maWdPclByb2plY3QgPT09ICdmdW5jdGlvbidcbiAgICAgID8ge1xuICAgICAgICAgIHByb2plY3Q6IGNvbmZpZ09yUHJvamVjdCxcbiAgICAgICAgICBlcnJvcjogZXJyb3JGbiEsXG4gICAgICAgICAgb3BlcmF0b3I6IGNvbmNhdE1hcCxcbiAgICAgICAgICBjb21wbGV0ZTogdW5kZWZpbmVkLFxuICAgICAgICAgIHVuc3Vic2NyaWJlOiB1bmRlZmluZWQsXG4gICAgICAgIH1cbiAgICAgIDogeyAuLi5jb25maWdPclByb2plY3QsIG9wZXJhdG9yOiBjb25maWdPclByb2plY3Qub3BlcmF0b3IgfHwgY29uY2F0TWFwIH07XG5cbiAgdHlwZSBSZXN1bHRBY3Rpb24gPVxuICAgIHwgT3V0cHV0QWN0aW9uXG4gICAgfCBFcnJvckFjdGlvblxuICAgIHwgQ29tcGxldGVBY3Rpb25cbiAgICB8IFVuc3Vic2NyaWJlQWN0aW9uO1xuICByZXR1cm4gc291cmNlID0+XG4gICAgZGVmZXIoXG4gICAgICAoKTogT2JzZXJ2YWJsZTxSZXN1bHRBY3Rpb24+ID0+IHtcbiAgICAgICAgY29uc3Qgc3ViamVjdCA9IG5ldyBTdWJqZWN0PFVuc3Vic2NyaWJlQWN0aW9uPigpO1xuICAgICAgICByZXR1cm4gbWVyZ2UoXG4gICAgICAgICAgc291cmNlLnBpcGUoXG4gICAgICAgICAgICBvcGVyYXRvcigoaW5wdXQsIGluZGV4KSA9PlxuICAgICAgICAgICAgICBkZWZlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbXBsZXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxldCBlcnJvcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IHByb2plY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvamVjdChpbnB1dCwgaW5kZXgpLnBpcGUoXG4gICAgICAgICAgICAgICAgICBtYXRlcmlhbGl6ZSgpLFxuICAgICAgICAgICAgICAgICAgbWFwKFxuICAgICAgICAgICAgICAgICAgICAobm90aWZpY2F0aW9uKTogTm90aWZpY2F0aW9uPFJlc3VsdEFjdGlvbj4gfCB1bmRlZmluZWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAobm90aWZpY2F0aW9uLmtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogcmVtb3ZlIGFueSBpbiBSeEpTIDYuNVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOJyBhcyBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Iobm90aWZpY2F0aW9uLmVycm9yLCBpbnB1dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0MnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IHJlbW92ZSBhbnkgaW4gUnhKUyA2LjVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ04nIGFzIGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGUocHJvamVjdGVkQ291bnQsIGlucHV0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKytwcm9qZWN0ZWRDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdGlmaWNhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICBmaWx0ZXIoKG4pOiBuIGlzIE5vbk51bGxhYmxlPHR5cGVvZiBuPiA9PiBuICE9IG51bGwpLFxuICAgICAgICAgICAgICAgICAgZGVtYXRlcmlhbGl6ZSgpLFxuICAgICAgICAgICAgICAgICAgZmluYWxpemUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbXBsZXRlZCAmJiAhZXJyb3JlZCAmJiB1bnN1YnNjcmliZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHN1YmplY3QubmV4dCh1bnN1YnNjcmliZShwcm9qZWN0ZWRDb3VudCwgaW5wdXQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksXG4gICAgICAgICAgc3ViamVjdFxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG59XG4iXX0=