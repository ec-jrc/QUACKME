/**
 * @fileoverview added by tsickle
 * Generated from: modules/effects/src/effects_feature_module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { NgModule, Inject, Optional } from '@angular/core';
import { StoreRootModule, StoreFeatureModule } from '@ngrx/store';
import { EffectsRootModule } from './effects_root_module';
import { FEATURE_EFFECTS } from './tokens';
export class EffectsFeatureModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19mZWF0dXJlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zcmMvZWZmZWN0c19mZWF0dXJlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHM0MsTUFBTSxPQUFPLG9CQUFvQjs7Ozs7OztJQUMvQixZQUNFLElBQXVCLEVBQ0Usa0JBQTJCLEVBQ3hDLGVBQWdDLEVBQ2hDLGtCQUFzQztRQUVsRCxrQkFBa0IsQ0FBQyxPQUFPOzs7O1FBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDakMsS0FBSyxDQUFDLE9BQU87Ozs7UUFBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsRUFDdEMsRUFDRixDQUFDO0lBQ0osQ0FBQzs7O1lBYkYsUUFBUSxTQUFDLEVBQUU7Ozs7WUFISCxpQkFBaUI7d0NBT3JCLE1BQU0sU0FBQyxlQUFlO1lBUmxCLGVBQWUsdUJBU25CLFFBQVE7WUFUYSxrQkFBa0IsdUJBVXZDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgSW5qZWN0LCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3RvcmVSb290TW9kdWxlLCBTdG9yZUZlYXR1cmVNb2R1bGUgfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBFZmZlY3RzUm9vdE1vZHVsZSB9IGZyb20gJy4vZWZmZWN0c19yb290X21vZHVsZSc7XG5pbXBvcnQgeyBGRUFUVVJFX0VGRkVDVFMgfSBmcm9tICcuL3Rva2Vucyc7XG5cbkBOZ01vZHVsZSh7fSlcbmV4cG9ydCBjbGFzcyBFZmZlY3RzRmVhdHVyZU1vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHJvb3Q6IEVmZmVjdHNSb290TW9kdWxlLFxuICAgIEBJbmplY3QoRkVBVFVSRV9FRkZFQ1RTKSBlZmZlY3RTb3VyY2VHcm91cHM6IGFueVtdW10sXG4gICAgQE9wdGlvbmFsKCkgc3RvcmVSb290TW9kdWxlOiBTdG9yZVJvb3RNb2R1bGUsXG4gICAgQE9wdGlvbmFsKCkgc3RvcmVGZWF0dXJlTW9kdWxlOiBTdG9yZUZlYXR1cmVNb2R1bGVcbiAgKSB7XG4gICAgZWZmZWN0U291cmNlR3JvdXBzLmZvckVhY2goZ3JvdXAgPT5cbiAgICAgIGdyb3VwLmZvckVhY2goZWZmZWN0U291cmNlSW5zdGFuY2UgPT5cbiAgICAgICAgcm9vdC5hZGRFZmZlY3RzKGVmZmVjdFNvdXJjZUluc3RhbmNlKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiJdfQ==