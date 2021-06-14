import { __decorate, __read, __spread, __values } from "tslib";
import { Injector, NgModule, Optional, SkipSelf, } from '@angular/core';
import { Actions } from './actions';
import { EffectSources } from './effect_sources';
import { EffectsFeatureModule } from './effects_feature_module';
import { defaultEffectsErrorHandler } from './effects_error_handler';
import { EffectsRootModule } from './effects_root_module';
import { EffectsRunner } from './effects_runner';
import { _FEATURE_EFFECTS, _ROOT_EFFECTS, _ROOT_EFFECTS_GUARD, EFFECTS_ERROR_HANDLER, FEATURE_EFFECTS, ROOT_EFFECTS, USER_PROVIDED_EFFECTS, } from './tokens';
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
                    deps: [Injector, _FEATURE_EFFECTS, USER_PROVIDED_EFFECTS],
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
    };
    EffectsModule = __decorate([
        NgModule({})
    ], EffectsModule);
    return EffectsModule;
}());
export { EffectsModule };
export function createEffects(injector, effectGroups, userProvidedEffectGroups) {
    var e_1, _a, e_2, _b;
    var mergedEffects = [];
    try {
        for (var effectGroups_1 = __values(effectGroups), effectGroups_1_1 = effectGroups_1.next(); !effectGroups_1_1.done; effectGroups_1_1 = effectGroups_1.next()) {
            var effectGroup = effectGroups_1_1.value;
            mergedEffects.push.apply(mergedEffects, __spread(effectGroup));
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
        for (var userProvidedEffectGroups_1 = __values(userProvidedEffectGroups), userProvidedEffectGroups_1_1 = userProvidedEffectGroups_1.next(); !userProvidedEffectGroups_1_1.done; userProvidedEffectGroups_1_1 = userProvidedEffectGroups_1.next()) {
            var userProvidedEffectGroup = userProvidedEffectGroups_1_1.value;
            mergedEffects.push.apply(mergedEffects, __spread(userProvidedEffectGroup));
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
export function createEffectInstances(injector, effects) {
    return effects.map(function (effect) { return injector.get(effect); });
}
export function _provideForRootGuard(runner) {
    if (runner) {
        throw new TypeError("EffectsModule.forRoot() called twice. Feature modules should use EffectsModule.forFeature() instead.");
    }
    return 'guarded';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdHNfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsUUFBUSxFQUVSLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxHQUVULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLGVBQWUsRUFDZixZQUFZLEVBQ1oscUJBQXFCLEdBQ3RCLE1BQU0sVUFBVSxDQUFDO0FBR2xCO0lBQUE7SUFnRUEsQ0FBQztJQS9EUSx3QkFBVSxHQUFqQixVQUNFLGNBQWdDO1FBQWhDLCtCQUFBLEVBQUEsbUJBQWdDO1FBRWhDLE9BQU87WUFDTCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFNBQVMsRUFBRTtnQkFDVCxjQUFjO2dCQUNkO29CQUNFLE9BQU8sRUFBRSxnQkFBZ0I7b0JBQ3pCLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxjQUFjO2lCQUN6QjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUscUJBQXFCO29CQUM5QixLQUFLLEVBQUUsSUFBSTtvQkFDWCxRQUFRLEVBQUUsRUFBRTtpQkFDYjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZUFBZTtvQkFDeEIsS0FBSyxFQUFFLElBQUk7b0JBQ1gsVUFBVSxFQUFFLGFBQWE7b0JBQ3pCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxxQkFBcUIsQ0FBQztpQkFDMUQ7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO0lBRU0scUJBQU8sR0FBZCxVQUNFLFdBQTZCO1FBQTdCLDRCQUFBLEVBQUEsZ0JBQTZCO1FBRTdCLE9BQU87WUFDTCxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUsbUJBQW1CO29CQUM1QixVQUFVLEVBQUUsb0JBQW9CO29CQUNoQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztpQkFDeEQ7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLHFCQUFxQjtvQkFDOUIsUUFBUSxFQUFFLDBCQUEwQjtpQkFDckM7Z0JBQ0QsYUFBYTtnQkFDYixhQUFhO2dCQUNiLE9BQU87Z0JBQ1AsV0FBVztnQkFDWDtvQkFDRSxPQUFPLEVBQUUsYUFBYTtvQkFDdEIsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDO2lCQUN4QjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUscUJBQXFCO29CQUM5QixLQUFLLEVBQUUsSUFBSTtvQkFDWCxRQUFRLEVBQUUsRUFBRTtpQkFDYjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsWUFBWTtvQkFDckIsVUFBVSxFQUFFLGFBQWE7b0JBQ3pCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUscUJBQXFCLENBQUM7aUJBQ3ZEO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztJQS9EVSxhQUFhO1FBRHpCLFFBQVEsQ0FBQyxFQUFFLENBQUM7T0FDQSxhQUFhLENBZ0V6QjtJQUFELG9CQUFDO0NBQUEsQUFoRUQsSUFnRUM7U0FoRVksYUFBYTtBQWtFMUIsTUFBTSxVQUFVLGFBQWEsQ0FDM0IsUUFBa0IsRUFDbEIsWUFBMkIsRUFDM0Isd0JBQXVDOztJQUV2QyxJQUFNLGFBQWEsR0FBZ0IsRUFBRSxDQUFDOztRQUV0QyxLQUF3QixJQUFBLGlCQUFBLFNBQUEsWUFBWSxDQUFBLDBDQUFBLG9FQUFFO1lBQWpDLElBQUksV0FBVyx5QkFBQTtZQUNsQixhQUFhLENBQUMsSUFBSSxPQUFsQixhQUFhLFdBQVMsV0FBVyxHQUFFO1NBQ3BDOzs7Ozs7Ozs7O1FBRUQsS0FBb0MsSUFBQSw2QkFBQSxTQUFBLHdCQUF3QixDQUFBLGtFQUFBLHdHQUFFO1lBQXpELElBQUksdUJBQXVCLHFDQUFBO1lBQzlCLGFBQWEsQ0FBQyxJQUFJLE9BQWxCLGFBQWEsV0FBUyx1QkFBdUIsR0FBRTtTQUNoRDs7Ozs7Ozs7O0lBRUQsT0FBTyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQUVELE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsUUFBa0IsRUFDbEIsT0FBb0I7SUFFcEIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsTUFBcUI7SUFDeEQsSUFBSSxNQUFNLEVBQUU7UUFDVixNQUFNLElBQUksU0FBUyxDQUNqQixzR0FBc0csQ0FDdkcsQ0FBQztLQUNIO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEluamVjdG9yLFxuICBNb2R1bGVXaXRoUHJvdmlkZXJzLFxuICBOZ01vZHVsZSxcbiAgT3B0aW9uYWwsXG4gIFNraXBTZWxmLFxuICBUeXBlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGlvbnMgfSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHsgRWZmZWN0U291cmNlcyB9IGZyb20gJy4vZWZmZWN0X3NvdXJjZXMnO1xuaW1wb3J0IHsgRWZmZWN0c0ZlYXR1cmVNb2R1bGUgfSBmcm9tICcuL2VmZmVjdHNfZmVhdHVyZV9tb2R1bGUnO1xuaW1wb3J0IHsgZGVmYXVsdEVmZmVjdHNFcnJvckhhbmRsZXIgfSBmcm9tICcuL2VmZmVjdHNfZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQgeyBFZmZlY3RzUm9vdE1vZHVsZSB9IGZyb20gJy4vZWZmZWN0c19yb290X21vZHVsZSc7XG5pbXBvcnQgeyBFZmZlY3RzUnVubmVyIH0gZnJvbSAnLi9lZmZlY3RzX3J1bm5lcic7XG5pbXBvcnQge1xuICBfRkVBVFVSRV9FRkZFQ1RTLFxuICBfUk9PVF9FRkZFQ1RTLFxuICBfUk9PVF9FRkZFQ1RTX0dVQVJELFxuICBFRkZFQ1RTX0VSUk9SX0hBTkRMRVIsXG4gIEZFQVRVUkVfRUZGRUNUUyxcbiAgUk9PVF9FRkZFQ1RTLFxuICBVU0VSX1BST1ZJREVEX0VGRkVDVFMsXG59IGZyb20gJy4vdG9rZW5zJztcblxuQE5nTW9kdWxlKHt9KVxuZXhwb3J0IGNsYXNzIEVmZmVjdHNNb2R1bGUge1xuICBzdGF0aWMgZm9yRmVhdHVyZShcbiAgICBmZWF0dXJlRWZmZWN0czogVHlwZTxhbnk+W10gPSBbXVxuICApOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEVmZmVjdHNGZWF0dXJlTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBFZmZlY3RzRmVhdHVyZU1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICBmZWF0dXJlRWZmZWN0cyxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IF9GRUFUVVJFX0VGRkVDVFMsXG4gICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgdXNlVmFsdWU6IGZlYXR1cmVFZmZlY3RzLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogVVNFUl9QUk9WSURFRF9FRkZFQ1RTLFxuICAgICAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgICAgIHVzZVZhbHVlOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEZFQVRVUkVfRUZGRUNUUyxcbiAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICB1c2VGYWN0b3J5OiBjcmVhdGVFZmZlY3RzLFxuICAgICAgICAgIGRlcHM6IFtJbmplY3RvciwgX0ZFQVRVUkVfRUZGRUNUUywgVVNFUl9QUk9WSURFRF9FRkZFQ1RTXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBmb3JSb290KFxuICAgIHJvb3RFZmZlY3RzOiBUeXBlPGFueT5bXSA9IFtdXG4gICk6IE1vZHVsZVdpdGhQcm92aWRlcnM8RWZmZWN0c1Jvb3RNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IEVmZmVjdHNSb290TW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBfUk9PVF9FRkZFQ1RTX0dVQVJELFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IF9wcm92aWRlRm9yUm9vdEd1YXJkLFxuICAgICAgICAgIGRlcHM6IFtbRWZmZWN0c1J1bm5lciwgbmV3IE9wdGlvbmFsKCksIG5ldyBTa2lwU2VsZigpXV0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBFRkZFQ1RTX0VSUk9SX0hBTkRMRVIsXG4gICAgICAgICAgdXNlVmFsdWU6IGRlZmF1bHRFZmZlY3RzRXJyb3JIYW5kbGVyLFxuICAgICAgICB9LFxuICAgICAgICBFZmZlY3RzUnVubmVyLFxuICAgICAgICBFZmZlY3RTb3VyY2VzLFxuICAgICAgICBBY3Rpb25zLFxuICAgICAgICByb290RWZmZWN0cyxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IF9ST09UX0VGRkVDVFMsXG4gICAgICAgICAgdXNlVmFsdWU6IFtyb290RWZmZWN0c10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBVU0VSX1BST1ZJREVEX0VGRkVDVFMsXG4gICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgdXNlVmFsdWU6IFtdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogUk9PVF9FRkZFQ1RTLFxuICAgICAgICAgIHVzZUZhY3Rvcnk6IGNyZWF0ZUVmZmVjdHMsXG4gICAgICAgICAgZGVwczogW0luamVjdG9yLCBfUk9PVF9FRkZFQ1RTLCBVU0VSX1BST1ZJREVEX0VGRkVDVFNdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFZmZlY3RzKFxuICBpbmplY3RvcjogSW5qZWN0b3IsXG4gIGVmZmVjdEdyb3VwczogVHlwZTxhbnk+W11bXSxcbiAgdXNlclByb3ZpZGVkRWZmZWN0R3JvdXBzOiBUeXBlPGFueT5bXVtdXG4pOiBhbnlbXSB7XG4gIGNvbnN0IG1lcmdlZEVmZmVjdHM6IFR5cGU8YW55PltdID0gW107XG5cbiAgZm9yIChsZXQgZWZmZWN0R3JvdXAgb2YgZWZmZWN0R3JvdXBzKSB7XG4gICAgbWVyZ2VkRWZmZWN0cy5wdXNoKC4uLmVmZmVjdEdyb3VwKTtcbiAgfVxuXG4gIGZvciAobGV0IHVzZXJQcm92aWRlZEVmZmVjdEdyb3VwIG9mIHVzZXJQcm92aWRlZEVmZmVjdEdyb3Vwcykge1xuICAgIG1lcmdlZEVmZmVjdHMucHVzaCguLi51c2VyUHJvdmlkZWRFZmZlY3RHcm91cCk7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlRWZmZWN0SW5zdGFuY2VzKGluamVjdG9yLCBtZXJnZWRFZmZlY3RzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVmZmVjdEluc3RhbmNlcyhcbiAgaW5qZWN0b3I6IEluamVjdG9yLFxuICBlZmZlY3RzOiBUeXBlPGFueT5bXVxuKTogYW55W10ge1xuICByZXR1cm4gZWZmZWN0cy5tYXAoZWZmZWN0ID0+IGluamVjdG9yLmdldChlZmZlY3QpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9wcm92aWRlRm9yUm9vdEd1YXJkKHJ1bm5lcjogRWZmZWN0c1J1bm5lcik6IGFueSB7XG4gIGlmIChydW5uZXIpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgYEVmZmVjdHNNb2R1bGUuZm9yUm9vdCgpIGNhbGxlZCB0d2ljZS4gRmVhdHVyZSBtb2R1bGVzIHNob3VsZCB1c2UgRWZmZWN0c01vZHVsZS5mb3JGZWF0dXJlKCkgaW5zdGVhZC5gXG4gICAgKTtcbiAgfVxuICByZXR1cm4gJ2d1YXJkZWQnO1xufVxuIl19