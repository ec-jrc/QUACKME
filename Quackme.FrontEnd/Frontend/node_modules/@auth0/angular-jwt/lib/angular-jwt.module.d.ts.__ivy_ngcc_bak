import { ModuleWithProviders, Provider } from '@angular/core';
export interface JwtModuleOptions {
    jwtOptionsProvider?: Provider;
    config?: {
        tokenGetter?: () => string | null | Promise<string | null>;
        headerName?: string;
        authScheme?: string;
        whitelistedDomains?: Array<string | RegExp>;
        blacklistedRoutes?: Array<string | RegExp>;
        throwNoTokenError?: boolean;
        skipWhenExpired?: boolean;
    };
}
export declare class JwtModule {
    constructor(parentModule: JwtModule);
    static forRoot(options: JwtModuleOptions): ModuleWithProviders<JwtModule>;
}
