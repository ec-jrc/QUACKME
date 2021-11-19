import { __decorate, __metadata, __param } from "tslib";
import { Injectable, Inject } from '@angular/core';
import { JwtHelperService } from './jwthelper.service';
import { JWT_OPTIONS } from './jwtoptions.token';
import { mergeMap } from 'rxjs/operators';
import { parse } from 'url';
import { from } from 'rxjs';
var JwtInterceptor = /** @class */ (function () {
    function JwtInterceptor(config, jwtHelper) {
        this.jwtHelper = jwtHelper;
        this.tokenGetter = config.tokenGetter;
        this.headerName = config.headerName || 'Authorization';
        this.authScheme =
            config.authScheme || config.authScheme === ''
                ? config.authScheme
                : 'Bearer ';
        this.whitelistedDomains = config.whitelistedDomains || [];
        this.blacklistedRoutes = config.blacklistedRoutes || [];
        this.throwNoTokenError = config.throwNoTokenError || false;
        this.skipWhenExpired = config.skipWhenExpired;
    }
    JwtInterceptor.prototype.isWhitelistedDomain = function (request) {
        var requestUrl = parse(request.url, false, true);
        return (requestUrl.host === null ||
            this.whitelistedDomains.findIndex(function (domain) {
                return typeof domain === 'string'
                    ? domain === requestUrl.host
                    : domain instanceof RegExp
                        ? domain.test(requestUrl.host)
                        : false;
            }) > -1);
    };
    JwtInterceptor.prototype.isBlacklistedRoute = function (request) {
        var url = request.url;
        return (this.blacklistedRoutes.findIndex(function (route) {
            return typeof route === 'string'
                ? route === url
                : route instanceof RegExp
                    ? route.test(url)
                    : false;
        }) > -1);
    };
    JwtInterceptor.prototype.handleInterception = function (token, request, next) {
        var _a;
        var tokenIsExpired = false;
        if (!token && this.throwNoTokenError) {
            throw new Error('Could not get token from tokenGetter function.');
        }
        if (this.skipWhenExpired) {
            tokenIsExpired = token ? this.jwtHelper.isTokenExpired(token) : true;
        }
        if (token && tokenIsExpired && this.skipWhenExpired) {
            request = request.clone();
        }
        else if (token) {
            request = request.clone({
                setHeaders: (_a = {},
                    _a[this.headerName] = "" + this.authScheme + token,
                    _a)
            });
        }
        return next.handle(request);
    };
    JwtInterceptor.prototype.intercept = function (request, next) {
        var _this = this;
        if (!this.isWhitelistedDomain(request) ||
            this.isBlacklistedRoute(request)) {
            return next.handle(request);
        }
        var token = this.tokenGetter();
        if (token instanceof Promise) {
            return from(token).pipe(mergeMap(function (asyncToken) {
                return _this.handleInterception(asyncToken, request, next);
            }));
        }
        else {
            return this.handleInterception(token, request, next);
        }
    };
    JwtInterceptor.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [JWT_OPTIONS,] }] },
        { type: JwtHelperService }
    ]; };
    JwtInterceptor = __decorate([
        Injectable(),
        __param(0, Inject(JWT_OPTIONS)),
        __metadata("design:paramtypes", [Object, JwtHelperService])
    ], JwtInterceptor);
    return JwtInterceptor;
}());
export { JwtInterceptor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiand0LmludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGF1dGgwL2FuZ3VsYXItand0LyIsInNvdXJjZXMiOlsibGliL2p3dC5pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFPbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRWpELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQzVCLE9BQU8sRUFBQyxJQUFJLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFHdEM7SUFTRSx3QkFDdUIsTUFBVyxFQUN6QixTQUEyQjtRQUEzQixjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUVsQyxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLGVBQWUsQ0FBQztRQUN2RCxJQUFJLENBQUMsVUFBVTtZQUNiLE1BQU0sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLFVBQVUsS0FBSyxFQUFFO2dCQUMzQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0JBQ25CLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUM7UUFDMUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUM7UUFDM0QsSUFBSSxDQUFDLGVBQWUs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QWtCLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1RCxDQUFDLENBQ0YsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdEQ7SUFDSCxDQUFDOztnREE5RkUsTUFBTSxTQUFDLFdBQVc7Z0JBQ0QsZ0JBQWdCOztJQVh6QixjQUFjO1FBRDFCLFVBQVUsRUFBRTtRQVdSLFdBQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO2lEQUNGLGdCQUFnQjtPQVh6QixjQUFjLENBeUcxQjtJQUFELHFCQUFDO0NBQUEsQUF6R0QsSUF5R0M7U0F6R1ksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgSHR0cFJlcXVlc3QsXG4gIEh0dHBIYW5kbGVyLFxuICBIdHRwRXZlbnQsXG4gIEh0dHBJbnRlcmNlcHRvclxufSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBKd3RIZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi9qd3RoZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBKV1RfT1BUSU9OUyB9IGZyb20gJy4vand0b3B0aW9ucy50b2tlbic7XG5cbmltcG9ydCB7IG1lcmdlTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICd1cmwnO1xuaW1wb3J0IHtmcm9tLCBPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEp3dEludGVyY2VwdG9yIGltcGxlbWVudHMgSHR0cEludGVyY2VwdG9yIHtcbiAgdG9rZW5HZXR0ZXI6ICgpID0+IHN0cmluZyB8IG51bGwgfCBQcm9taXNlPHN0cmluZyB8IG51bGw+O1xuICBoZWFkZXJOYW1lOiBzdHJpbmc7XG4gIGF1dGhTY2hlbWU6IHN0cmluZztcbiAgd2hpdGVsaXN0ZWREb21haW5zOiBBcnJheTxzdHJpbmcgfCBSZWdFeHA+O1xuICBibGFja2xpc3RlZFJvdXRlczogQXJyYXk8c3RyaW5nIHwgUmVnRXhwPjtcbiAgdGhyb3dOb1Rva2VuRXJyb3I6IGJvb2xlYW47XG4gIHNraXBXaGVuRXhwaXJlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KEpXVF9PUFRJT05TKSBjb25maWc6IGFueSxcbiAgICBwdWJsaWMgand0SGVscGVyOiBKd3RIZWxwZXJTZXJ2aWNlXG4gICkge1xuICAgIHRoaXMudG9rZW5HZXR0ZXIgPSBjb25maWcudG9rZW5HZXR0ZXI7XG4gICAgdGhpcy5oZWFkZXJOYW1lID0gY29uZmlnLmhlYWRlck5hbWUgfHwgJ0F1dGhvcml6YXRpb24nO1xuICAgIHRoaXMuYXV0aFNjaGVtZSA9XG4gICAgICBjb25maWcuYXV0aFNjaGVtZSB8fCBjb25maWcuYXV0aFNjaGVtZSA9PT0gJydcbiAgICAgICAgPyBjb25maWcuYXV0aFNjaGVtZVxuICAgICAgICA6ICdCZWFyZXIgJztcbiAgICB0aGlzLndoaXRlbGlzdGVkRG9tYWlucyA9IGNvbmZpZy53aGl0ZWxpc3RlZERvbWFpbnMgfHwgW107XG4gICAgdGhpcy5ibGFja2xpc3RlZFJvdXRlcyA9IGNvbmZpZy5ibGFja2xpc3RlZFJvdXRlcyB8fCBbXTtcbiAgICB0aGlzLnRocm93Tm9Ub2tlbkVycm9yID0gY29uZmlnLnRocm93Tm9Ub2tlbkVycm9yIHx8IGZhbHNlO1xuICAgIHRoaXMuc2tpcFdoZW5FeHBpcmVkID0gY29uZmlnLnNraXBXaGVuRXhwaXJlZDtcbiAgfVxuXG4gIGlzV2hpdGVsaXN0ZWREb21haW4ocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHJlcXVlc3RVcmw6IGFueSA9IHBhcnNlKHJlcXVlc3QudXJsLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgcmVxdWVzdFVybC5ob3N0ID09PSBudWxsIHx8XG4gICAgICB0aGlzLndoaXRlbGlzdGVkRG9tYWlucy5maW5kSW5kZXgoXG4gICAgICAgIGRvbWFpbiA9PlxuICAgICAgICAgIHR5cGVvZiBkb21haW4gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICA/IGRvbWFpbiA9PT0gcmVxdWVzdFVybC5ob3N0XG4gICAgICAgICAgICA6IGRvbWFpbiBpbnN0YW5jZW9mIFJlZ0V4cFxuICAgICAgICAgICAgICA/IGRvbWFpbi50ZXN0KHJlcXVlc3RVcmwuaG9zdClcbiAgICAgICAgICAgICAgOiBmYWxzZVxuICAgICAgKSA+IC0xXG4gICAgKTtcbiAgfVxuXG4gIGlzQmxhY2tsaXN0ZWRSb3V0ZShyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogYm9vbGVhbiB7XG4gICAgY29uc3QgdXJsID0gcmVxdWVzdC51cmw7XG5cbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5ibGFja2xpc3RlZFJvdXRlcy5maW5kSW5kZXgoXG4gICAgICAgIHJvdXRlID0+XG4gICAgICAgICAgdHlwZW9mIHJvdXRlID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyByb3V0ZSA9PT0gdXJsXG4gICAgICAgICAgICA6IHJvdXRlIGluc3RhbmNlb2YgUmVnRXhwXG4gICAgICAgICAgICAgID8gcm91dGUudGVzdCh1cmwpXG4gICAgICAgICAgICAgIDogZmFsc2VcbiAgICAgICkgPiAtMVxuICAgICk7XG4gIH1cblxuICBoYW5kbGVJbnRlcmNlcHRpb24oXG4gICAgdG9rZW46IHN0cmluZyB8IG51bGwsXG4gICAgcmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PixcbiAgICBuZXh0OiBIdHRwSGFuZGxlclxuICApIHtcbiAgICBsZXQgdG9rZW5Jc0V4cGlyZWQgPSBmYWxzZTtcblxuICAgIGlmICghdG9rZW4gJiYgdGhpcy50aHJvd05vVG9rZW5FcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZ2V0IHRva2VuIGZyb20gdG9rZW5HZXR0ZXIgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2tpcFdoZW5FeHBpcmVkKSB7XG4gICAgICB0b2tlbklzRXhwaXJlZCA9IHRva2VuID8gdGhpcy5qd3RIZWxwZXIuaXNUb2tlbkV4cGlyZWQodG9rZW4pIDogdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodG9rZW4gJiYgdG9rZW5Jc0V4cGlyZWQgJiYgdGhpcy5za2lwV2hlbkV4cGlyZWQpIHtcbiAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LmNsb25lKCk7XG4gICAgfSBlbHNlIGlmICh0b2tlbikge1xuICAgICAgcmVxdWVzdCA9IHJlcXVlc3QuY2xvbmUoe1xuICAgICAgICBzZXRIZWFkZXJzOiB7XG4gICAgICAgICAgW3RoaXMuaGVhZGVyTmFtZV06IGAke3RoaXMuYXV0aFNjaGVtZX0ke3Rva2VufWBcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXF1ZXN0KTtcbiAgfVxuXG4gIGludGVyY2VwdChcbiAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LFxuICAgIG5leHQ6IEh0dHBIYW5kbGVyXG4gICk6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAoXG4gICAgICAhdGhpcy5pc1doaXRlbGlzdGVkRG9tYWluKHJlcXVlc3QpIHx8XG4gICAgICB0aGlzLmlzQmxhY2tsaXN0ZWRSb3V0ZShyZXF1ZXN0KVxuICAgICkge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgIH1cbiAgICBjb25zdCB0b2tlbiA9IHRoaXMudG9rZW5HZXR0ZXIoKTtcblxuICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHJldHVybiBmcm9tKHRva2VuKS5waXBlKG1lcmdlTWFwKFxuICAgICAgICAoYXN5bmNUb2tlbjogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUludGVyY2VwdGlvbihhc3luY1Rva2VuLCByZXF1ZXN0LCBuZXh0KTtcbiAgICAgICAgfVxuICAgICAgKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZUludGVyY2VwdGlvbih0b2tlbiwgcmVxdWVzdCwgbmV4dCk7XG4gICAgfVxuICB9XG59XG4iXX0=