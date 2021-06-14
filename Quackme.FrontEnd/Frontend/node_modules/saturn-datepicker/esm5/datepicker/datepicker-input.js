/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW } from '@angular/cdk/keycodes';
import { Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, OnDestroy, Optional, Output, } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators, } from '@angular/forms';
import { DateAdapter } from '../datetime/date-adapter';
import { MAT_DATE_FORMATS } from '../datetime/date-formats';
import { MatFormField } from '@angular/material/form-field';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { createMissingDateImplError } from './datepicker-errors';
/** @docs-private */
export var MAT_DATEPICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return SatDatepickerInput; }),
    multi: true
};
/** @docs-private */
export var MAT_DATEPICKER_VALIDATORS = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(function () { return SatDatepickerInput; }),
    multi: true
};
/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use SatDatepickerInputEvent instead.
 */
var SatDatepickerInputEvent = /** @class */ (function () {
    function SatDatepickerInputEvent(
    /** Reference to the datepicker input component that emitted the event. */
    target, 
    /** Reference to the native input element associated with the datepicker input. */
    targetElement) {
        this.target = target;
        this.targetElement = targetElement;
        this.value = this.target.value;
    }
    return SatDatepickerInputEvent;
}());
export { SatDatepickerInputEvent };
/** Directive used to connect an input to a SatDatepicker. */
var SatDatepickerInput = /** @class */ (function () {
    function SatDatepickerInput(_elementRef, _dateAdapter, _dateFormats, _formField) {
        var _this = this;
        this._elementRef = _elementRef;
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        this._formField = _formField;
        /** Emits when a `change` event is fired on this `<input>`. */
        this.dateChange = new EventEmitter();
        /** Emits when an `input` event is fired on this `<input>`. */
        this.dateInput = new EventEmitter();
        /** Emits when the value changes (either due to user input or programmatic change). */
        this._valueChange = new EventEmitter();
        /** Emits when the disabled state has changed */
        this._disabledChange = new EventEmitter();
        this._onTouched = function () { };
        this._cvaOnChange = function () { };
        this._validatorOnChange = function () { };
        this._datepickerSubscription = Subscription.EMPTY;
        this._localeSubscription = Subscription.EMPTY;
        /** The form control validator for whether the input parses. */
        this._parseValidator = function () {
            return _this._lastValueValid ?
                null : { 'matDatepickerParse': { 'text': _this._elementRef.nativeElement.value } };
        };
        /** The form control validator for the min date. */
        this._minValidator = function (control) {
            if (_this._datepicker.rangeMode && control.value) {
                var beginDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.begin));
                var endDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.end));
                if (_this.min) {
                    if (beginDate && _this._dateAdapter.compareDate(_this.min, beginDate) > 0) {
                        return { 'matDatepickerMin': { 'min': _this.min, 'actual': beginDate } };
                    }
                    if (endDate && _this._dateAdapter.compareDate(_this.min, endDate) > 0) {
                        return { 'matDatepickerMin': { 'min': _this.min, 'actual': endDate } };
                    }
                }
                return null;
            }
            var controlValue = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
            return (!_this.min || !controlValue ||
                _this._dateAdapter.compareDate(_this.min, controlValue) <= 0) ?
                null : { 'matDatepickerMin': { 'min': _this.min, 'actual': controlValue } };
        };
        /** The form control validator for the max date. */
        this._maxValidator = function (control) {
            if (_this._datepicker.rangeMode && control.value) {
                var beginDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.begin));
                var endDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.end));
                if (_this.max) {
                    if (beginDate && _this._dateAdapter.compareDate(_this.max, beginDate) < 0) {
                        return { 'matDatepickerMax': { 'max': _this.max, 'actual': beginDate } };
                    }
                    if (endDate && _this._dateAdapter.compareDate(_this.max, endDate) < 0) {
                        return { 'matDatepickerMax': { 'max': _this.max, 'actual': endDate } };
                    }
                }
                return null;
            }
            var controlValue = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
            return (!_this.max || !controlValue ||
                _this._dateAdapter.compareDate(_this.max, controlValue) >= 0) ?
                null : { 'matDatepickerMax': { 'max': _this.max, 'actual': controlValue } };
        };
        /** The form control validator for the date filter. */
        this._filterValidator = function (control) {
            if (_this._datepicker.rangeMode && control.value) {
                var beginDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.begin));
                var endDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.end));
                return !_this._dateFilter || !beginDate && !endDate ||
                    _this._dateFilter(beginDate) && _this._dateFilter(endDate) ?
                    null : { 'matDatepickerFilter': true };
            }
            var controlValue = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value));
            return !_this._dateFilter || !controlValue || _this._dateFilter(controlValue) ?
                null : { 'matDatepickerFilter': true };
        };
        /** The form control validator for the date filter. */
        this._rangeValidator = function (control) {
            if (_this._datepicker.rangeMode && control.value) {
                var beginDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.begin));
                var endDate = _this._getValidDateOrNull(_this._dateAdapter.deserialize(control.value.end));
                return !beginDate || !endDate || _this._dateAdapter.compareDate(beginDate, endDate) <= 0 ?
                    null : { 'matDatepickerRange': true };
            }
            return null;
        };
        /** The combined form control validator for this input. */
        this._validator = Validators.compose([this._parseValidator, this._minValidator, this._maxValidator,
            this._filterValidator, this._rangeValidator]);
        /** Whether the last value set on the input was valid. */
        this._lastValueValid = false;
        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }
        if (!this._dateFormats) {
            throw createMissingDateImplError('MAT_DATE_FORMATS');
        }
        // Update the displayed date when the locale changes.
        this._localeSubscription = _dateAdapter.localeChanges.subscribe(function () {
            _this.value = _this.value;
        });
    }
    SatDatepickerInput_1 = SatDatepickerInput;
    Object.defineProperty(SatDatepickerInput.prototype, "satDatepicker", {
        /** The datepicker that this input is associated with. */
        set: function (value) {
            var _this = this;
            if (!value) {
                return;
            }
            this._datepicker = value;
            this._datepicker._registerInput(this);
            this._datepickerSubscription.unsubscribe();
            this._datepickerSubscription = this._datepicker._selectedChanged.subscribe(function (selected) {
                _this.value = selected;
                _this._cvaOnChange(selected);
                _this._onTouched();
                _this.dateInput.emit(new SatDatepickerInputEvent(_this, _this._elementRef.nativeElement));
                _this.dateChange.emit(new SatDatepickerInputEvent(_this, _this._elementRef.nativeElement));
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SatDatepickerInput.prototype, "matDatepickerFilter", {
        /** Function that can be used to filter out dates within the datepicker. */
        set: function (value) {
            this._dateFilter = value;
            this._validatorOnChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SatDatepickerInput.prototype, "value", {
        /** The value of the input. */
        get: function () {
            return this._value;
        },
        set: function (value) {
            if (value && value.hasOwnProperty('begin') && value.hasOwnProperty('end')) {
                /** Range mode */
                var rangeValue = value;
                rangeValue.begin = this._dateAdapter.deserialize(rangeValue.begin);
                rangeValue.end = this._dateAdapter.deserialize(rangeValue.end);
                this._lastValueValid = !rangeValue.begin || !rangeValue.end ||
                    this._dateAdapter.isValid(rangeValue.begin) && this._dateAdapter.isValid(rangeValue.end);
                rangeValue.begin = this._getValidDateOrNull(rangeValue.begin);
                rangeValue.end = this._getValidDateOrNull(rangeValue.end);
                var oldDate = this.value;
                this._elementRef.nativeElement.value =
                    rangeValue && rangeValue.begin && rangeValue.end
                        ? this._dateAdapter.format(rangeValue.begin, this._dateFormats.display.dateInput) +
                            ' - ' +
                            this._dateAdapter.format(rangeValue.end, this._dateFormats.display.dateInput)
                        : '';
                if (oldDate == null && rangeValue != null || oldDate != null && rangeValue == null ||
                    !this._dateAdapter.sameDate(oldDate.begin, rangeValue.begin) ||
                    !this._dateAdapter.sameDate(oldDate.end, rangeValue.end)) {
                    if (rangeValue.end && rangeValue.begin &&
                        this._dateAdapter
                            .compareDate(rangeValue.begin, rangeValue.end) > 0) { // if begin > end
                        value = null;
                    }
                    this._value = value;
                    this._valueChange.emit(value);
                }
            }
            else {
                /** Not range mode */
                value = this._dateAdapter.deserialize(value);
                this._lastValueValid = !value || this._dateAdapter.isValid(value);
                value = this._getValidDateOrNull(value);
                var oldDate = this.value;
                this._value = value;
                this._elementRef.nativeElement.value =
                    value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
                if (!this._dateAdapter.sameDate(oldDate, value)) {
                    this._valueChange.emit(value);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SatDatepickerInput.prototype, "min", {
        /** The minimum valid date. */
        get: function () { return this._min; },
        set: function (value) {
            this._min = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
            this._validatorOnChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SatDatepickerInput.prototype, "max", {
        /** The maximum valid date. */
        get: function () { return this._max; },
        set: function (value) {
            this._max = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
            this._validatorOnChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SatDatepickerInput.prototype, "disabled", {
        /** Whether the datepicker-input is disabled. */
        get: function () { return !!this._disabled; },
        set: function (value) {
            var newValue = coerceBooleanProperty(value);
            var element = this._elementRef.nativeElement;
            if (this._disabled !== newValue) {
                this._disabled = newValue;
                this._disabledChange.emit(newValue);
            }
            // We need to null check the `blur` method, because it's undefined during SSR.
            if (newValue && element.blur) {
                // Normally, native input elements automatically blur if they turn disabled. This behavior
                // is problematic, because it would mean that it triggers another change detection cycle,
                // which then causes a changed after checked error if the input element was focused before.
                element.blur();
            }
        },
        enumerable: true,
        configurable: true
    });
    SatDatepickerInput.prototype.ngOnDestroy = function () {
        this._datepickerSubscription.unsubscribe();
        this._localeSubscription.unsubscribe();
        this._valueChange.complete();
        this._disabledChange.complete();
    };
    /** @docs-private */
    SatDatepickerInput.prototype.registerOnValidatorChange = function (fn) {
        this._validatorOnChange = fn;
    };
    /** @docs-private */
    SatDatepickerInput.prototype.validate = function (c) {
        return this._validator ? this._validator(c) : null;
    };
    /**
     * @deprecated
     * @breaking-change 8.0.0 Use `getConnectedOverlayOrigin` instead
     */
    SatDatepickerInput.prototype.getPopupConnectionElementRef = function () {
        return this.getConnectedOverlayOrigin();
    };
    /**
     * Gets the element that the datepicker popup should be connected to.
     * @return The element to connect the popup to.
     */
    SatDatepickerInput.prototype.getConnectedOverlayOrigin = function () {
        return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
    };
    // Implemented as part of ControlValueAccessor
    SatDatepickerInput.prototype.writeValue = function (value) {
        this.value = value;
    };
    // Implemented as part of ControlValueAccessor.
    SatDatepickerInput.prototype.registerOnChange = function (fn) {
        this._cvaOnChange = fn;
    };
    // Implemented as part of ControlValueAccessor.
    SatDatepickerInput.prototype.registerOnTouched = function (fn) {
        this._onTouched = fn;
    };
    // Implemented as part of ControlValueAccessor.
    SatDatepickerInput.prototype.setDisabledState = function (isDisabled) {
        this.disabled = isDisabled;
    };
    SatDatepickerInput.prototype._onKeydown = function (event) {
        var isAltDownArrow = event.altKey && event.keyCode === DOWN_ARROW;
        if (this._datepicker && isAltDownArrow && !this._elementRef.nativeElement.readOnly) {
            this._datepicker.open();
            event.preventDefault();
        }
    };
    SatDatepickerInput.prototype._onInput = function (value) {
        var date = null;
        if (this._datepicker.rangeMode) {
            var parts = value.split('-');
            if (parts.length > 1) {
                var position = Math.floor(parts.length / 2);
                var beginDateString = parts.slice(0, position).join('-');
                var endDateString = parts.slice(position).join('-');
                var beginDate = this._dateAdapter.parse(beginDateString, this._dateFormats.parse.dateInput);
                var endDate = this._dateAdapter.parse(endDateString, this._dateFormats.parse.dateInput);
                this._lastValueValid = !beginDate || !endDate || this._dateAdapter.isValid(beginDate) &&
                    this._dateAdapter.isValid(endDate);
                beginDate = this._getValidDateOrNull(beginDate);
                endDate = this._getValidDateOrNull(endDate);
                if (beginDate && endDate) {
                    date = { begin: beginDate, end: endDate };
                }
            }
        }
        else {
            date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
            this._lastValueValid = !date || this._dateAdapter.isValid(date);
            date = this._getValidDateOrNull(date);
        }
        this._value = date;
        this._cvaOnChange(date);
        this._valueChange.emit(date);
        this.dateInput.emit(new SatDatepickerInputEvent(this, this._elementRef.nativeElement));
    };
    SatDatepickerInput.prototype._onChange = function () {
        this.dateChange.emit(new SatDatepickerInputEvent(this, this._elementRef.nativeElement));
    };
    /** Returns the palette used by the input's form field, if any. */
    SatDatepickerInput.prototype._getThemePalette = function () {
        return this._formField ? this._formField.color : undefined;
    };
    /** Handles blur events on the input. */
    SatDatepickerInput.prototype._onBlur = function () {
        // Reformat the input only if we have a valid value.
        if (this.value) {
            this._formatValue(this.value);
        }
        this._onTouched();
    };
    /** Formats a value and sets it on the input element. */
    SatDatepickerInput.prototype._formatValue = function (value) {
        if (value && value.hasOwnProperty('begin') && value.hasOwnProperty('end')) {
            value = value;
            this._elementRef.nativeElement.value =
                value && value.begin && value.end
                    ? this._dateAdapter.format(value.begin, this._dateFormats.display.dateInput) +
                        ' - ' +
                        this._dateAdapter.format(value.end, this._dateFormats.display.dateInput)
                    : '';
        }
        else {
            value = value;
            this._elementRef.nativeElement.value =
                value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
        }
    };
    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    SatDatepickerInput.prototype._getValidDateOrNull = function (obj) {
        return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
    };
    var SatDatepickerInput_1;
    SatDatepickerInput.ctorParameters = function () { return [
        { type: ElementRef },
        { type: DateAdapter, decorators: [{ type: Optional }] },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_DATE_FORMATS,] }] },
        { type: MatFormField, decorators: [{ type: Optional }] }
    ]; };
    tslib_1.__decorate([
        Input()
    ], SatDatepickerInput.prototype, "satDatepicker", null);
    tslib_1.__decorate([
        Input()
    ], SatDatepickerInput.prototype, "matDatepickerFilter", null);
    tslib_1.__decorate([
        Input()
    ], SatDatepickerInput.prototype, "value", null);
    tslib_1.__decorate([
        Input()
    ], SatDatepickerInput.prototype, "min", null);
    tslib_1.__decorate([
        Input()
    ], SatDatepickerInput.prototype, "max", null);
    tslib_1.__decorate([
        Input()
    ], SatDatepickerInput.prototype, "disabled", null);
    tslib_1.__decorate([
        Output()
    ], SatDatepickerInput.prototype, "dateChange", void 0);
    tslib_1.__decorate([
        Output()
    ], SatDatepickerInput.prototype, "dateInput", void 0);
    SatDatepickerInput = SatDatepickerInput_1 = tslib_1.__decorate([
        Directive({
            selector: 'input[satDatepicker]',
            providers: [
                MAT_DATEPICKER_VALUE_ACCESSOR,
                MAT_DATEPICKER_VALIDATORS,
                { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: SatDatepickerInput_1 },
            ],
            host: {
                '[attr.aria-haspopup]': '_datepicker ? "dialog" : null',
                '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
                '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
                '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
                '[disabled]': 'disabled',
                '(input)': '_onInput($event.target.value)',
                '(change)': '_onChange()',
                '(blur)': '_onBlur()',
                '(keydown)': '_onKeydown($event)',
            },
            exportAs: 'matDatepickerInput',
        }),
        tslib_1.__param(1, Optional()),
        tslib_1.__param(2, Optional()), tslib_1.__param(2, Inject(MAT_DATE_FORMATS)),
        tslib_1.__param(3, Optional())
    ], SatDatepickerInput);
    return SatDatepickerInput;
}());
export { SatDatepickerInput };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3NhdHVybi1kYXRlcGlja2VyLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9kYXRlcGlja2VyLWlucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDakQsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFHTCxhQUFhLEVBQ2IsaUJBQWlCLEVBSWpCLFVBQVUsR0FDWCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQWlCLE1BQU0sMEJBQTBCLENBQUM7QUFFMUUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzFELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFbEMsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFL0Qsb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBQyxJQUFNLDZCQUE2QixHQUFRO0lBQ2hELE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxjQUFNLE9BQUEsa0JBQWtCLEVBQWxCLENBQWtCLENBQUM7SUFDakQsS0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDO0FBRUYsb0JBQW9CO0FBQ3BCLE1BQU0sQ0FBQyxJQUFNLHlCQUF5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a0IsQ0FrWTlCO0lBQUQseUJBQUM7Q0FBQSxBQWxZRCxJQWtZQztTQWxZWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RPV05fQVJST1d9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIE5HX1ZBTElEQVRPUlMsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3IsXG4gIFZhbGlkYXRvckZuLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0RhdGVBZGFwdGVyfSBmcm9tICcuLi9kYXRldGltZS9kYXRlLWFkYXB0ZXInO1xuaW1wb3J0IHtNQVRfREFURV9GT1JNQVRTLCBNYXREYXRlRm9ybWF0c30gZnJvbSAnLi4vZGF0ZXRpbWUvZGF0ZS1mb3JtYXRzJztcbmltcG9ydCB7VGhlbWVQYWxldHRlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7TUFUX0lOUFVUX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dCc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge1NhdERhdGVwaWNrZXJ9IGZyb20gJy4vZGF0ZXBpY2tlcic7XG5pbXBvcnQge2NyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yfSBmcm9tICcuL2RhdGVwaWNrZXItZXJyb3JzJztcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBjb25zdCBNQVRfREFURVBJQ0tFUl9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gU2F0RGF0ZXBpY2tlcklucHV0KSxcbiAgbXVsdGk6IHRydWVcbn07XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgY29uc3QgTUFUX0RBVEVQSUNLRVJfVkFMSURBVE9SUzogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBTYXREYXRlcGlja2VySW5wdXQpLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuLyoqXG4gKiBTcGVjaWFsIGludGVyZmFjZSB0byBpbnB1dCBhbmQgb3V0cHV0IGRhdGVzIGludGVydmFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNhdERhdGVwaWNrZXJSYW5nZVZhbHVlPEQ+IHtcbiAgYmVnaW46IEQgfCBudWxsO1xuICBlbmQ6IEQgfCBudWxsO1xufVxuXG4vKipcbiAqIEFuIGV2ZW50IHVzZWQgZm9yIGRhdGVwaWNrZXIgaW5wdXQgYW5kIGNoYW5nZSBldmVudHMuIFdlIGRvbid0IGFsd2F5cyBoYXZlIGFjY2VzcyB0byBhIG5hdGl2ZVxuICogaW5wdXQgb3IgY2hhbmdlIGV2ZW50IGJlY2F1c2UgdGhlIGV2ZW50IG1heSBoYXZlIGJlZW4gdHJpZ2dlcmVkIGJ5IHRoZSB1c2VyIGNsaWNraW5nIG9uIHRoZVxuICogY2FsZW5kYXIgcG9wdXAuIEZvciBjb25zaXN0ZW5jeSwgd2UgYWx3YXlzIHVzZSBTYXREYXRlcGlja2VySW5wdXRFdmVudCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgU2F0RGF0ZXBpY2tlcklucHV0RXZlbnQ8RD4ge1xuICAvKiogVGhlIG5ldyB2YWx1ZSBmb3IgdGhlIHRhcmdldCBkYXRlcGlja2VyIGlucHV0LiAqL1xuICB2YWx1ZTogU2F0RGF0ZXBpY2tlclJhbmdlVmFsdWU8RD4gfCBEIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogUmVmZXJlbmNlIHRvIHRoZSBkYXRlcGlja2VyIGlucHV0IGNvbXBvbmVudCB0aGF0IGVtaXR0ZWQgdGhlIGV2ZW50LiAqL1xuICAgIHB1YmxpYyB0YXJnZXQ6IFNhdERhdGVwaWNrZXJJbnB1dDxEPixcbiAgICAvKiogUmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgaW5wdXQgZWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIGRhdGVwaWNrZXIgaW5wdXQuICovXG4gICAgcHVibGljIHRhcmdldEVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMudGFyZ2V0LnZhbHVlO1xuICB9XG59XG5cblxuLyoqIERpcmVjdGl2ZSB1c2VkIHRvIGNvbm5lY3QgYW4gaW5wdXQgdG8gYSBTYXREYXRlcGlja2VyLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW5wdXRbc2F0RGF0ZXBpY2tlcl0nLFxuICBwcm92aWRlcnM6IFtcbiAgICBNQVRfREFURVBJQ0tFUl9WQUxVRV9BQ0NFU1NPUixcbiAgICBNQVRfREFURVBJQ0tFUl9WQUxJREFUT1JTLFxuICAgIHtwcm92aWRlOiBNQVRfSU5QVVRfVkFMVUVfQUNDRVNTT1IsIHVzZUV4aXN0aW5nOiBTYXREYXRlcGlja2VySW5wdXR9LFxuICBdLFxuICBob3N0OiB7XG4gICAgJ1thdHRyLmFyaWEtaGFzcG9wdXBdJzogJ19kYXRlcGlja2VyID8gXCJkaWFsb2dcIiA6IG51bGwnLFxuICAgICdbYXR0ci5hcmlhLW93bnNdJzogJyhfZGF0ZXBpY2tlcj8ub3BlbmVkICYmIF9kYXRlcGlja2VyLmlkKSB8fCBudWxsJyxcbiAgICAnW2F0dHIubWluXSc6ICdtaW4gPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKG1pbikgOiBudWxsJyxcbiAgICAnW2F0dHIubWF4XSc6ICdtYXggPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKG1heCkgOiBudWxsJyxcbiAgICAnW2Rpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJyhpbnB1dCknOiAnX29uSW5wdXQoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxuICAgICcoY2hhbmdlKSc6ICdfb25DaGFuZ2UoKScsXG4gICAgJyhibHVyKSc6ICdfb25CbHVyKCknLFxuICAgICcoa2V5ZG93biknOiAnX29uS2V5ZG93bigkZXZlbnQpJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdtYXREYXRlcGlja2VySW5wdXQnLFxufSlcbmV4cG9ydCBjbGFzcyBTYXREYXRlcGlja2VySW5wdXQ8RD4gaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25EZXN0cm95LCBWYWxpZGF0b3Ige1xuICAvKiogVGhlIGRhdGVwaWNrZXIgdGhhdCB0aGlzIGlucHV0IGlzIGFzc29jaWF0ZWQgd2l0aC4gKi9cbiAgQElucHV0KClcbiAgc2V0IHNhdERhdGVwaWNrZXIodmFsdWU6IFNhdERhdGVwaWNrZXI8RD4pIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZGF0ZXBpY2tlciA9IHZhbHVlO1xuICAgIHRoaXMuX2RhdGVwaWNrZXIuX3JlZ2lzdGVySW5wdXQodGhpcyk7XG4gICAgdGhpcy5fZGF0ZXBpY2tlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXG4gICAgdGhpcy5fZGF0ZXBpY2tlclN1YnNjcmlwdGlvbiA9IHRoaXMuX2RhdGVwaWNrZXIuX3NlbGVjdGVkQ2hhbmdlZC5zdWJzY3JpYmUoKHNlbGVjdGVkOiBEKSA9PiB7XG4gICAgICB0aGlzLnZhbHVlID0gc2VsZWN0ZWQ7XG4gICAgICB0aGlzLl9jdmFPbkNoYW5nZShzZWxlY3RlZCk7XG4gICAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgICAgIHRoaXMuZGF0ZUlucHV0LmVtaXQobmV3IFNhdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICAgICAgdGhpcy5kYXRlQ2hhbmdlLmVtaXQobmV3IFNhdERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICAgIH0pO1xuICB9XG4gIF9kYXRlcGlja2VyOiBTYXREYXRlcGlja2VyPEQ+O1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbHRlciBvdXQgZGF0ZXMgd2l0aGluIHRoZSBkYXRlcGlja2VyLiAqL1xuICBASW5wdXQoKVxuICBzZXQgbWF0RGF0ZXBpY2tlckZpbHRlcih2YWx1ZTogKGRhdGU6IEQgfCBudWxsKSA9PiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGF0ZUZpbHRlciA9IHZhbHVlO1xuICAgIHRoaXMuX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XG4gIH1cbiAgX2RhdGVGaWx0ZXI6IChkYXRlOiBTYXREYXRlcGlja2VyUmFuZ2VWYWx1ZTxEPiB8IEQgfCBudWxsKSA9PiBib29sZWFuO1xuXG4gIC8qKiBUaGUgdmFsdWUgb2YgdGhlIGlucHV0LiAqL1xuICBASW5wdXQoKVxuICBnZXQgdmFsdWUoKTogU2F0RGF0ZXBpY2tlclJhbmdlVmFsdWU8RD4gfCBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogIFNhdERhdGVwaWNrZXJSYW5nZVZhbHVlPEQ+IHwgRCB8IG51bGwpIHtcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoJ2JlZ2luJykgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoJ2VuZCcpKSB7XG4gICAgICAvKiogUmFuZ2UgbW9kZSAqL1xuICAgICAgY29uc3QgcmFuZ2VWYWx1ZSA9IDxTYXREYXRlcGlja2VyUmFuZ2VWYWx1ZTxEPj52YWx1ZTtcbiAgICAgIHJhbmdlVmFsdWUuYmVnaW4gPSB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShyYW5nZVZhbHVlLmJlZ2luKTtcbiAgICAgIHJhbmdlVmFsdWUuZW5kID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUocmFuZ2VWYWx1ZS5lbmQpO1xuICAgICAgdGhpcy5fbGFzdFZhbHVlVmFsaWQgPSAhcmFuZ2VWYWx1ZS5iZWdpbiB8fCAhcmFuZ2VWYWx1ZS5lbmQgfHxcbiAgICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5pc1ZhbGlkKHJhbmdlVmFsdWUuYmVnaW4pICYmIHRoaXMuX2RhdGVBZGFwdGVyLmlzVmFsaWQocmFuZ2VWYWx1ZS5lbmQpO1xuICAgICAgcmFuZ2VWYWx1ZS5iZWdpbiA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbChyYW5nZVZhbHVlLmJlZ2luKTtcbiAgICAgIHJhbmdlVmFsdWUuZW5kID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKHJhbmdlVmFsdWUuZW5kKTtcbiAgICAgIGxldCBvbGREYXRlID0gPFNhdERhdGVwaWNrZXJSYW5nZVZhbHVlPEQ+IHwgbnVsbD50aGlzLnZhbHVlO1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlID1cbiAgICAgICAgICByYW5nZVZhbHVlICYmIHJhbmdlVmFsdWUuYmVnaW4gJiYgcmFuZ2VWYWx1ZS5lbmRcbiAgICAgICAgICAgICAgPyB0aGlzLl9kYXRlQWRhcHRlci5mb3JtYXQocmFuZ2VWYWx1ZS5iZWdpbiwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5kYXRlSW5wdXQpICtcbiAgICAgICAgICAgICAgICAnIC0gJyArXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KHJhbmdlVmFsdWUuZW5kLCB0aGlzLl9kYXRlRm9ybWF0cy5kaXNwbGF5LmRhdGVJbnB1dClcbiAgICAgICAgICAgICAgOiAnJztcbiAgICAgIGlmIChvbGREYXRlID09IG51bGwgJiYgcmFuZ2VWYWx1ZSAhPSBudWxsIHx8IG9sZERhdGUgIT0gbnVsbCAmJiByYW5nZVZhbHVlID09IG51bGwgfHxcbiAgICAgICAgICAhdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoKDxTYXREYXRlcGlja2VyUmFuZ2VWYWx1ZTxEPj5vbGREYXRlKS5iZWdpbixcbiAgICAgICAgICAgICAgcmFuZ2VWYWx1ZS5iZWdpbikgfHxcbiAgICAgICAgICAhdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoKDxTYXREYXRlcGlja2VyUmFuZ2VWYWx1ZTxEPj5vbGREYXRlKS5lbmQsXG4gICAgICAgICAgICAgIHJhbmdlVmFsdWUuZW5kKSkge1xuICAgICAgICBpZiAocmFuZ2VWYWx1ZS5lbmQgJiYgcmFuZ2VWYWx1ZS5iZWdpbiAmJlxuICAgICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXJcbiAgICAgICAgICAgICAgICAuY29tcGFyZURhdGUocmFuZ2VWYWx1ZS5iZWdpbiwgcmFuZ2VWYWx1ZS5lbmQgKSA+IDApIHsgLy8gaWYgYmVnaW4gPiBlbmRcbiAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fdmFsdWVDaGFuZ2UuZW1pdCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qKiBOb3QgcmFuZ2UgbW9kZSAqL1xuICAgICAgdmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9ICF2YWx1ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5pc1ZhbGlkKHZhbHVlKTtcbiAgICAgIHZhbHVlID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKHZhbHVlKTtcbiAgICAgIGxldCBvbGREYXRlID0gdGhpcy52YWx1ZTtcbiAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPVxuICAgICAgICAgIHZhbHVlID8gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KHZhbHVlLCB0aGlzLl9kYXRlRm9ybWF0cy5kaXNwbGF5LmRhdGVJbnB1dCkgOiAnJztcbiAgICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoPEQ+b2xkRGF0ZSwgdmFsdWUpKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlQ2hhbmdlLmVtaXQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBwcml2YXRlIF92YWx1ZTogU2F0RGF0ZXBpY2tlclJhbmdlVmFsdWU8RD4gfCBEIHwgbnVsbDtcblxuICAvKiogVGhlIG1pbmltdW0gdmFsaWQgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1pbigpOiBEIHwgbnVsbCB7IHJldHVybiB0aGlzLl9taW47IH1cbiAgc2V0IG1pbih2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9taW4gPSB0aGlzLl9nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSgpO1xuICB9XG4gIHByaXZhdGUgX21pbjogRCB8IG51bGw7XG5cbiAgLyoqIFRoZSBtYXhpbXVtIHZhbGlkIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXgoKTogRCB8IG51bGwgeyByZXR1cm4gdGhpcy5fbWF4OyB9XG4gIHNldCBtYXgodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWF4ID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gICAgdGhpcy5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgfVxuICBwcml2YXRlIF9tYXg6IEQgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyLWlucHV0IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiAhIXRoaXMuX2Rpc2FibGVkOyB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkICE9PSBuZXdWYWx1ZSkge1xuICAgICAgdGhpcy5fZGlzYWJsZWQgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMuX2Rpc2FibGVkQ2hhbmdlLmVtaXQobmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gbnVsbCBjaGVjayB0aGUgYGJsdXJgIG1ldGhvZCwgYmVjYXVzZSBpdCdzIHVuZGVmaW5lZCBkdXJpbmcgU1NSLlxuICAgIGlmIChuZXdWYWx1ZSAmJiBlbGVtZW50LmJsdXIpIHtcbiAgICAgIC8vIE5vcm1hbGx5LCBuYXRpdmUgaW5wdXQgZWxlbWVudHMgYXV0b21hdGljYWxseSBibHVyIGlmIHRoZXkgdHVybiBkaXNhYmxlZC4gVGhpcyBiZWhhdmlvclxuICAgICAgLy8gaXMgcHJvYmxlbWF0aWMsIGJlY2F1c2UgaXQgd291bGQgbWVhbiB0aGF0IGl0IHRyaWdnZXJzIGFub3RoZXIgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSxcbiAgICAgIC8vIHdoaWNoIHRoZW4gY2F1c2VzIGEgY2hhbmdlZCBhZnRlciBjaGVja2VkIGVycm9yIGlmIHRoZSBpbnB1dCBlbGVtZW50IHdhcyBmb2N1c2VkIGJlZm9yZS5cbiAgICAgIGVsZW1lbnQuYmx1cigpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKiogRW1pdHMgd2hlbiBhIGBjaGFuZ2VgIGV2ZW50IGlzIGZpcmVkIG9uIHRoaXMgYDxpbnB1dD5gLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZGF0ZUNoYW5nZTogRXZlbnRFbWl0dGVyPFNhdERhdGVwaWNrZXJJbnB1dEV2ZW50PEQ+PiA9XG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPFNhdERhdGVwaWNrZXJJbnB1dEV2ZW50PEQ+PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFuIGBpbnB1dGAgZXZlbnQgaXMgZmlyZWQgb24gdGhpcyBgPGlucHV0PmAuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBkYXRlSW5wdXQ6IEV2ZW50RW1pdHRlcjxTYXREYXRlcGlja2VySW5wdXRFdmVudDxEPj4gPVxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxTYXREYXRlcGlja2VySW5wdXRFdmVudDxEPj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgdmFsdWUgY2hhbmdlcyAoZWl0aGVyIGR1ZSB0byB1c2VyIGlucHV0IG9yIHByb2dyYW1tYXRpYyBjaGFuZ2UpLiAqL1xuICBfdmFsdWVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFNhdERhdGVwaWNrZXJSYW5nZVZhbHVlPEQ+fER8bnVsbD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgZGlzYWJsZWQgc3RhdGUgaGFzIGNoYW5nZWQgKi9cbiAgX2Rpc2FibGVkQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIF9vblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBwcml2YXRlIF9jdmFPbkNoYW5nZTogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICBwcml2YXRlIF92YWxpZGF0b3JPbkNoYW5nZSA9ICgpID0+IHt9O1xuXG4gIHByaXZhdGUgX2RhdGVwaWNrZXJTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgcHJpdmF0ZSBfbG9jYWxlU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3Igd2hldGhlciB0aGUgaW5wdXQgcGFyc2VzLiAqL1xuICBwcml2YXRlIF9wYXJzZVZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIHJldHVybiB0aGlzLl9sYXN0VmFsdWVWYWxpZCA/XG4gICAgICAgIG51bGwgOiB7J21hdERhdGVwaWNrZXJQYXJzZSc6IHsndGV4dCc6IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZX19O1xuICB9XG5cbiAgLyoqIFRoZSBmb3JtIGNvbnRyb2wgdmFsaWRhdG9yIGZvciB0aGUgbWluIGRhdGUuICovXG4gIHByaXZhdGUgX21pblZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIGlmICh0aGlzLl9kYXRlcGlja2VyLnJhbmdlTW9kZSAmJiBjb250cm9sLnZhbHVlKSB7XG4gICAgICBjb25zdCBiZWdpbkRhdGUgPVxuICAgICAgICAgIHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlLmJlZ2luKSk7XG4gICAgICBjb25zdCBlbmREYXRlID1cbiAgICAgICAgICB0aGlzLl9nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZS5lbmQpKTtcbiAgICAgIGlmICh0aGlzLm1pbikge1xuICAgICAgICBpZiAoYmVnaW5EYXRlICYmIHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKHRoaXMubWluLCBiZWdpbkRhdGUpID4gMCkge1xuICAgICAgICAgIHJldHVybiB7J21hdERhdGVwaWNrZXJNaW4nOiB7J21pbic6IHRoaXMubWluLCAnYWN0dWFsJzogYmVnaW5EYXRlfX07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZERhdGUgJiYgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUodGhpcy5taW4sIGVuZERhdGUpID4gMCkge1xuICAgICAgICAgIHJldHVybiB7J21hdERhdGVwaWNrZXJNaW4nOiB7J21pbic6IHRoaXMubWluLCAnYWN0dWFsJzogZW5kRGF0ZX19O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpKTtcbiAgICByZXR1cm4gKCF0aGlzLm1pbiB8fCAhY29udHJvbFZhbHVlIHx8XG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKHRoaXMubWluLCBjb250cm9sVmFsdWUpIDw9IDApID9cbiAgICAgICAgbnVsbCA6IHsnbWF0RGF0ZXBpY2tlck1pbic6IHsnbWluJzogdGhpcy5taW4sICdhY3R1YWwnOiBjb250cm9sVmFsdWV9fTtcbiAgfVxuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIG1heCBkYXRlLiAqL1xuICBwcml2YXRlIF9tYXhWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBpZiAodGhpcy5fZGF0ZXBpY2tlci5yYW5nZU1vZGUgJiYgY29udHJvbC52YWx1ZSkge1xuICAgICAgY29uc3QgYmVnaW5EYXRlID1cbiAgICAgICAgICB0aGlzLl9nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZS5iZWdpbikpO1xuICAgICAgY29uc3QgZW5kRGF0ZSA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlLmVuZCkpO1xuICAgICAgaWYgKHRoaXMubWF4KSB7XG4gICAgICAgIGlmIChiZWdpbkRhdGUgJiYgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUodGhpcy5tYXgsIGJlZ2luRGF0ZSkgPCAwICkge1xuICAgICAgICAgIHJldHVybiB7J21hdERhdGVwaWNrZXJNYXgnOiB7J21heCc6IHRoaXMubWF4LCAnYWN0dWFsJzogYmVnaW5EYXRlfX07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZERhdGUgJiYgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUodGhpcy5tYXgsIGVuZERhdGUpIDwgMCkge1xuICAgICAgICAgIHJldHVybiB7J21hdERhdGVwaWNrZXJNYXgnOiB7J21heCc6IHRoaXMubWF4LCAnYWN0dWFsJzogZW5kRGF0ZX19O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpKTtcbiAgICByZXR1cm4gKCF0aGlzLm1heCB8fCAhY29udHJvbFZhbHVlIHx8XG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKHRoaXMubWF4LCBjb250cm9sVmFsdWUpID49IDApID9cbiAgICAgICAgbnVsbCA6IHsnbWF0RGF0ZXBpY2tlck1heCc6IHsnbWF4JzogdGhpcy5tYXgsICdhY3R1YWwnOiBjb250cm9sVmFsdWV9fTtcbiAgfVxuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIGRhdGUgZmlsdGVyLiAqL1xuICBwcml2YXRlIF9maWx0ZXJWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBpZiAodGhpcy5fZGF0ZXBpY2tlci5yYW5nZU1vZGUgJiYgY29udHJvbC52YWx1ZSkge1xuICAgICAgY29uc3QgYmVnaW5EYXRlID1cbiAgICAgICAgICB0aGlzLl9nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZS5iZWdpbikpO1xuICAgICAgY29uc3QgZW5kRGF0ZSA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlLmVuZCkpO1xuICAgICAgcmV0dXJuICF0aGlzLl9kYXRlRmlsdGVyIHx8ICFiZWdpbkRhdGUgJiYgIWVuZERhdGUgfHxcbiAgICAgICAgICB0aGlzLl9kYXRlRmlsdGVyKGJlZ2luRGF0ZSkgJiYgdGhpcy5fZGF0ZUZpbHRlcihlbmREYXRlKSA/XG4gICAgICAgIG51bGwgOiB7J21hdERhdGVwaWNrZXJGaWx0ZXInOiB0cnVlfTtcbiAgICB9XG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpKTtcbiAgICByZXR1cm4gIXRoaXMuX2RhdGVGaWx0ZXIgfHwgIWNvbnRyb2xWYWx1ZSB8fCB0aGlzLl9kYXRlRmlsdGVyKGNvbnRyb2xWYWx1ZSkgP1xuICAgICAgICBudWxsIDogeydtYXREYXRlcGlja2VyRmlsdGVyJzogdHJ1ZX07XG4gIH1cblxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoZSBkYXRlIGZpbHRlci4gKi9cbiAgcHJpdmF0ZSBfcmFuZ2VWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBpZiAodGhpcy5fZGF0ZXBpY2tlci5yYW5nZU1vZGUgJiYgY29udHJvbC52YWx1ZSkge1xuICAgICAgY29uc3QgYmVnaW5EYXRlID1cbiAgICAgICAgICB0aGlzLl9nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZS5iZWdpbikpO1xuICAgICAgY29uc3QgZW5kRGF0ZSA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlLmVuZCkpO1xuICAgICAgcmV0dXJuICFiZWdpbkRhdGUgfHwgIWVuZERhdGUgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUoYmVnaW5EYXRlLCBlbmREYXRlKSA8PSAwID9cbiAgICAgICAgbnVsbCA6IHsnbWF0RGF0ZXBpY2tlclJhbmdlJzogdHJ1ZX07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBmb3JtIGNvbnRyb2wgdmFsaWRhdG9yIGZvciB0aGlzIGlucHV0LiAqL1xuICBwcml2YXRlIF92YWxpZGF0b3I6IFZhbGlkYXRvckZuIHwgbnVsbCA9XG4gICAgICBWYWxpZGF0b3JzLmNvbXBvc2UoXG4gICAgICAgICAgW3RoaXMuX3BhcnNlVmFsaWRhdG9yLCB0aGlzLl9taW5WYWxpZGF0b3IsIHRoaXMuX21heFZhbGlkYXRvcixcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclZhbGlkYXRvciwgdGhpcy5fcmFuZ2VWYWxpZGF0b3JdKTtcblxuICAvKiogV2hldGhlciB0aGUgbGFzdCB2YWx1ZSBzZXQgb24gdGhlIGlucHV0IHdhcyB2YWxpZC4gKi9cbiAgcHJpdmF0ZSBfbGFzdFZhbHVlVmFsaWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTElucHV0RWxlbWVudD4sXG4gICAgICBAT3B0aW9uYWwoKSBwdWJsaWMgX2RhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX0RBVEVfRk9STUFUUykgcHJpdmF0ZSBfZGF0ZUZvcm1hdHM6IE1hdERhdGVGb3JtYXRzLFxuICAgICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZm9ybUZpZWxkOiBNYXRGb3JtRmllbGQpIHtcbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyKSB7XG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignRGF0ZUFkYXB0ZXInKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9kYXRlRm9ybWF0cykge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ01BVF9EQVRFX0ZPUk1BVFMnKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXllZCBkYXRlIHdoZW4gdGhlIGxvY2FsZSBjaGFuZ2VzLlxuICAgIHRoaXMuX2xvY2FsZVN1YnNjcmlwdGlvbiA9IF9kYXRlQWRhcHRlci5sb2NhbGVDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2RhdGVwaWNrZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9sb2NhbGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl92YWx1ZUNoYW5nZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX2Rpc2FibGVkQ2hhbmdlLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fdmFsaWRhdG9yT25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIHZhbGlkYXRlKGM6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsaWRhdG9yID8gdGhpcy5fdmFsaWRhdG9yKGMpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wIFVzZSBgZ2V0Q29ubmVjdGVkT3ZlcmxheU9yaWdpbmAgaW5zdGVhZFxuICAgKi9cbiAgZ2V0UG9wdXBDb25uZWN0aW9uRWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZWxlbWVudCB0aGF0IHRoZSBkYXRlcGlja2VyIHBvcHVwIHNob3VsZCBiZSBjb25uZWN0ZWQgdG8uXG4gICAqIEByZXR1cm4gVGhlIGVsZW1lbnQgdG8gY29ubmVjdCB0aGUgcG9wdXAgdG8uXG4gICAqL1xuICBnZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luKCk6IEVsZW1lbnRSZWYge1xuICAgIHJldHVybiB0aGlzLl9mb3JtRmllbGQgPyB0aGlzLl9mb3JtRmllbGQuZ2V0Q29ubmVjdGVkT3ZlcmxheU9yaWdpbigpIDogdGhpcy5fZWxlbWVudFJlZjtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3JcbiAgd3JpdGVWYWx1ZSh2YWx1ZTogU2F0RGF0ZXBpY2tlclJhbmdlVmFsdWU8RD4gfCBEKTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9jdmFPbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICB9XG5cbiAgX29uS2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGNvbnN0IGlzQWx0RG93bkFycm93ID0gZXZlbnQuYWx0S2V5ICYmIGV2ZW50LmtleUNvZGUgPT09IERPV05fQVJST1c7XG5cbiAgICBpZiAodGhpcy5fZGF0ZXBpY2tlciAmJiBpc0FsdERvd25BcnJvdyAmJiAhdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlYWRPbmx5KSB7XG4gICAgICB0aGlzLl9kYXRlcGlja2VyLm9wZW4oKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgX29uSW5wdXQodmFsdWU6IHN0cmluZykge1xuICAgIGxldCBkYXRlOiBTYXREYXRlcGlja2VyUmFuZ2VWYWx1ZTxEPnxEfG51bGwgPSBudWxsO1xuICAgIGlmICh0aGlzLl9kYXRlcGlja2VyLnJhbmdlTW9kZSkge1xuICAgICAgY29uc3QgcGFydHMgPSB2YWx1ZS5zcGxpdCgnLScpO1xuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IE1hdGguZmxvb3IocGFydHMubGVuZ3RoIC8gMik7XG4gICAgICAgICAgY29uc3QgYmVnaW5EYXRlU3RyaW5nID0gcGFydHMuc2xpY2UoMCwgcG9zaXRpb24pLmpvaW4oJy0nKTtcbiAgICAgICAgICBjb25zdCBlbmREYXRlU3RyaW5nID0gcGFydHMuc2xpY2UocG9zaXRpb24pLmpvaW4oJy0nKTtcbiAgICAgICAgICBsZXQgYmVnaW5EYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIucGFyc2UoYmVnaW5EYXRlU3RyaW5nLFxuICAgICAgICAgICAgICB0aGlzLl9kYXRlRm9ybWF0cy5wYXJzZS5kYXRlSW5wdXQpO1xuICAgICAgICAgIGxldCBlbmREYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIucGFyc2UoZW5kRGF0ZVN0cmluZywgdGhpcy5fZGF0ZUZvcm1hdHMucGFyc2UuZGF0ZUlucHV0KTtcbiAgICAgICAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9ICFiZWdpbkRhdGUgfHwgIWVuZERhdGUgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuaXNWYWxpZChiZWdpbkRhdGUpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmlzVmFsaWQoZW5kRGF0ZSk7XG4gICAgICAgICAgYmVnaW5EYXRlID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKGJlZ2luRGF0ZSk7XG4gICAgICAgICAgZW5kRGF0ZSA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbChlbmREYXRlKTtcbiAgICAgICAgICBpZiAoYmVnaW5EYXRlICYmIGVuZERhdGUpIHtcbiAgICAgICAgICAgIGRhdGUgPSA8U2F0RGF0ZXBpY2tlclJhbmdlVmFsdWU8RD4+e2JlZ2luOiBiZWdpbkRhdGUsIGVuZDogZW5kRGF0ZX07XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIucGFyc2UodmFsdWUsIHRoaXMuX2RhdGVGb3JtYXRzLnBhcnNlLmRhdGVJbnB1dCk7XG4gICAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9ICFkYXRlIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmlzVmFsaWQoZGF0ZSk7XG4gICAgICBkYXRlID0gdGhpcy5fZ2V0VmFsaWREYXRlT3JOdWxsKGRhdGUpO1xuICAgIH1cbiAgICB0aGlzLl92YWx1ZSA9IGRhdGU7XG4gICAgdGhpcy5fY3ZhT25DaGFuZ2UoZGF0ZSk7XG4gICAgdGhpcy5fdmFsdWVDaGFuZ2UuZW1pdChkYXRlKTtcbiAgICB0aGlzLmRhdGVJbnB1dC5lbWl0KG5ldyBTYXREYXRlcGlja2VySW5wdXRFdmVudCh0aGlzLCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpKTtcbiAgfVxuXG4gIF9vbkNoYW5nZSgpIHtcbiAgICB0aGlzLmRhdGVDaGFuZ2UuZW1pdChuZXcgU2F0RGF0ZXBpY2tlcklucHV0RXZlbnQodGhpcywgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgcGFsZXR0ZSB1c2VkIGJ5IHRoZSBpbnB1dCdzIGZvcm0gZmllbGQsIGlmIGFueS4gKi9cbiAgX2dldFRoZW1lUGFsZXR0ZSgpOiBUaGVtZVBhbGV0dGUge1xuICAgIHJldHVybiB0aGlzLl9mb3JtRmllbGQgPyB0aGlzLl9mb3JtRmllbGQuY29sb3IgOiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKiogSGFuZGxlcyBibHVyIGV2ZW50cyBvbiB0aGUgaW5wdXQuICovXG4gIF9vbkJsdXIoKSB7XG4gICAgLy8gUmVmb3JtYXQgdGhlIGlucHV0IG9ubHkgaWYgd2UgaGF2ZSBhIHZhbGlkIHZhbHVlLlxuICAgIGlmICh0aGlzLnZhbHVlKSB7XG4gICAgICB0aGlzLl9mb3JtYXRWYWx1ZSh0aGlzLnZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgfVxuXG4gIC8qKiBGb3JtYXRzIGEgdmFsdWUgYW5kIHNldHMgaXQgb24gdGhlIGlucHV0IGVsZW1lbnQuICovXG4gIHByaXZhdGUgX2Zvcm1hdFZhbHVlKHZhbHVlOiBTYXREYXRlcGlja2VyUmFuZ2VWYWx1ZTxEPiB8IEQgfCBudWxsKSB7XG4gICAgICBpZiAodmFsdWUgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoJ2JlZ2luJykgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoJ2VuZCcpKSB7XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZSBhcyBTYXREYXRlcGlja2VyUmFuZ2VWYWx1ZTxEPjtcbiAgICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPVxuICAgICAgICAgICAgICB2YWx1ZSAmJiB2YWx1ZS5iZWdpbiAmJiB2YWx1ZS5lbmRcbiAgICAgICAgICAgICAgICAgID8gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KHZhbHVlLmJlZ2luLCB0aGlzLl9kYXRlRm9ybWF0cy5kaXNwbGF5LmRhdGVJbnB1dCkgK1xuICAgICAgICAgICAgICAgICAgJyAtICcgK1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KHZhbHVlLmVuZCwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5kYXRlSW5wdXQpXG4gICAgICAgICAgICAgICAgICA6ICcnXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgYXMgRCB8IG51bGxcbiAgICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPVxuICAgICAgICAgICAgICB2YWx1ZSA/IHRoaXMuX2RhdGVBZGFwdGVyLmZvcm1hdCh2YWx1ZSwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5kYXRlSW5wdXQpIDogJyc7XG4gICAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIG9iaiBUaGUgb2JqZWN0IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyBUaGUgZ2l2ZW4gb2JqZWN0IGlmIGl0IGlzIGJvdGggYSBkYXRlIGluc3RhbmNlIGFuZCB2YWxpZCwgb3RoZXJ3aXNlIG51bGwuXG4gICAqL1xuICBwcml2YXRlIF9nZXRWYWxpZERhdGVPck51bGwob2JqOiBhbnkpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuICh0aGlzLl9kYXRlQWRhcHRlci5pc0RhdGVJbnN0YW5jZShvYmopICYmIHRoaXMuX2RhdGVBZGFwdGVyLmlzVmFsaWQob2JqKSkgPyBvYmogOiBudWxsO1xuICB9XG59XG4iXX0=