import { __decorate, __metadata, __param } from "tslib";
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { JWT_OPTIONS } from './jwtoptions.token';
import { JwtHelperService } from './jwthelper.service';
var JwtModule = /** @class */ (function () {
    function JwtModule(parentModule) {
        if (parentModule) {
            throw new Error('JwtModule is already loaded. It should only be imported in your application\'s main module.');
        }
    }
    JwtModule_1 = JwtModule;
    JwtModule.forRoot = function (options) {
        return {
            ngModule: JwtModule_1,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: JwtInterceptor,
                    multi: true
                },
                options.jwtOptionsProvider ||
                    {
                        provide: JWT_OPTIONS,
                        useValue: options.config
                    },
                JwtHelperService
            ]
        };
    };
    var JwtModule_1;
    JwtModule.ctorParameters = function () { return [
        { type: JwtModule, decorators: [{ type: Optional }, { type: SkipSelf }] }
    ]; };
    JwtModule = JwtModule_1 = __decorate([
        NgModule(),
        __param(0, Optional()), __param(0, SkipSelf()),
        __metadata("design:paramtypes", [JwtModule])
    ], JwtModule);
    return JwtModule;
}());
export { JwtModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1qd3QubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGF1dGgwL2FuZ3VsYXItand0LyIsInNvdXJjZXMiOlsibGliL2FuZ3VsYXItand0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBdUIsUUFBUSxFQUFFLFFBQVEsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUM1RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBaUJyRDtJQUVFLG1CQUFvQyxZQUF1QjtRQUN6RCxJQUFJLFlBQVksRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLDZGQUE2RixDQUFDLENBQUM7U0FDaEg7SUFDSCxDQUFDO2tCQU5VLFNBQVM7SUFPYixpQkFBTyxHQUFkLFVBQWUsT0FBeUI7UUFDdEMsT0FBTztZQUNMLFFBQVEsRUFBRSxXQUFTO1lBQ25CLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixRQUFRLEVBQUUsY0FBYztvQkFDeEIsS0FBSyxFQUFFLElBQUk7aUJBQ1o7Z0JBQ0QsT0FBTyxDQUFDLGtCQUFrQjtvQkFDMUI7d0JBQ0UsT0FBTyxFQUFFLFdBQVc7d0JBQ3BCLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTTtxQkFDekI7Z0JBQ0QsZ0JBQWdCO2FBQ2pCO1NBQ0YsQ0FBQztJQUNKLENBQUM7OztnQkF0QmlELFNBQVMsdUJBQTlDLFFBQVEsWUFBSSxRQUFROztJQUZ0QixTQUFTO1FBRHJCLFFBQVEsRUFBRTtRQUdJLFdBQUEsUUFBUSxFQUFFLENBQUEsRUFBRSxXQUFBLFFBQVEsRUFBRSxDQUFBO3lDQUFlLFNBQVM7T0FGaEQsU0FBUyxDQXlCckI7SUFBRCxnQkFBQztDQUFBLEFBekJELElBeUJDO1NBekJZLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVycywgT3B0aW9uYWwsIFNraXBTZWxmLCBQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge0p3dEludGVyY2VwdG9yfSBmcm9tICcuL2p3dC5pbnRlcmNlcHRvcic7XG5pbXBvcnQge0pXVF9PUFRJT05TfSBmcm9tICcuL2p3dG9wdGlvbnMudG9rZW4nO1xuaW1wb3J0IHtKd3RIZWxwZXJTZXJ2aWNlfSBmcm9tICcuL2p3dGhlbHBlci5zZXJ2aWNlJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIEp3dE1vZHVsZU9wdGlvbnMge1xuICBqd3RPcHRpb25zUHJvdmlkZXI/OiBQcm92aWRlcjtcbiAgY29uZmlnPzoge1xuICAgIHRva2VuR2V0dGVyPzogKCkgPT4gc3RyaW5nIHwgbnVsbCB8IFByb21pc2U8c3RyaW5nIHwgbnVsbD47XG4gICAgaGVhZGVyTmFtZT86IHN0cmluZztcbiAgICBhdXRoU2NoZW1lPzogc3RyaW5nO1xuICAgIHdoaXRlbGlzdGVkRG9tYWlucz86IEFycmF5PHN0cmluZyB8IFJlZ0V4cD47XG4gICAgYmxhY2tsaXN0ZWRSb3V0ZXM/OiBBcnJheTxzdHJpbmcgfCBSZWdFeHA+O1xuICAgIHRocm93Tm9Ub2tlbkVycm9yPzogYm9vbGVhbjtcbiAgICBza2lwV2hlbkV4cGlyZWQ/OiBib29sZWFuO1xuICB9O1xufVxuXG5ATmdNb2R1bGUoKVxuZXhwb3J0IGNsYXNzIEp3dE1vZHVsZSB7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcGFyZW50TW9kdWxlOiBKd3RNb2R1bGUpIHtcbiAgICBpZiAocGFyZW50TW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0p3dE1vZHVsZSBpcyBhbHJlYWR5IGxvYWRlZC4gSXQgc2hvdWxkIG9ubHkgYmUgaW1wb3J0ZWQgaW4geW91ciBhcHBsaWNhdGlvblxcJ3MgbWFpbiBtb2R1bGUuJyk7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBmb3JSb290KG9wdGlvbnM6IEp3dE1vZHVsZU9wdGlvbnMpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEp3dE1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogSnd0TW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgICAgICB1c2VDbGFzczogSnd0SW50ZXJjZXB0b3IsXG4gICAgICAgICAgbXVsdGk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucy5qd3RPcHRpb25zUHJvdmlkZXIgfHxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEpXVF9PUFRJT05TLFxuICAgICAgICAgIHVzZVZhbHVlOiBvcHRpb25zLmNvbmZpZ1xuICAgICAgICB9LFxuICAgICAgICBKd3RIZWxwZXJTZXJ2aWNlXG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl19