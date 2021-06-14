/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterContentInit, Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Directive, Input, OnChanges, OnDestroy, SimpleChanges, ViewEncapsulation, ViewChild, } from '@angular/core';
import { merge, of as observableOf, Subscription } from 'rxjs';
import { SatDatepickerIntl } from './datepicker-intl';
/** Can be used to override the icon of a `matDatepickerToggle`. */
let SatDatepickerToggleIcon = class SatDatepickerToggleIcon {
};
SatDatepickerToggleIcon = tslib_1.__decorate([
    Directive({
        selector: '[matDatepickerToggleIcon]'
    })
], SatDatepickerToggleIcon);
export { SatDatepickerToggleIcon };
let SatDatepickerToggle = class SatDatepickerToggle {
    constructor(_intl, _changeDetectorRef, defaultTabIndex) {
        this._intl = _intl;
        this._changeDetectorRef = _changeDetectorRef;
        this._stateChanges = Subscription.EMPTY;
        const parsedTabIndex = Number(defaultTabIndex);
        this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
    }
    /** Whether the toggle button is disabled. */
    get disabled() {
        if (this._disabled === undefined && this.datepicker) {
            return this.datepicker.disabled;
        }
        return !!this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    ngOnChanges(changes) {
        if (changes['datepicker']) {
            this._watchStateChanges();
        }
    }
    ngOnDestroy() {
        this._stateChanges.unsubscribe();
    }
    ngAfterContentInit() {
        this._watchStateChanges();
    }
    _open(event) {
        if (this.datepicker && !this.disabled) {
            this.datepicker.open();
            event.stopPropagation();
        }
    }
    _watchStateChanges() {
        const datepickerDisabled = this.datepicker ? this.datepicker._disabledChange : observableOf();
        const inputDisabled = this.datepicker && this.datepicker._datepickerInput ?
            this.datepicker._datepickerInput._disabledChange : observableOf();
        const datepickerToggled = this.datepicker ?
            merge(this.datepicker.openedStream, this.datepicker.closedStream) :
            observableOf();
        this._stateChanges.unsubscribe();
        this._stateChanges = merge(this._intl.changes, datepickerDisabled, inputDisabled, datepickerToggled).subscribe(() => this._changeDetectorRef.markForCheck());
    }
};
SatDatepickerToggle.ctorParameters = () => [
    { type: SatDatepickerIntl },
    { type: ChangeDetectorRef },
    { type: String, decorators: [{ type: Attribute, args: ['tabindex',] }] }
];
tslib_1.__decorate([
    Input('for')
], SatDatepickerToggle.prototype, "datepicker", void 0);
tslib_1.__decorate([
    Input()
], SatDatepickerToggle.prototype, "tabIndex", void 0);
tslib_1.__decorate([
    Input()
], SatDatepickerToggle.prototype, "disabled", null);
tslib_1.__decorate([
    Input()
], SatDatepickerToggle.prototype, "disableRipple", void 0);
tslib_1.__decorate([
    ContentChild(SatDatepickerToggleIcon, { static: false })
], SatDatepickerToggle.prototype, "_customIcon", void 0);
tslib_1.__decorate([
    ViewChild('button', { static: false })
], SatDatepickerToggle.prototype, "_button", void 0);
SatDatepickerToggle = tslib_1.__decorate([
    Component({
        moduleId: module.id,
        selector: 'sat-datepicker-toggle',
        template: "<button\n  #button\n  mat-icon-button\n  type=\"button\"\n  [attr.aria-haspopup]=\"datepicker ? 'dialog' : null\"\n  [attr.aria-label]=\"_intl.openCalendarLabel\"\n  [attr.tabindex]=\"disabled ? -1 : tabIndex\"\n  [disabled]=\"disabled\"\n  [disableRipple]=\"disableRipple\"\n  (click)=\"_open($event)\">\n\n  <svg\n    *ngIf=\"!_customIcon\"\n    class=\"mat-datepicker-toggle-default-icon\"\n    viewBox=\"0 0 24 24\"\n    width=\"24px\"\n    height=\"24px\"\n    fill=\"currentColor\"\n    focusable=\"false\">\n    <path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z\"/>\n  </svg>\n\n  <ng-content select=\"[matDatepickerToggleIcon]\"></ng-content>\n</button>\n",
        host: {
            'class': 'mat-datepicker-toggle',
            // Always set the tabindex to -1 so that it doesn't overlap with any custom tabindex the
            // consumer may have provided, while still being able to receive focus.
            '[attr.tabindex]': '-1',
            '[class.mat-datepicker-toggle-active]': 'datepicker && datepicker.opened',
            '[class.mat-accent]': 'datepicker && datepicker.color === "accent"',
            '[class.mat-warn]': 'datepicker && datepicker.color === "warn"',
            '(focus)': '_button.focus()',
        },
        exportAs: 'matDatepickerToggle',
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush,
        styles: [".mat-form-field-appearance-legacy .mat-form-field-prefix .mat-datepicker-toggle-default-icon,.mat-form-field-appearance-legacy .mat-form-field-suffix .mat-datepicker-toggle-default-icon{width:1em}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-datepicker-toggle-default-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-datepicker-toggle-default-icon{display:block;width:1.5em;height:1.5em}.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-datepicker-toggle-default-icon,.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-datepicker-toggle-default-icon{margin:auto}"]
    }),
    tslib_1.__param(2, Attribute('tabindex'))
], SatDatepickerToggle);
export { SatDatepickerToggle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10b2dnbGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9zYXR1cm4tZGF0ZXBpY2tlci8iLCJzb3VyY2VzIjpbImRhdGVwaWNrZXIvZGF0ZXBpY2tlci10b2dnbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsU0FBUyxFQUNULHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixTQUFTLEVBQ1QsS0FBSyxFQUNMLFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLEtBQUssRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU3RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUdwRCxtRUFBbUU7QUFJbkUsSUFBYSx1QkFBdUIsR0FBcEMsTUFBYSx1QkFBdUI7Q0FBRyxDQUFBO0FBQTFCLHVCQUF1QjtJQUhuQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsMkJBQTJCO0tBQ3RDLENBQUM7R0FDVyx1QkFBdUIsQ0FBRztTQUExQix1QkFBdUI7QUFzQnBDLElBQWEsbUJBQW1CLEdBQWhDLE1BQWEsbUJBQW1CO0lBZ0M5QixZQUNTLEtBQXdCLEVBQ3ZCLGtCQUFxQyxFQUN0QixlQUF1QjtRQUZ2QyxVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBakN2QyxrQkFBYSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFvQ3pDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsUUFBUSxHQUFH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USxFQUFFLHVCQUF1QjtRQUNqQywrdkJBQXFDO1FBRXJDLElBQUksRUFBRTtZQUNKLE9BQU8sRUFBRSx1QkFBdUI7WUFDaEMsd0ZBQXdGO1lBQ3hGLHVFQUF1RTtZQUN2RSxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLHNDQUFzQyxFQUFFLGlDQUFpQztZQUN6RSxvQkFBb0IsRUFBRSw2Q0FBNkM7WUFDbkUsa0JBQWtCLEVBQUUsMkNBQTJDO1lBQy9ELFNBQVMsRUFBRSxpQkFBaUI7U0FDN0I7UUFDRCxRQUFRLEVBQUUscUJBQXFCO1FBQy9CLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO1FBQ3JDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNOztLQUNoRCxDQUFDO0lBb0NHLG1CQUFBLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtHQW5DYixtQkFBbUIsQ0E4RS9CO1NBOUVZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgRGlyZWN0aXZlLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBWaWV3Q2hpbGQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRCdXR0b259IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbic7XG5pbXBvcnQge21lcmdlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1NhdERhdGVwaWNrZXJ9IGZyb20gJy4vZGF0ZXBpY2tlcic7XG5pbXBvcnQge1NhdERhdGVwaWNrZXJJbnRsfSBmcm9tICcuL2RhdGVwaWNrZXItaW50bCc7XG5cblxuLyoqIENhbiBiZSB1c2VkIHRvIG92ZXJyaWRlIHRoZSBpY29uIG9mIGEgYG1hdERhdGVwaWNrZXJUb2dnbGVgLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdERhdGVwaWNrZXJUb2dnbGVJY29uXSdcbn0pXG5leHBvcnQgY2xhc3MgU2F0RGF0ZXBpY2tlclRvZ2dsZUljb24ge31cblxuXG5AQ29tcG9uZW50KHtcbiAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgc2VsZWN0b3I6ICdzYXQtZGF0ZXBpY2tlci10b2dnbGUnLFxuICB0ZW1wbGF0ZVVybDogJ2RhdGVwaWNrZXItdG9nZ2xlLmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZGF0ZXBpY2tlci10b2dnbGUuY3NzJ10sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWRhdGVwaWNrZXItdG9nZ2xlJyxcbiAgICAvLyBBbHdheXMgc2V0IHRoZSB0YWJpbmRleCB0byAtMSBzbyB0aGF0IGl0IGRvZXNuJ3Qgb3ZlcmxhcCB3aXRoIGFueSBjdXN0b20gdGFiaW5kZXggdGhlXG4gICAgLy8gY29uc3VtZXIgbWF5IGhhdmUgcHJvdmlkZWQsIHdoaWxlIHN0aWxsIGJlaW5nIGFibGUgdG8gcmVjZWl2ZSBmb2N1cy5cbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJy0xJyxcbiAgICAnW2NsYXNzLm1hdC1kYXRlcGlja2VyLXRvZ2dsZS1hY3RpdmVdJzogJ2RhdGVwaWNrZXIgJiYgZGF0ZXBpY2tlci5vcGVuZWQnLFxuICAgICdbY2xhc3MubWF0LWFjY2VudF0nOiAnZGF0ZXBpY2tlciAmJiBkYXRlcGlja2VyLmNvbG9yID09PSBcImFjY2VudFwiJyxcbiAgICAnW2NsYXNzLm1hdC13YXJuXSc6ICdkYXRlcGlja2VyICYmIGRhdGVwaWNrZXIuY29sb3IgPT09IFwid2FyblwiJyxcbiAgICAnKGZvY3VzKSc6ICdfYnV0dG9uLmZvY3VzKCknLFxuICB9LFxuICBleHBvcnRBczogJ21hdERhdGVwaWNrZXJUb2dnbGUnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgU2F0RGF0ZXBpY2tlclRvZ2dsZTxEPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfc3RhdGVDaGFuZ2VzID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBEYXRlcGlja2VyIGluc3RhbmNlIHRoYXQgdGhlIGJ1dHRvbiB3aWxsIHRvZ2dsZS4gKi9cbiAgQElucHV0KCdmb3InKSBkYXRlcGlja2VyOiBTYXREYXRlcGlja2VyPEQ+O1xuXG4gIC8qKiBUYWJpbmRleCBmb3IgdGhlIHRvZ2dsZS4gKi9cbiAgQElucHV0KCkgdGFiSW5kZXg6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRvZ2dsZSBidXR0b24gaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQgPT09IHVuZGVmaW5lZCAmJiB0aGlzLmRhdGVwaWNrZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGVwaWNrZXIuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuICEhdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHJpcHBsZXMgb24gdGhlIHRvZ2dsZSBzaG91bGQgYmUgZGlzYWJsZWQuICovXG4gIEBJbnB1dCgpIGRpc2FibGVSaXBwbGU6IGJvb2xlYW47XG5cbiAgLyoqIEN1c3RvbSBpY29uIHNldCBieSB0aGUgY29uc3VtZXIuICovXG4gIEBDb250ZW50Q2hpbGQoU2F0RGF0ZXBpY2tlclRvZ2dsZUljb24sIHtzdGF0aWM6IGZhbHNlfSkgX2N1c3RvbUljb246IFNhdERhdGVwaWNrZXJUb2dnbGVJY29uO1xuXG4gIC8qKiBVbmRlcmx5aW5nIGJ1dHRvbiBlbGVtZW50LiAqL1xuICBAVmlld0NoaWxkKCdidXR0b24nLCB7c3RhdGljOiBmYWxzZX0pIF9idXR0b246IE1hdEJ1dHRvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgX2ludGw6IFNhdERhdGVwaWNrZXJJbnRsLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAQXR0cmlidXRlKCd0YWJpbmRleCcpIGRlZmF1bHRUYWJJbmRleDogc3RyaW5nKSB7XG5cbiAgICBjb25zdCBwYXJzZWRUYWJJbmRleCA9IE51bWJlcihkZWZhdWx0VGFiSW5kZXgpO1xuICAgIHRoaXMudGFiSW5kZXggPSAocGFyc2VkVGFiSW5kZXggfHwgcGFyc2VkVGFiSW5kZXggPT09IDApID8gcGFyc2VkVGFiSW5kZXggOiBudWxsO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzWydkYXRlcGlja2VyJ10pIHtcbiAgICAgIHRoaXMuX3dhdGNoU3RhdGVDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc3RhdGVDaGFuZ2VzLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fd2F0Y2hTdGF0ZUNoYW5nZXMoKTtcbiAgfVxuXG4gIF9vcGVuKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRhdGVwaWNrZXIgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuZGF0ZXBpY2tlci5vcGVuKCk7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF93YXRjaFN0YXRlQ2hhbmdlcygpIHtcbiAgICBjb25zdCBkYXRlcGlja2VyRGlzYWJsZWQgPSB0aGlzLmRhdGVwaWNrZXIgPyB0aGlzLmRhdGVwaWNrZXIuX2Rpc2FibGVkQ2hhbmdlIDogb2JzZXJ2YWJsZU9mKCk7XG4gICAgY29uc3QgaW5wdXREaXNhYmxlZCA9IHRoaXMuZGF0ZXBpY2tlciAmJiB0aGlzLmRhdGVwaWNrZXIuX2RhdGVwaWNrZXJJbnB1dCA/XG4gICAgICAgIHRoaXMuZGF0ZXBpY2tlci5fZGF0ZXBpY2tlcklucHV0Ll9kaXNhYmxlZENoYW5nZSA6IG9ic2VydmFibGVPZigpO1xuICAgIGNvbnN0IGRhdGVwaWNrZXJUb2dnbGVkID0gdGhpcy5kYXRlcGlja2VyID9cbiAgICAgICAgbWVyZ2UodGhpcy5kYXRlcGlja2VyLm9wZW5lZFN0cmVhbSwgdGhpcy5kYXRlcGlja2VyLmNsb3NlZFN0cmVhbSkgOlxuICAgICAgICBvYnNlcnZhYmxlT2YoKTtcblxuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcyA9IG1lcmdlKFxuICAgICAgdGhpcy5faW50bC5jaGFuZ2VzLFxuICAgICAgZGF0ZXBpY2tlckRpc2FibGVkLFxuICAgICAgaW5wdXREaXNhYmxlZCxcbiAgICAgIGRhdGVwaWNrZXJUb2dnbGVkXG4gICAgKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCkpO1xuICB9XG59XG4iXX0=