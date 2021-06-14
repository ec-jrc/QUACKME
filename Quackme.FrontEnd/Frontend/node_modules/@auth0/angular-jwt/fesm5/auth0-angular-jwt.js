import { __decorate, __param, __metadata } from 'tslib';
import { InjectionToken, Inject, Injectable, Optional, SkipSelf, NgModule } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import { parse } from 'url';
import { from } from 'rxjs';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

var JWT_OPTIONS = new InjectionToken('JWT_OPTIONS');

// tslint:disable:no-bitwise
var JwtHelperService = /** @class */ (function () {
    function JwtHelperService(config) {
        if (config === void 0) { config = null; }
        this.tokenGetter = config && config.tokenGetter || function () { };
    }
    JwtHelperService.prototype.urlBase64Decode = function (str) {
        var output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0: {
                break;
            }
            case 2: {
                output += '==';
                break;
            }
            case 3: {
                output += '=';
                break;
            }
            default: {
                throw new Error('Illegal base64url string!');
            }
        }
        return this.b64DecodeUnicode(output);
    };
    // credits for decoder goes to https://github.com/atk
    JwtHelperService.prototype.b64decode = function (str) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var output = '';
        str = String(str).replace(/=+$/, '');
        if (str.length % 4 === 1) {
            throw new Error('\'atob\' failed: The string to be decoded is not correctly encoded.');
        }
        for (
        // initialize result and counters
        var bc = 0, bs = void 0, buffer = void 0, idx = 0; 
        // get next character
        (buffer = str.charAt(idx++)); 
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer &&
            ((bs = bc % 4 ? bs * 64 + buffer : buffer),
                // and if not first of each 4 characters,
                // convert the first 8 bits to one ascii character
                bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    };
    JwtHelperService.prototype.b64DecodeUnicode = function (str) {
        return decodeURIComponent(Array.prototype.map
            .call(this.b64decode(str), function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(''));
    };
    JwtHelperService.prototype.decodeToken = function (token) {
        if (token === void 0) { token = this.tokenGetter(); }
        if (!token || token === '') {
            return null;
        }
        var parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('The inspected token doesn\'t appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.');
        }
        var decoded = this.urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error('Cannot decode the token.');
        }
        return JSON.parse(decoded);
    };
    JwtHelperService.prototype.getTokenExpirationDate = function (token) {
        if (token === void 0) { token = this.tokenGetter(); }
        var decoded;
        decoded = this.decodeToken(token);
        if (!decoded || !decoded.hasOwnProperty('exp')) {
            return null;
        }
        var date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    };
    JwtHelperService.prototype.isTokenExpired = function (token, offsetSeconds) {
        if (token === void 0) { token = this.tokenGetter(); }
        if (!token || token === '') {
            return true;
        }
        var date = this.getTokenExpirationDate(token);
        offsetSeconds = offsetSeconds || 0;
        if (date === null) {
            return false;
        }
        return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
    };
    JwtHelperService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [JWT_OPTIONS,] }] }
    ]; };
    JwtHelperService = __decorate([
        Injectable(),
        __param(0, Inject(JWT_OPTIONS)),
        __metadata("design:paramtypes", [Object])
    ], JwtHelperService);
    return JwtHelperService;
}());

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

/*
 * Public API Surface of angular-jwt
 */

/**
 * Generated bundle index. Do not edit.
 */

export { JWT_OPTIONS, JwtHelperService, JwtInterceptor, JwtModule };
//# sourceMappingURL=auth0-angular-jwt.js.map
