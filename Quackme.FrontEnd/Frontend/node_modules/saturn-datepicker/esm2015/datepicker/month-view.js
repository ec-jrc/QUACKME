/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { DOWN_ARROW, END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW, SPACE, } from '@angular/cdk/keycodes';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, Optional, Output, ViewEncapsulation, ViewChild, } from '@angular/core';
import { DateAdapter } from '../datetime/date-adapter';
import { MAT_DATE_FORMATS } from '../datetime/date-formats';
import { Directionality } from '@angular/cdk/bidi';
import { SatCalendarBody, SatCalendarCell } from './calendar-body';
import { createMissingDateImplError } from './datepicker-errors';
const DAYS_PER_WEEK = 7;
/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
let SatMonthView = class SatMonthView {
    constructor(_changeDetectorRef, _dateFormats, _dateAdapter, _dir) {
        this._changeDetectorRef = _changeDetectorRef;
        this._dateFormats = _dateFormats;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        /** Allow selecting range of dates. */
        this.rangeMode = false;
        /** Enables datepicker MouseOver effect on range mode */
        this.rangeHoverEffect = true;
        /** Enables datepicker closing after selection */
        this.closeAfterSelection = true;
        /** Whenever full month is inside dates interval. */
        this._rangeFull = false;
        /** Emits when a new date is selected. */
        this.selectedChange = new EventEmitter();
        /** Emits when any date is selected. */
        this._userSelection = new EventEmitter();
        /** Emits when any date is activated. */
        this.activeDateChange = new EventEmitter();
        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }
        if (!this._dateFormats) {
            throw createMissingDateImplError('MAT_DATE_FORMATS');
        }
        this._activeDate = this._dateAdapter.today();
    }
    /** Current start of interval. */
    get beginDate() { return this._beginDate; }
    set beginDate(value) {
        this._beginDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
        this.updateRangeSpecificValues();
    }
    /** Current end of interval. */
    get endDate() { return this._endDate; }
    set endDate(value) {
        this._endDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
        this.updateRangeSpecificValues();
    }
    /** Whenever user already selected start of dates interval. */
    set beginDateSelected(value) { this._beginDateSelected = value; }
    ;
    /**
     * The date to display in this month view (everything other than the month and year is ignored).
     */
    get activeDate() { return this._activeDate; }
    set activeDate(value) {
        const oldActiveDate = this._activeDate;
        const validDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value)) || this._dateAdapter.today();
        this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
        if (!this._hasSameMonthAndYear(oldActiveDate, this._activeDate)) {
            this._init();
        }
    }
    /** The currently selected date. */
    get selected() { return this._selected; }
    set selected(value) {
        this._selected = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
        this._selectedDate = this._getDateInCurrentMonth(this._selected);
    }
    /** The minimum selectable date. */
    get minDate() { return this._minDate; }
    set minDate(value) {
        this._minDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    /** The maximum selectable date. */
    get maxDate() { return this._maxDate; }
    set maxDate(value) {
        this._maxDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    ngAfterContentInit() {
        this._init();
    }
    /** Handles when a new date is selected. */
    _dateSelected(date) {
        if (this.rangeMode) {
            const selectedYear = this._dateAdapter.getYear(this.activeDate);
            const selectedMonth = this._dateAdapter.getMonth(this.activeDate);
            const selectedDate = this._dateAdapter.createDate(selectedYear, selectedMonth, date);
            if (!this._beginDateSelected) { // At first click emit the same start and end of interval
                this._beginDateSelected = selectedDate;
                this.selectedChange.emit(selectedDate);
            }
            else {
                this._beginDateSelected = null;
                this.selectedChange.emit(selectedDate);
                this._userSelection.emit();
            }
            this._createWeekCells();
            this.activeDate = selectedDate;
            this._focusActiveCell();
        }
        else if (this._selectedDate != date) {
            const selectedYear = this._dateAdapter.getYear(this.activeDate);
            const selectedMonth = this._dateAdapter.getMonth(this.activeDate);
            const selectedDate = this._dateAdapter.createDate(selectedYear, selectedMonth, date);
            this.selectedChange.emit(selectedDate);
            this._userSelection.emit();
            this._createWeekCells();
        }
    }
    /** Handles keydown events on the calendar body when calendar is in month view. */
    _handleCalendarBodyKeydown(event) {
        // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
        // disabled ones from being selected. This may not be ideal, we should look into whether
        // navigation should skip over disabled dates, and if so, how to implement that efficiently.
        const oldActiveDate = this._activeDate;
        const isRtl = this._isRtl();
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -7);
                break;
            case DOWN_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 7);
                break;
            case HOME:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 1 - this._dateAdapter.getDate(this._activeDate));
                break;
            case END:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, (this._dateAdapter.getNumDaysInMonth(this._activeDate) -
                    this._dateAdapter.getDate(this._activeDate)));
                break;
            case PAGE_UP:
                this.activeDate = event.altKey ?
                    this._dateAdapter.addCalendarYears(this._activeDate, -1) :
                    this._dateAdapter.addCalendarMonths(this._activeDate, -1);
                break;
            case PAGE_DOWN:
                this.activeDate = event.altKey ?
                    this._dateAdapter.addCalendarYears(this._activeDate, 1) :
                    this._dateAdapter.addCalendarMonths(this._activeDate, 1);
                break;
            case ENTER:
            case SPACE:
                if (!this.dateFilter || this.dateFilter(this._activeDate)) {
                    this._dateSelected(this._dateAdapter.getDate(this._activeDate));
                    if (!this._beginDateSelected) {
                        this._userSelection.emit();
                    }
                    if (this._beginDateSelected || !this.closeAfterSelection) {
                        this._focusActiveCell();
                    }
                    // Prevent unexpected default actions such as form submission.
                    event.preventDefault();
                }
                return;
            default:
                // Don't prevent default or focus active cell on keys that we don't explicitly handle.
                return;
        }
        if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this.activeDate);
        }
        this._focusActiveCell();
        // Prevent unexpected default actions such as form submission.
        event.preventDefault();
    }
    /** Initializes this month view. */
    _init() {
        this.updateRangeSpecificValues();
        this._selectedDate = this._getDateInCurrentMonth(this.selected);
        this._todayDate = this._getDateInCurrentMonth(this._dateAdapter.today());
        this._monthLabel =
            this._dateAdapter.getMonthNames('short')[this._dateAdapter.getMonth(this.activeDate)]
                .toLocaleUpperCase();
        let firstOfMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), 1);
        this._firstWeekOffset =
            (DAYS_PER_WEEK + this._dateAdapter.getDayOfWeek(firstOfMonth) -
                this._dateAdapter.getFirstDayOfWeek()) % DAYS_PER_WEEK;
        this._initWeekdays();
        this._createWeekCells();
        this._changeDetectorRef.markForCheck();
    }
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell() {
        this._matCalendarBody._focusActiveCell();
    }
    /** Initializes the weekdays. */
    _initWeekdays() {
        const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
        const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
        const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');
        // Rotate the labels for days of the week based on the configured first day of the week.
        let weekdays = longWeekdays.map((long, i) => {
            return { long, narrow: narrowWeekdays[i] };
        });
        this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
    }
    /** Creates SatCalendarCells for the dates in this month. */
    _createWeekCells() {
        const daysInMonth = this._dateAdapter.getNumDaysInMonth(this.activeDate);
        const dateNames = this._dateAdapter.getDateNames();
        this._weeks = [[]];
        for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
            if (cell == DAYS_PER_WEEK) {
                this._weeks.push([]);
                cell = 0;
            }
            const date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), i + 1);
            const enabled = this._shouldEnableDate(date);
            const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);
            const cellClasses = this.dateClass ? this.dateClass(date) : undefined;
            this._weeks[this._weeks.length - 1]
                .push(new SatCalendarCell(i + 1, dateNames[i], ariaLabel, enabled, cellClasses));
        }
    }
    /** Date filter for the month */
    _shouldEnableDate(date) {
        return !!date &&
            (!this.dateFilter || this.dateFilter(date)) &&
            (!this.minDate || this._dateAdapter.compareDate(date, this.minDate) >= 0) &&
            (!this.maxDate || this._dateAdapter.compareDate(date, this.maxDate) <= 0);
    }
    /**
     * Gets the date in this month that the given Date falls on.
     * Returns null if the given Date is in another month.
     */
    _getDateInCurrentMonth(date) {
        return date && this._hasSameMonthAndYear(date, this.activeDate) ?
            this._dateAdapter.getDate(date) : null;
    }
    /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
    _hasSameMonthAndYear(d1, d2) {
        return !!(d1 && d2 && this._dateAdapter.getMonth(d1) == this._dateAdapter.getMonth(d2) &&
            this._dateAdapter.getYear(d1) == this._dateAdapter.getYear(d2));
    }
    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    _getValidDateOrNull(obj) {
        return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
    }
    /** Determines whether the user has the RTL layout direction. */
    _isRtl() {
        return this._dir && this._dir.value === 'rtl';
    }
    /** Updates range full parameter on each begin or end of interval update.
     * Necessary to display calendar-body correctly
     */
    updateRangeSpecificValues() {
        if (this.rangeMode) {
            this._beginDateNumber = this._getDateInCurrentMonth(this._beginDate);
            this._endDateNumber = this._getDateInCurrentMonth(this._endDate);
            this._rangeFull = this.beginDate && this.endDate && !this._beginDateNumber &&
                !this._endDateNumber &&
                this._dateAdapter.compareDate(this.beginDate, this.activeDate) <= 0 &&
                this._dateAdapter.compareDate(this.activeDate, this.endDate) <= 0;
        }
        else {
            this._beginDateNumber = this._endDateNumber = null;
            this._rangeFull = false;
        }
    }
};
SatMonthView.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_DATE_FORMATS,] }] },
    { type: DateAdapter, decorators: [{ type: Optional }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "beginDate", null);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "endDate", null);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "rangeMode", void 0);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "rangeHoverEffect", void 0);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "closeAfterSelection", void 0);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "beginDateSelected", null);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "activeDate", null);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "selected", null);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "minDate", null);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "maxDate", null);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "dateFilter", void 0);
tslib_1.__decorate([
    Input()
], SatMonthView.prototype, "dateClass", void 0);
tslib_1.__decorate([
    Output()
], SatMonthView.prototype, "selectedChange", void 0);
tslib_1.__decorate([
    Output()
], SatMonthView.prototype, "_userSelection", void 0);
tslib_1.__decorate([
    Output()
], SatMonthView.prototype, "activeDateChange", void 0);
tslib_1.__decorate([
    ViewChild(SatCalendarBody, { static: false })
], SatMonthView.prototype, "_matCalendarBody", void 0);
SatMonthView = tslib_1.__decorate([
    Component({
        moduleId: module.id,
        selector: 'sat-month-view',
        template: "<table class=\"mat-calendar-table\">\n  <thead class=\"mat-calendar-table-header\">\n    <tr><th *ngFor=\"let day of _weekdays\" [attr.aria-label]=\"day.long\">{{day.narrow}}</th></tr>\n    <tr><th class=\"mat-calendar-table-header-divider\" colspan=\"7\" aria-hidden=\"true\"></th></tr>\n  </thead>\n  <tbody sat-calendar-body\n         [label]=\"_monthLabel\"\n         [rows]=\"_weeks\"\n         [todayValue]=\"_todayDate\"\n         [selectedValue]=\"_selectedDate\"\n         [begin]=\"_beginDateNumber\"\n         [end]=\"_endDateNumber\"\n         [beginSelected]=\"_beginDateSelected\"\n         [isBeforeSelected]=\"_beginDateSelected && _dateAdapter.compareDate(activeDate, _beginDateSelected) < 0\"\n         [rangeFull]=\"_rangeFull\"\n         [rangeMode]=\"rangeMode\"\n         [rangeHoverEffect]=\"rangeHoverEffect\"\n         [labelMinRequiredCells]=\"3\"\n         [activeCell]=\"_dateAdapter.getDate(activeDate) - 1\"\n         (selectedValueChange)=\"_dateSelected($event)\"\n         (keydown)=\"_handleCalendarBodyKeydown($event)\">\n  </tbody>\n</table>\n",
        exportAs: 'matMonthView',
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush
    }),
    tslib_1.__param(1, Optional()), tslib_1.__param(1, Inject(MAT_DATE_FORMATS)),
    tslib_1.__param(2, Optional()),
    tslib_1.__param(3, Optional())
], SatMonthView);
export { SatMonthView };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9udGgtdmlldy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3NhdHVybi1kYXRlcGlja2VyLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9tb250aC12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsVUFBVSxFQUNWLEdBQUcsRUFDSCxLQUFLLEVBQ0wsSUFBSSxFQUNKLFVBQVUsRUFDVixTQUFTLEVBQ1QsT0FBTyxFQUNQLFdBQVcsRUFDWCxRQUFRLEVBQ1IsS0FBSyxHQUNOLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUNMLGdCQUFnQixFQUNoQix1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxnQkFBZ0IsRUFBaUIsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQTRCLE1BQU0saUJBQWlCLENBQUM7QUFDNUYsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFHL0QsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBR3hCOzs7R0FHRztBQVNILElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7SUE0SHZCLFlBQW9CLGtCQUFxQyxFQUNDLFlBQTRCLEVBQ3ZELFlBQTRCLEVBQzNCLElBQXFCO1FBSGpDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDQyxpQkFBWSxHQUFaLFlBQVksQ0FBZ0I7UUFDdkQsaUJBQVksR0FBWixZQUFZLENBQWdCO1FBQzNCLFNBQUksR0FB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O1FBQzlCLFFBQVEsRUFBRSxjQUFjO1FBQ3hCLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO1FBQ3JDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO0tBQ2hELENBQUM7SUE4SGEsbUJBQUEsUUFBUSxFQUFFLENBQUEsRUFBRSxtQkFBQSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNwQyxtQkFBQSxRQUFRLEVBQUUsQ0FBQTtJQUNWLG1CQUFBLFFBQVEsRUFBRSxDQUFBO0dBL0haLFlBQVksQ0FpV3hCO1NBaldZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgRE9XTl9BUlJPVyxcbiAgRU5ELFxuICBFTlRFUixcbiAgSE9NRSxcbiAgTEVGVF9BUlJPVyxcbiAgUEFHRV9ET1dOLFxuICBQQUdFX1VQLFxuICBSSUdIVF9BUlJPVyxcbiAgVVBfQVJST1csXG4gIFNQQUNFLFxufSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIFZpZXdDaGlsZCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RhdGVBZGFwdGVyfSBmcm9tICcuLi9kYXRldGltZS9kYXRlLWFkYXB0ZXInO1xuaW1wb3J0IHtNQVRfREFURV9GT1JNQVRTLCBNYXREYXRlRm9ybWF0c30gZnJvbSAnLi4vZGF0ZXRpbWUvZGF0ZS1mb3JtYXRzJztcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7U2F0Q2FsZW5kYXJCb2R5LCBTYXRDYWxlbmRhckNlbGwsIFNhdENhbGVuZGFyQ2VsbENzc0NsYXNzZXN9IGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5pbXBvcnQge2NyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yfSBmcm9tICcuL2RhdGVwaWNrZXItZXJyb3JzJztcblxuXG5jb25zdCBEQVlTX1BFUl9XRUVLID0gNztcblxuXG4vKipcbiAqIEFuIGludGVybmFsIGNvbXBvbmVudCB1c2VkIHRvIGRpc3BsYXkgYSBzaW5nbGUgbW9udGggaW4gdGhlIGRhdGVwaWNrZXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICBzZWxlY3RvcjogJ3NhdC1tb250aC12aWV3JyxcbiAgdGVtcGxhdGVVcmw6ICdtb250aC12aWV3Lmh0bWwnLFxuICBleHBvcnRBczogJ21hdE1vbnRoVmlldycsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIFNhdE1vbnRoVmlldzxEPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQge1xuXG4gIC8qKiBDdXJyZW50IHN0YXJ0IG9mIGludGVydmFsLiAqL1xuICBASW5wdXQoKVxuICBnZXQgYmVnaW5EYXRlKCk6IEQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX2JlZ2luRGF0ZTsgfVxuICBzZXQgYmVnaW5EYXRlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX2JlZ2luRGF0ZSA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICAgIHRoaXMudXBkYXRlUmFuZ2VTcGVjaWZpY1ZhbHVlcygpO1xuICB9XG4gIHByaXZhdGUgX2JlZ2luRGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIEN1cnJlbnQgZW5kIG9mIGludGVydmFsLiAqL1xuICBASW5wdXQoKVxuICBnZXQgZW5kRGF0ZSgpOiBEIHwgbnVsbCB7IHJldHVybiB0aGlzLl9lbmREYXRlOyB9XG4gIHNldCBlbmREYXRlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX2VuZERhdGUgPSB0aGlzLl9nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgICB0aGlzLnVwZGF0ZVJhbmdlU3BlY2lmaWNWYWx1ZXMoKTtcbiAgfVxuICBwcml2YXRlIF9lbmREYXRlOiBEIHwgbnVsbDtcblxuICAvKiogQWxsb3cgc2VsZWN0aW5nIHJhbmdlIG9mIGRhdGVzLiAqL1xuICBASW5wdXQoKSByYW5nZU1vZGUgPSBmYWxzZTtcblxuICAvKiogRW5hYmxlcyBkYXRlcGlja2VyIE1vdXNlT3ZlciBlZmZlY3Qgb24gcmFuZ2UgbW9kZSAqL1xuICBASW5wdXQoKSByYW5nZUhvdmVyRWZmZWN0ID0gdHJ1ZTtcblxuICAvKiogRW5hYmxlcyBkYXRlcGlja2VyIGNsb3NpbmcgYWZ0ZXIgc2VsZWN0aW9uICovXG4gIEBJbnB1dCgpIGNsb3NlQWZ0ZXJTZWxlY3Rpb24gPSB0cnVlO1xuXG4gIC8qKiBGaXJzdCBkYXkgb2YgaW50ZXJ2YWwuICovXG4gIF9iZWdpbkRhdGVOdW1iZXI6IG51bWJlciB8IG51bGw7XG5cbiAgLyogTGFzdCBkYXkgb2YgaW50ZXJ2YWwuICovXG4gIF9lbmREYXRlTnVtYmVyOiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBXaGVuZXZlciBmdWxsIG1vbnRoIGlzIGluc2lkZSBkYXRlcyBpbnRlcnZhbC4gKi9cbiAgX3JhbmdlRnVsbDogYm9vbGVhbiB8IG51bGwgPSBmYWxzZTtcblxuICAvKiogV2hlbmV2ZXIgdXNlciBhbHJlYWR5IHNlbGVjdGVkIHN0YXJ0IG9mIGRhdGVzIGludGVydmFsLiAqL1xuICBASW5wdXQoKSBzZXQgYmVnaW5EYXRlU2VsZWN0ZWQodmFsdWU6IEQgfCBudWxsKSB7IHRoaXMuX2JlZ2luRGF0ZVNlbGVjdGVkID0gdmFsdWUgfSA7XG5cbiAgLyoqIFdoZW5ldmVyIHVzZXIgYWxyZWFkeSBzZWxlY3RlZCBzdGFydCBvZiBkYXRlcyBpbnRlcnZhbC4gQW4gaW5uZXIgcHJvcGVydHkgdGhhdCBhdm9pZCBhc3luY2hyb25vdXMgcHJvYmxlbXMgKi9cbiAgX2JlZ2luRGF0ZVNlbGVjdGVkOiBEIHwgbnVsbDtcblxuICAvKipcbiAgICogVGhlIGRhdGUgdG8gZGlzcGxheSBpbiB0aGlzIG1vbnRoIHZpZXcgKGV2ZXJ5dGhpbmcgb3RoZXIgdGhhbiB0aGUgbW9udGggYW5kIHllYXIgaXMgaWdub3JlZCkuXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgYWN0aXZlRGF0ZSgpOiBEIHsgcmV0dXJuIHRoaXMuX2FjdGl2ZURhdGU7IH1cbiAgc2V0IGFjdGl2ZURhdGUodmFsdWU6IEQpIHtcbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcbiAgICBjb25zdCB2YWxpZERhdGUgPVxuICAgICAgICB0aGlzLl9nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKSB8fCB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xuICAgIHRoaXMuX2FjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jbGFtcERhdGUodmFsaWREYXRlLCB0aGlzLm1pbkRhdGUsIHRoaXMubWF4RGF0ZSk7XG4gICAgaWYgKCF0aGlzLl9oYXNTYW1lTW9udGhBbmRZZWFyKG9sZEFjdGl2ZURhdGUsIHRoaXMuX2FjdGl2ZURhdGUpKSB7XG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2FjdGl2ZURhdGU6IEQ7XG5cbiAgLyoqIFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHNlbGVjdGVkKCk6IEQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX3NlbGVjdGVkOyB9XG4gIHNldCBzZWxlY3RlZCh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICAgIHRoaXMuX3NlbGVjdGVkRGF0ZSA9IHRoaXMuX2dldERhdGVJbkN1cnJlbnRNb250aCh0aGlzLl9zZWxlY3RlZCk7XG4gIH1cbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWluaW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW5EYXRlKCk6IEQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX21pbkRhdGU7IH1cbiAgc2V0IG1pbkRhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWluRGF0ZSA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21pbkRhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWF4aW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhEYXRlKCk6IEQgfCBudWxsIHsgcmV0dXJuIHRoaXMuX21heERhdGU7IH1cbiAgc2V0IG1heERhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWF4RGF0ZSA9IHRoaXMuX2dldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21heERhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIGZpbHRlciB3aGljaCBkYXRlcyBhcmUgc2VsZWN0YWJsZS4gKi9cbiAgQElucHV0KCkgZGF0ZUZpbHRlcjogKGRhdGU6IEQpID0+IGJvb2xlYW47XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gYWRkIGN1c3RvbSBDU1MgY2xhc3NlcyB0byBkYXRlcy4gKi9cbiAgQElucHV0KCkgZGF0ZUNsYXNzOiAoZGF0ZTogRCkgPT4gU2F0Q2FsZW5kYXJDZWxsQ3NzQ2xhc3NlcztcblxuICAvKiogRW1pdHMgd2hlbiBhIG5ldyBkYXRlIGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0ZWRDaGFuZ2U6IEV2ZW50RW1pdHRlcjxEIHwgbnVsbD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQgfCBudWxsPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFueSBkYXRlIGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX3VzZXJTZWxlY3Rpb246IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbnkgZGF0ZSBpcyBhY3RpdmF0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBhY3RpdmVEYXRlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqIFRoZSBib2R5IG9mIGNhbGVuZGFyIHRhYmxlICovXG4gIEBWaWV3Q2hpbGQoU2F0Q2FsZW5kYXJCb2R5LCB7c3RhdGljOiBmYWxzZX0pIF9tYXRDYWxlbmRhckJvZHk6IFNhdENhbGVuZGFyQm9keTtcblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGlzIG1vbnRoIChlLmcuIFwiSmFudWFyeSAyMDE3XCIpLiAqL1xuICBfbW9udGhMYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBHcmlkIG9mIGNhbGVuZGFyIGNlbGxzIHJlcHJlc2VudGluZyB0aGUgZGF0ZXMgb2YgdGhlIG1vbnRoLiAqL1xuICBfd2Vla3M6IFNhdENhbGVuZGFyQ2VsbFtdW107XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgYmxhbmsgY2VsbHMgaW4gdGhlIGZpcnN0IHJvdyBiZWZvcmUgdGhlIDFzdCBvZiB0aGUgbW9udGguICovXG4gIF9maXJzdFdlZWtPZmZzZXQ6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGRhdGUgb2YgdGhlIG1vbnRoIHRoYXQgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBEYXRlIGZhbGxzIG9uLlxuICAgKiBOdWxsIGlmIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgRGF0ZSBpcyBpbiBhbm90aGVyIG1vbnRoLlxuICAgKi9cbiAgX3NlbGVjdGVkRGF0ZTogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogVGhlIGRhdGUgb2YgdGhlIG1vbnRoIHRoYXQgdG9kYXkgZmFsbHMgb24uIE51bGwgaWYgdG9kYXkgaXMgaW4gYW5vdGhlciBtb250aC4gKi9cbiAgX3RvZGF5RGF0ZTogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogVGhlIG5hbWVzIG9mIHRoZSB3ZWVrZGF5cy4gKi9cbiAgX3dlZWtkYXlzOiB7bG9uZzogc3RyaW5nLCBuYXJyb3c6IHN0cmluZ31bXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX0RBVEVfRk9STUFUUykgcHJpdmF0ZSBfZGF0ZUZvcm1hdHM6IE1hdERhdGVGb3JtYXRzLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBwdWJsaWMgX2RhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyPzogRGlyZWN0aW9uYWxpdHkpIHtcbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyKSB7XG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignRGF0ZUFkYXB0ZXInKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9kYXRlRm9ybWF0cykge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ01BVF9EQVRFX0ZPUk1BVFMnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyB3aGVuIGEgbmV3IGRhdGUgaXMgc2VsZWN0ZWQuICovXG4gIF9kYXRlU2VsZWN0ZWQoZGF0ZTogbnVtYmVyKSB7XG5cbiAgICBpZiAodGhpcy5yYW5nZU1vZGUpIHtcblxuICAgICAgY29uc3Qgc2VsZWN0ZWRZZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpO1xuICAgICAgY29uc3Qgc2VsZWN0ZWRNb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgICBjb25zdCBzZWxlY3RlZERhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKHNlbGVjdGVkWWVhciwgc2VsZWN0ZWRNb250aCwgZGF0ZSk7XG4gICAgICBpZiAoIXRoaXMuX2JlZ2luRGF0ZVNlbGVjdGVkKSB7IC8vIEF0IGZpcnN0IGNsaWNrIGVtaXQgdGhlIHNhbWUgc3RhcnQgYW5kIGVuZCBvZiBpbnRlcnZhbFxuICAgICAgICB0aGlzLl9iZWdpbkRhdGVTZWxlY3RlZCA9IHNlbGVjdGVkRGF0ZTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KHNlbGVjdGVkRGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9iZWdpbkRhdGVTZWxlY3RlZCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDaGFuZ2UuZW1pdChzZWxlY3RlZERhdGUpO1xuICAgICAgICB0aGlzLl91c2VyU2VsZWN0aW9uLmVtaXQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NyZWF0ZVdlZWtDZWxscygpO1xuICAgICAgdGhpcy5hY3RpdmVEYXRlID0gc2VsZWN0ZWREYXRlO1xuICAgICAgdGhpcy5fZm9jdXNBY3RpdmVDZWxsKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9zZWxlY3RlZERhdGUgIT0gZGF0ZSkge1xuXG4gICAgICBjb25zdCBzZWxlY3RlZFllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgICBjb25zdCBzZWxlY3RlZE1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5hY3RpdmVEYXRlKTtcbiAgICAgIGNvbnN0IHNlbGVjdGVkRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoc2VsZWN0ZWRZZWFyLCBzZWxlY3RlZE1vbnRoLCBkYXRlKTtcblxuICAgICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KHNlbGVjdGVkRGF0ZSk7XG4gICAgICB0aGlzLl91c2VyU2VsZWN0aW9uLmVtaXQoKTtcbiAgICAgIHRoaXMuX2NyZWF0ZVdlZWtDZWxscygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGtleWRvd24gZXZlbnRzIG9uIHRoZSBjYWxlbmRhciBib2R5IHdoZW4gY2FsZW5kYXIgaXMgaW4gbW9udGggdmlldy4gKi9cbiAgX2hhbmRsZUNhbGVuZGFyQm9keUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBUT0RPKG1tYWxlcmJhKTogV2UgY3VycmVudGx5IGFsbG93IGtleWJvYXJkIG5hdmlnYXRpb24gdG8gZGlzYWJsZWQgZGF0ZXMsIGJ1dCBqdXN0IHByZXZlbnRcbiAgICAvLyBkaXNhYmxlZCBvbmVzIGZyb20gYmVpbmcgc2VsZWN0ZWQuIFRoaXMgbWF5IG5vdCBiZSBpZGVhbCwgd2Ugc2hvdWxkIGxvb2sgaW50byB3aGV0aGVyXG4gICAgLy8gbmF2aWdhdGlvbiBzaG91bGQgc2tpcCBvdmVyIGRpc2FibGVkIGRhdGVzLCBhbmQgaWYgc28sIGhvdyB0byBpbXBsZW1lbnQgdGhhdCBlZmZpY2llbnRseS5cblxuICAgIGNvbnN0IG9sZEFjdGl2ZURhdGUgPSB0aGlzLl9hY3RpdmVEYXRlO1xuICAgIGNvbnN0IGlzUnRsID0gdGhpcy5faXNSdGwoKTtcblxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXModGhpcy5fYWN0aXZlRGF0ZSwgaXNSdGwgPyAxIDogLTEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0aGlzLl9hY3RpdmVEYXRlLCBpc1J0bCA/IC0xIDogMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRoaXMuX2FjdGl2ZURhdGUsIC03KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERPV05fQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0aGlzLl9hY3RpdmVEYXRlLCA3KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEhPTUU6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0aGlzLl9hY3RpdmVEYXRlLFxuICAgICAgICAgICAgMSAtIHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUodGhpcy5fYWN0aXZlRGF0ZSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRU5EOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXModGhpcy5fYWN0aXZlRGF0ZSxcbiAgICAgICAgICAgICh0aGlzLl9kYXRlQWRhcHRlci5nZXROdW1EYXlzSW5Nb250aCh0aGlzLl9hY3RpdmVEYXRlKSAtXG4gICAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUodGhpcy5fYWN0aXZlRGF0ZSkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBBR0VfVVA6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IGV2ZW50LmFsdEtleSA/XG4gICAgICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKHRoaXMuX2FjdGl2ZURhdGUsIC0xKSA6XG4gICAgICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLl9hY3RpdmVEYXRlLCAtMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQQUdFX0RPV046XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IGV2ZW50LmFsdEtleSA/XG4gICAgICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKHRoaXMuX2FjdGl2ZURhdGUsIDEpIDpcbiAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRoaXMuX2FjdGl2ZURhdGUsIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICBjYXNlIFNQQUNFOlxuICAgICAgICBpZiAoIXRoaXMuZGF0ZUZpbHRlciB8fCB0aGlzLmRhdGVGaWx0ZXIodGhpcy5fYWN0aXZlRGF0ZSkpIHtcbiAgICAgICAgICB0aGlzLl9kYXRlU2VsZWN0ZWQodGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF0ZSh0aGlzLl9hY3RpdmVEYXRlKSk7XG4gICAgICAgICAgaWYgKCF0aGlzLl9iZWdpbkRhdGVTZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5fdXNlclNlbGVjdGlvbi5lbWl0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLl9iZWdpbkRhdGVTZWxlY3RlZCB8fCAhdGhpcy5jbG9zZUFmdGVyU2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9mb2N1c0FjdGl2ZUNlbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUHJldmVudCB1bmV4cGVjdGVkIGRlZmF1bHQgYWN0aW9ucyBzdWNoIGFzIGZvcm0gc3VibWlzc2lvbi5cbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIERvbid0IHByZXZlbnQgZGVmYXVsdCBvciBmb2N1cyBhY3RpdmUgY2VsbCBvbiBrZXlzIHRoYXQgd2UgZG9uJ3QgZXhwbGljaXRseSBoYW5kbGUuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUob2xkQWN0aXZlRGF0ZSwgdGhpcy5hY3RpdmVEYXRlKSkge1xuICAgICAgdGhpcy5hY3RpdmVEYXRlQ2hhbmdlLmVtaXQodGhpcy5hY3RpdmVEYXRlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9mb2N1c0FjdGl2ZUNlbGwoKTtcbiAgICAvLyBQcmV2ZW50IHVuZXhwZWN0ZWQgZGVmYXVsdCBhY3Rpb25zIHN1Y2ggYXMgZm9ybSBzdWJtaXNzaW9uLlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICAvKiogSW5pdGlhbGl6ZXMgdGhpcyBtb250aCB2aWV3LiAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLnVwZGF0ZVJhbmdlU3BlY2lmaWNWYWx1ZXMoKTtcbiAgICB0aGlzLl9zZWxlY3RlZERhdGUgPSB0aGlzLl9nZXREYXRlSW5DdXJyZW50TW9udGgodGhpcy5zZWxlY3RlZCk7XG4gICAgdGhpcy5fdG9kYXlEYXRlID0gdGhpcy5fZ2V0RGF0ZUluQ3VycmVudE1vbnRoKHRoaXMuX2RhdGVBZGFwdGVyLnRvZGF5KCkpO1xuICAgIHRoaXMuX21vbnRoTGFiZWwgPVxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aE5hbWVzKCdzaG9ydCcpW3RoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuYWN0aXZlRGF0ZSldXG4gICAgICAgICAgICAudG9Mb2NhbGVVcHBlckNhc2UoKTtcblxuICAgIGxldCBmaXJzdE9mTW9udGggPSB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5hY3RpdmVEYXRlKSwgMSk7XG4gICAgdGhpcy5fZmlyc3RXZWVrT2Zmc2V0ID1cbiAgICAgICAgKERBWVNfUEVSX1dFRUsgKyB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXlPZldlZWsoZmlyc3RPZk1vbnRoKSAtXG4gICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRGaXJzdERheU9mV2VlaygpKSAlIERBWVNfUEVSX1dFRUs7XG5cbiAgICB0aGlzLl9pbml0V2Vla2RheXMoKTtcbiAgICB0aGlzLl9jcmVhdGVXZWVrQ2VsbHMoKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xuICBfZm9jdXNBY3RpdmVDZWxsKCkge1xuICAgIHRoaXMuX21hdENhbGVuZGFyQm9keS5fZm9jdXNBY3RpdmVDZWxsKCk7XG4gIH1cblxuICAvKiogSW5pdGlhbGl6ZXMgdGhlIHdlZWtkYXlzLiAqL1xuICBwcml2YXRlIF9pbml0V2Vla2RheXMoKSB7XG4gICAgY29uc3QgZmlyc3REYXlPZldlZWsgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRGaXJzdERheU9mV2VlaygpO1xuICAgIGNvbnN0IG5hcnJvd1dlZWtkYXlzID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF5T2ZXZWVrTmFtZXMoJ25hcnJvdycpO1xuICAgIGNvbnN0IGxvbmdXZWVrZGF5cyA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldERheU9mV2Vla05hbWVzKCdsb25nJyk7XG5cbiAgICAvLyBSb3RhdGUgdGhlIGxhYmVscyBmb3IgZGF5cyBvZiB0aGUgd2VlayBiYXNlZCBvbiB0aGUgY29uZmlndXJlZCBmaXJzdCBkYXkgb2YgdGhlIHdlZWsuXG4gICAgbGV0IHdlZWtkYXlzID0gbG9uZ1dlZWtkYXlzLm1hcCgobG9uZywgaSkgPT4ge1xuICAgICAgICByZXR1cm4ge2xvbmcsIG5hcnJvdzogbmFycm93V2Vla2RheXNbaV19O1xuICAgIH0pO1xuICAgIHRoaXMuX3dlZWtkYXlzID0gd2Vla2RheXMuc2xpY2UoZmlyc3REYXlPZldlZWspLmNvbmNhdCh3ZWVrZGF5cy5zbGljZSgwLCBmaXJzdERheU9mV2VlaykpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgU2F0Q2FsZW5kYXJDZWxscyBmb3IgdGhlIGRhdGVzIGluIHRoaXMgbW9udGguICovXG4gIHByaXZhdGUgX2NyZWF0ZVdlZWtDZWxscygpIHtcbiAgICBjb25zdCBkYXlzSW5Nb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE51bURheXNJbk1vbnRoKHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgY29uc3QgZGF0ZU5hbWVzID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF0ZU5hbWVzKCk7XG4gICAgdGhpcy5fd2Vla3MgPSBbW11dO1xuICAgIGZvciAobGV0IGkgPSAwLCBjZWxsID0gdGhpcy5fZmlyc3RXZWVrT2Zmc2V0OyBpIDwgZGF5c0luTW9udGg7IGkrKywgY2VsbCsrKSB7XG4gICAgICBpZiAoY2VsbCA9PSBEQVlTX1BFUl9XRUVLKSB7XG4gICAgICAgIHRoaXMuX3dlZWtzLnB1c2goW10pO1xuICAgICAgICBjZWxsID0gMDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKFxuICAgICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpLFxuICAgICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5hY3RpdmVEYXRlKSwgaSArIDEpO1xuICAgICAgY29uc3QgZW5hYmxlZCA9IHRoaXMuX3Nob3VsZEVuYWJsZURhdGUoZGF0ZSk7XG4gICAgICBjb25zdCBhcmlhTGFiZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5mb3JtYXQoZGF0ZSwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5kYXRlQTExeUxhYmVsKTtcbiAgICAgIGNvbnN0IGNlbGxDbGFzc2VzID0gdGhpcy5kYXRlQ2xhc3MgPyB0aGlzLmRhdGVDbGFzcyhkYXRlKSA6IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy5fd2Vla3NbdGhpcy5fd2Vla3MubGVuZ3RoIC0gMV1cbiAgICAgICAgICAucHVzaChuZXcgU2F0Q2FsZW5kYXJDZWxsKGkgKyAxLCBkYXRlTmFtZXNbaV0sIGFyaWFMYWJlbCwgZW5hYmxlZCwgY2VsbENsYXNzZXMpKTtcbiAgICB9XG4gIH1cblxuICAvKiogRGF0ZSBmaWx0ZXIgZm9yIHRoZSBtb250aCAqL1xuICBwcml2YXRlIF9zaG91bGRFbmFibGVEYXRlKGRhdGU6IEQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISFkYXRlICYmXG4gICAgICAgICghdGhpcy5kYXRlRmlsdGVyIHx8IHRoaXMuZGF0ZUZpbHRlcihkYXRlKSkgJiZcbiAgICAgICAgKCF0aGlzLm1pbkRhdGUgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUoZGF0ZSwgdGhpcy5taW5EYXRlKSA+PSAwKSAmJlxuICAgICAgICAoIXRoaXMubWF4RGF0ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShkYXRlLCB0aGlzLm1heERhdGUpIDw9IDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGRhdGUgaW4gdGhpcyBtb250aCB0aGF0IHRoZSBnaXZlbiBEYXRlIGZhbGxzIG9uLlxuICAgKiBSZXR1cm5zIG51bGwgaWYgdGhlIGdpdmVuIERhdGUgaXMgaW4gYW5vdGhlciBtb250aC5cbiAgICovXG4gIHByaXZhdGUgX2dldERhdGVJbkN1cnJlbnRNb250aChkYXRlOiBEIHwgbnVsbCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiBkYXRlICYmIHRoaXMuX2hhc1NhbWVNb250aEFuZFllYXIoZGF0ZSwgdGhpcy5hY3RpdmVEYXRlKSA/XG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUoZGF0ZSkgOiBudWxsO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSAyIGRhdGVzIGFyZSBub24tbnVsbCBhbmQgZmFsbCB3aXRoaW4gdGhlIHNhbWUgbW9udGggb2YgdGhlIHNhbWUgeWVhci4gKi9cbiAgcHJpdmF0ZSBfaGFzU2FtZU1vbnRoQW5kWWVhcihkMTogRCB8IG51bGwsIGQyOiBEIHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShkMSAmJiBkMiAmJiB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aChkMSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZDIpICYmXG4gICAgICAgICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZDEpID09IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZDIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIFRoZSBnaXZlbiBvYmplY3QgaWYgaXQgaXMgYm90aCBhIGRhdGUgaW5zdGFuY2UgYW5kIHZhbGlkLCBvdGhlcndpc2UgbnVsbC5cbiAgICovXG4gIHByaXZhdGUgX2dldFZhbGlkRGF0ZU9yTnVsbChvYmo6IGFueSk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gKHRoaXMuX2RhdGVBZGFwdGVyLmlzRGF0ZUluc3RhbmNlKG9iaikgJiYgdGhpcy5fZGF0ZUFkYXB0ZXIuaXNWYWxpZChvYmopKSA/IG9iaiA6IG51bGw7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB1c2VyIGhhcyB0aGUgUlRMIGxheW91dCBkaXJlY3Rpb24uICovXG4gIHByaXZhdGUgX2lzUnRsKCkge1xuICAgIHJldHVybiB0aGlzLl9kaXIgJiYgdGhpcy5fZGlyLnZhbHVlID09PSAncnRsJztcbiAgfVxuICAvKiogVXBkYXRlcyByYW5nZSBmdWxsIHBhcmFtZXRlciBvbiBlYWNoIGJlZ2luIG9yIGVuZCBvZiBpbnRlcnZhbCB1cGRhdGUuXG4gICAqIE5lY2Vzc2FyeSB0byBkaXNwbGF5IGNhbGVuZGFyLWJvZHkgY29ycmVjdGx5XG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZVJhbmdlU3BlY2lmaWNWYWx1ZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucmFuZ2VNb2RlKSB7XG4gICAgICB0aGlzLl9iZWdpbkRhdGVOdW1iZXIgPSB0aGlzLl9nZXREYXRlSW5DdXJyZW50TW9udGgodGhpcy5fYmVnaW5EYXRlKTtcbiAgICAgIHRoaXMuX2VuZERhdGVOdW1iZXIgPSB0aGlzLl9nZXREYXRlSW5DdXJyZW50TW9udGgodGhpcy5fZW5kRGF0ZSk7XG4gICAgICB0aGlzLl9yYW5nZUZ1bGwgPSB0aGlzLmJlZ2luRGF0ZSAmJiB0aGlzLmVuZERhdGUgJiYgIXRoaXMuX2JlZ2luRGF0ZU51bWJlciAmJlxuICAgICAgICAhdGhpcy5fZW5kRGF0ZU51bWJlciAmJlxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZSh0aGlzLmJlZ2luRGF0ZSwgdGhpcy5hY3RpdmVEYXRlKSA8PSAwICYmXG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5lbmREYXRlKSA8PSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9iZWdpbkRhdGVOdW1iZXIgPSB0aGlzLl9lbmREYXRlTnVtYmVyID0gbnVsbDtcbiAgICAgIHRoaXMuX3JhbmdlRnVsbCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufVxuIl19