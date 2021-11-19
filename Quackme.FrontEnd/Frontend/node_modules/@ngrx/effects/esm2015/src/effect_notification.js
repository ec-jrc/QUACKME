/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effect_notification.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
export function EffectNotification() { }
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
export function reportInvalidActions(output, reporter) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0X25vdGlmaWNhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0X25vdGlmaWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUlBLHdDQU1DOzs7SUFMQyxvQ0FBa0Q7O0lBQ2xELDBDQUEwQjs7SUFDMUIsd0NBQW1COztJQUNuQiw0Q0FBb0I7O0lBQ3BCLDBDQUFzRDs7Ozs7OztBQUd4RCxNQUFNLFVBQVUsb0JBQW9CLENBQ2xDLE1BQTBCLEVBQzFCLFFBQXNCO0lBRXRCLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFOztjQUM5QixNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLOztjQUNsQyxlQUFlLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRXpDLElBQUksZUFBZSxFQUFFO1lBQ25CLFFBQVEsQ0FBQyxXQUFXLENBQ2xCLElBQUksS0FBSyxDQUNQLFVBQVUsYUFBYSxDQUNyQixNQUFNLENBQ1Asa0NBQWtDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUN2RCxDQUNGLENBQUM7U0FDSDtLQUNGO0FBQ0gsQ0FBQzs7Ozs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxNQUFXO0lBQzNCLE9BQU8sQ0FDTCxPQUFPLE1BQU0sS0FBSyxVQUFVO1FBQzVCLE1BQU07UUFDTixNQUFNLENBQUMsSUFBSTtRQUNYLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLENBQ2hDLENBQUM7QUFDSixDQUFDOzs7OztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQ3JCLFlBQVksRUFDWixjQUFjLEVBQ2QsVUFBVSxHQUNTOztVQUNiLFFBQVEsR0FBRyxPQUFPLGNBQWMsQ0FBQyxZQUFZLENBQUMsS0FBSyxVQUFVO0lBRW5FLE9BQU8sSUFBSSxVQUFVLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUMxRSxDQUFDOzs7OztBQUVELFNBQVMsU0FBUyxDQUFDLE1BQWlDO0lBQ2xELElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDL0I7SUFBQyxXQUFNO1FBQ04sT0FBTyxNQUFNLENBQUM7S0FDZjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFcnJvckhhbmRsZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvbiwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVmZmVjdE5vdGlmaWNhdGlvbiB7XG4gIGVmZmVjdDogT2JzZXJ2YWJsZTxhbnk+IHwgKCgpID0+IE9ic2VydmFibGU8YW55Pik7XG4gIHByb3BlcnR5TmFtZTogUHJvcGVydHlLZXk7XG4gIHNvdXJjZU5hbWU6IHN0cmluZztcbiAgc291cmNlSW5zdGFuY2U6IGFueTtcbiAgbm90aWZpY2F0aW9uOiBOb3RpZmljYXRpb248QWN0aW9uIHwgbnVsbCB8IHVuZGVmaW5lZD47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBvcnRJbnZhbGlkQWN0aW9ucyhcbiAgb3V0cHV0OiBFZmZlY3ROb3RpZmljYXRpb24sXG4gIHJlcG9ydGVyOiBFcnJvckhhbmRsZXJcbikge1xuICBpZiAob3V0cHV0Lm5vdGlmaWNhdGlvbi5raW5kID09PSAnTicpIHtcbiAgICBjb25zdCBhY3Rpb24gPSBvdXRwdXQubm90aWZpY2F0aW9uLnZhbHVlO1xuICAgIGNvbnN0IGlzSW52YWxpZEFjdGlvbiA9ICFpc0FjdGlvbihhY3Rpb24pO1xuXG4gICAgaWYgKGlzSW52YWxpZEFjdGlvbikge1xuICAgICAgcmVwb3J0ZXIuaGFuZGxlRXJyb3IoXG4gICAgICAgIG5ldyBFcnJvcihcbiAgICAgICAgICBgRWZmZWN0ICR7Z2V0RWZmZWN0TmFtZShcbiAgICAgICAgICAgIG91dHB1dFxuICAgICAgICAgICl9IGRpc3BhdGNoZWQgYW4gaW52YWxpZCBhY3Rpb246ICR7c3RyaW5naWZ5KGFjdGlvbil9YFxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FjdGlvbihhY3Rpb246IGFueSk6IGFjdGlvbiBpcyBBY3Rpb24ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBhY3Rpb24gIT09ICdmdW5jdGlvbicgJiZcbiAgICBhY3Rpb24gJiZcbiAgICBhY3Rpb24udHlwZSAmJlxuICAgIHR5cGVvZiBhY3Rpb24udHlwZSA9PT0gJ3N0cmluZydcbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0RWZmZWN0TmFtZSh7XG4gIHByb3BlcnR5TmFtZSxcbiAgc291cmNlSW5zdGFuY2UsXG4gIHNvdXJjZU5hbWUsXG59OiBFZmZlY3ROb3RpZmljYXRpb24pIHtcbiAgY29uc3QgaXNNZXRob2QgPSB0eXBlb2Ygc291cmNlSW5zdGFuY2VbcHJvcGVydHlOYW1lXSA9PT0gJ2Z1bmN0aW9uJztcblxuICByZXR1cm4gYFwiJHtzb3VyY2VOYW1lfS4ke1N0cmluZyhwcm9wZXJ0eU5hbWUpfSR7aXNNZXRob2QgPyAnKCknIDogJyd9XCJgO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkoYWN0aW9uOiBBY3Rpb24gfCBudWxsIHwgdW5kZWZpbmVkKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFjdGlvbik7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBhY3Rpb247XG4gIH1cbn1cbiJdfQ==