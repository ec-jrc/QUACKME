/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterContentInit, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { SatDatepicker } from './datepicker';
import { SatDatepickerIntl } from './datepicker-intl';
/** Can be used to override the icon of a `matDatepickerToggle`. */
export declare class SatDatepickerToggleIcon {
}
export declare class SatDatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
    _intl: SatDatepickerIntl;
    private _changeDetectorRef;
    private _stateChanges;
    /** Datepicker instance that the button will toggle. */
    datepicker: SatDatepicker<D>;
    /** Tabindex for the toggle. */
    tabIndex: number | null;
    /** Whether the toggle button is disabled. */
    disabled: boolean;
    private _disabled;
    /** Whether ripples on the toggle should be disabled. */
    disableRipple: boolean;
    /** Custom icon set by the consumer. */
    _customIcon: SatDatepickerToggleIcon;
    /** Underlying button element. */
    _button: MatButton;
    constructor(_intl: SatDatepickerIntl, _changeDetectorRef: ChangeDetectorRef, defaultTabIndex: string);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngAfterContentInit(): void;
    _open(event: Event): void;
    private _watchStateChanges;
}
