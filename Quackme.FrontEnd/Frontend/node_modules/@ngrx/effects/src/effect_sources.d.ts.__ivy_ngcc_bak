import { ErrorHandler } from '@angular/core';
import { Subject } from 'rxjs';
import { EffectsErrorHandler } from './effects_error_handler';
export declare class EffectSources extends Subject<any> {
    private errorHandler;
    private effectsErrorHandler;
    constructor(errorHandler: ErrorHandler, effectsErrorHandler: EffectsErrorHandler);
    addEffects(effectSourceInstance: any): void;
}
