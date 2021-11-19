/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation, NgZone, OnChanges, SimpleChanges, } from '@angular/core';
import { take } from 'rxjs/operators';
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export class SatCalendarCell {
    constructor(value, displayValue, ariaLabel, enabled, cssClasses) {
        this.value = value;
        this.displayValue = displayValue;
        this.ariaLabel = ariaLabel;
        this.enabled = enabled;
        this.cssClasses = cssClasses;
    }
}
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
let SatCalendarBody = class SatCalendarBody {
    constructor(_elementRef, _ngZone) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        /** Enables datepicker MouseOver effect on range mode */
        this.rangeHoverEffect = true;
        /** Whether to use date range selection behaviour.*/
        this.rangeMode = false;
        /** The number of columns in the table. */
        this.numCols = 7;
        /** The cell number of the active cell in the table. */
        this.activeCell = 0;
        /**
         * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
         * maintained even as the table resizes.
         */
        this.cellAspectRatio = 1;
        /** Emits when a new value is selected. */
        this.selectedValueChange = new EventEmitter();
    }
    _cellClicked(cell) {
        if (cell.enabled) {
            this.selectedValueChange.emit(cell.value);
        }
    }
    _mouseOverCell(cell) {
        if (this.rangeHoverEffect)
            this._cellOver = cell.value;
    }
    ngOnChanges(changes) {
        const columnChanges = changes['numCols'];
        const { rows, numCols } = this;
        if (changes['rows'] || columnChanges) {
            this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
        }
        if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
            this._cellPadding = `${50 * this.cellAspectRatio / numCols}%`;
        }
        if (columnChanges || !this._cellWidth) {
            this._cellWidth = `${100 / numCols}%`;
        }
        if (changes.activeCell) {
            this._cellOver = this.activeCell + 1;
        }
    }
    _isActiveCell(rowIndex, colIndex) {
        let cellNumber = rowIndex * this.numCols + colIndex;
        // Account for the fact that the first row may not have as many cells.
        if (rowIndex) {
            cellNumber -= this._firstRowOffset;
        }
        return cellNumber == this.activeCell;
    }
    /** Whenever to mark cell as semi-selected (inside dates interval). */
    _isSemiSelected(date) {
        if (!this.rangeMode) {
            return false;
        }
        if (this.rangeFull) {
            return true;
        }
        /** Do not mark start and end of interval. */
        if (date === this.begin || date === this.end) {
            return false;
        }
        if (this.begin && !this.end) {
            return date > this.begin;
        }
        if (this.end && !this.begin) {
            return date < this.end;
        }
        return date > this.begin && date < this.end;
    }
    /** Whenever to mark cell as semi-selected before the second date is selected (between the begin cell and the hovered cell). */
    _isBetweenOverAndBegin(date) {
        if (!this._cellOver || !this.rangeMode || !this.beginSelected) {
            return false;
        }
        if (this.isBeforeSelected && !this.begin) {
            return date > this._cellOver;
        }
        if (this._cellOver > this.begin) {
            return date > this.begin && date < this._cellOver;
        }
        if (this._cellOver < this.begin) {
            return date < this.begin && date > this._cellOver;
        }
        return false;
    }
    /** Whenever to mark cell as begin of the range. */
    _isBegin(date) {
        if (this.rangeMode && this.beginSelected && this._cellOver) {
            if (this.isBeforeSelected && !this.begin) {
                return this._cellOver === date;
            }
            else {
                return (this.begin === date && !(this._cellOver < this.begin)) ||
                    (this._cellOver === date && this._cellOver < this.begin);
            }
        }
        return this.begin === date;
    }
    /** Whenever to mark cell as end of the range. */
    _isEnd(date) {
        if (this.rangeMode && this.beginSelected && this._cellOver) {
            if (this.isBeforeSelected && !this.begin) {
                return false;
            }
            else {
                return (this.end === date && !(this._cellOver > this.begin)) ||
                    (this._cellOver === date && this._cellOver > this.begin);
            }
        }
        return this.end === date;
    }
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell() {
        this._ngZone.runOutsideAngular(() => {
            this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
                const activeCell = this._elementRef.nativeElement.querySelector('.mat-calendar-body-active');
                if (activeCell) {
                    activeCell.focus();
                }
            });
        });
    }
    /** Whenever to highlight the target cell when selecting the second date in range mode */
    _previewCellOver(date) {
        return this._cellOver === date && this.rangeMode && this.beginSelected;
    }
};
SatCalendarBody.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone }
];
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "label", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "rangeHoverEffect", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "rows", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "todayValue", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "selectedValue", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "begin", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "end", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "beginSelected", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "isBeforeSelected", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "rangeFull", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "rangeMode", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "labelMinRequiredCells", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "numCols", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "activeCell", void 0);
tslib_1.__decorate([
    Input()
], SatCalendarBody.prototype, "cellAspectRatio", void 0);
tslib_1.__decorate([
    Output()
], SatCalendarBody.prototype, "selectedValueChange", void 0);
SatCalendarBody = tslib_1.__decorate([
    Component({
        moduleId: module.id,
        selector: '[sat-calendar-body]',
        template: "<!--\n  If there's not enough space in the first row, create a separate label row. We mark this row as\n  aria-hidden because we don't want it to be read out as one of the weeks in the month.\n-->\n<tr *ngIf=\"_firstRowOffset < labelMinRequiredCells\" aria-hidden=\"true\">\n  <td class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"numCols\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{label}}\n  </td>\n</tr>\n\n<!-- Create the first row separately so we can include a special spacer cell. -->\n<tr *ngFor=\"let row of rows; let rowIndex = index\" role=\"row\">\n  <!--\n    We mark this cell as aria-hidden so it doesn't get read out as one of the days in the week.\n    The aspect ratio of the table cells is maintained by setting the top and bottom padding as a\n    percentage of the width (a variant of the trick described here:\n    https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n  -->\n  <td *ngIf=\"rowIndex === 0 && _firstRowOffset\"\n      aria-hidden=\"true\"\n      class=\"mat-calendar-body-label\"\n      [attr.colspan]=\"_firstRowOffset\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    {{_firstRowOffset >= labelMinRequiredCells ? label : ''}}\n  </td>\n  <td *ngFor=\"let item of row; let colIndex = index\"\n      role=\"gridcell\"\n      class=\"mat-calendar-body-cell\"\n      [ngClass]=\"item.cssClasses\"\n      [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n      [class.mat-calendar-body-disabled]=\"!item.enabled\"\n      [class.mat-calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n      [class.mat-calendar-body-begin-range]=\"_isBegin(item.value)\"\n      [class.mat-calendar-body-end-range]=\"_isEnd(item.value)\"\n      [class.mat-calendar-cell-semi-selected]=\"_isSemiSelected(item.value) || _isBetweenOverAndBegin(item.value)\"\n      [class.mat-calendar-cell-over]=\"_previewCellOver(item.value)\"\n      [attr.aria-label]=\"item.ariaLabel\"\n      [attr.aria-disabled]=\"!item.enabled || null\"\n      [attr.aria-selected]=\"selectedValue === item.value\"\n      (click)=\"_cellClicked(item)\"\n      (mouseover)=\"_mouseOverCell(item)\"\n      [style.width]=\"_cellWidth\"\n      [style.paddingTop]=\"_cellPadding\"\n      [style.paddingBottom]=\"_cellPadding\">\n    <div class=\"mat-calendar-body-cell-content\"\n         [class.mat-calendar-body-selected]=\"begin === item.value || end === item.value || selectedValue === item.value\"\n         [class.mat-calendar-body-semi-selected]=\"_isSemiSelected(item.value)\"\n         [class.mat-calendar-body-today]=\"todayValue === item.value\">\n      {{item.displayValue}}\n    </div>\n  </td>\n</tr>\n",
        host: {
            'class': 'mat-calendar-body',
            'role': 'grid',
            'aria-readonly': 'true'
        },
        exportAs: 'matCalendarBody',
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush,
        styles: [".mat-calendar-body{min-width:224px}.mat-calendar-body-label{height:0;line-height:0;text-align:left;padding-left:4.71429%;padding-right:4.71429%}.mat-calendar-body-cell{position:relative;height:0;line-height:0;text-align:center;outline:0;cursor:pointer}.mat-calendar-body-disabled{cursor:default}.mat-calendar-body-cell-content{position:absolute;top:5%;left:5%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px}[dir=rtl] .mat-calendar-body-label{text-align:right}"]
    })
], SatCalendarBody);
export { SatCalendarBody };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItYm9keS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3NhdHVybi1kYXRlcGlja2VyLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9jYWxlbmRhci1ib2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04saUJBQWlCLEVBQ2pCLE1BQU0sRUFDTixTQUFTLEVBQ1QsYUFBYSxHQUNkLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQU9wQzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sZUFBZTtJQUMxQixZQUFtQixLQUFhLEVBQ2IsWUFBb0IsRUFDcEIsU0FBaUIsRUFDakIsT0FBZ0IsRUFDaEIsVUFBc0M7UUFKdEMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNoQixlQUFVLEdBQVYsVUFBVSxDQUE0QjtJQUFHLENBQUM7Q0FDOUQ7QUFHRDs7O0dBR0c7QUFlSCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBb0UxQixZQUFvQixXQUFvQyxFQUFVLE9BQWU7UUFBN0QsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQWhFakYsd0RBQXdEO1FBQy9DLHFCQUFnQixHQUFHLElBQUksQ0FBQztRQThCakMsb0RBQW9EO1FBQzNDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFLM0IsMENBQTBDO1FBQ2pDLFlBQU8sR0FBRyxDQUFDLENBQUM7UUFFckIsdURBQXVEO1FBQzlDLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFFeEI7OztXQUdHO1FBQ00sb0JBQWUsR0FBRyxDQUFD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LCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgTmdab25lLFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZXMsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8qKlxuICogRXh0cmEgQ1NTIGNsYXNzZXMgdGhhdCBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIGEgY2FsZW5kYXIgY2VsbC5cbiAqL1xuZXhwb3J0IHR5cGUgU2F0Q2FsZW5kYXJDZWxsQ3NzQ2xhc3NlcyA9IHN0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz4gfCB7W2tleTogc3RyaW5nXTogYW55fTtcblxuLyoqXG4gKiBBbiBpbnRlcm5hbCBjbGFzcyB0aGF0IHJlcHJlc2VudHMgdGhlIGRhdGEgY29ycmVzcG9uZGluZyB0byBhIHNpbmdsZSBjYWxlbmRhciBjZWxsLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgU2F0Q2FsZW5kYXJDZWxsIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXNwbGF5VmFsdWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGFyaWFMYWJlbDogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgZW5hYmxlZDogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIGNzc0NsYXNzZXM/OiBTYXRDYWxlbmRhckNlbGxDc3NDbGFzc2VzKSB7fVxufVxuXG5cbi8qKlxuICogQW4gaW50ZXJuYWwgY29tcG9uZW50IHVzZWQgdG8gZGlzcGxheSBjYWxlbmRhciBkYXRhIGluIGEgdGFibGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICBzZWxlY3RvcjogJ1tzYXQtY2FsZW5kYXItYm9keV0nLFxuICB0ZW1wbGF0ZVVybDogJ2NhbGVuZGFyLWJvZHkuaHRtbCcsXG4gIHN0eWxlVXJsczogWydjYWxlbmRhci1ib2R5LmNzcyddLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1jYWxlbmRhci1ib2R5JyxcbiAgICAncm9sZSc6ICdncmlkJyxcbiAgICAnYXJpYS1yZWFkb25seSc6ICd0cnVlJ1xuICB9LFxuICBleHBvcnRBczogJ21hdENhbGVuZGFyQm9keScsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBTYXRDYWxlbmRhckJvZHkgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKiogVGhlIGxhYmVsIGZvciB0aGUgdGFibGUuIChlLmcuIFwiSmFuIDIwMTdcIikuICovXG4gIEBJbnB1dCgpIGxhYmVsOiBzdHJpbmc7XG5cbiAgLyoqIEVuYWJsZXMgZGF0ZXBpY2tlciBNb3VzZU92ZXIgZWZmZWN0IG9uIHJhbmdlIG1vZGUgKi9cbiAgQElucHV0KCkgcmFuZ2VIb3ZlckVmZmVjdCA9IHRydWU7XG5cbiAgLyoqIFRoZSBjZWxscyB0byBkaXNwbGF5IGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgcm93czogU2F0Q2FsZW5kYXJDZWxsW11bXTtcblxuICAvKiogVGhlIHZhbHVlIGluIHRoZSB0YWJsZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRvZGF5LiAqL1xuICBASW5wdXQoKSB0b2RheVZhbHVlOiBudW1iZXI7XG5cbiAgLyoqIFRoZSB2YWx1ZSBpbiB0aGUgdGFibGUgdGhhdCBpcyBjdXJyZW50bHkgc2VsZWN0ZWQuICovXG4gIEBJbnB1dCgpIHNlbGVjdGVkVmFsdWU6IG51bWJlcjtcblxuICAvKiogVGhlIHZhbHVlIGluIHRoZSB0YWJsZSBzaW5jZSByYW5nZSBvZiBkYXRlcyBzdGFydGVkLlxuICAgKiBOdWxsIG1lYW5zIG5vIGludGVydmFsIG9yIGludGVydmFsIGRvZXNuJ3Qgc3RhcnQgaW4gdGhpcyBtb250aFxuICAgKi9cbiAgQElucHV0KCkgYmVnaW46IG51bWJlcnxudWxsO1xuXG4gIC8qKiBUaGUgdmFsdWUgaW4gdGhlIHRhYmxlIHJlcHJlc2VudGluZyBlbmQgb2YgZGF0ZXMgcmFuZ2UuXG4gICAqIE51bGwgbWVhbnMgbm8gaW50ZXJ2YWwgb3IgaW50ZXJ2YWwgZG9lc24ndCBlbmQgaW4gdGhpcyBtb250aFxuICAgKi9cbiAgQElucHV0KCkgZW5kOiBudW1iZXJ8bnVsbDtcblxuICAvKiogV2hlbmV2ZXIgdXNlciBhbHJlYWR5IHNlbGVjdGVkIHN0YXJ0IG9mIGRhdGVzIGludGVydmFsLiAqL1xuICBASW5wdXQoKSBiZWdpblNlbGVjdGVkOiBib29sZWFuO1xuXG4gIC8qKiBXaGVuZXZlciB0aGUgY3VycmVudCBtb250aCBpcyBiZWZvcmUgdGhlIGRhdGUgYWxyZWFkeSBzZWxlY3RlZCAqL1xuICBASW5wdXQoKSBpc0JlZm9yZVNlbGVjdGVkOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRvIG1hcmsgYWxsIGRhdGVzIGFzIHNlbWktc2VsZWN0ZWQuICovXG4gIEBJbnB1dCgpIHJhbmdlRnVsbDogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciB0byB1c2UgZGF0ZSByYW5nZSBzZWxlY3Rpb24gYmVoYXZpb3VyLiovXG4gIEBJbnB1dCgpIHJhbmdlTW9kZSA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgbWluaW11bSBudW1iZXIgb2YgZnJlZSBjZWxscyBuZWVkZWQgdG8gZml0IHRoZSBsYWJlbCBpbiB0aGUgZmlyc3Qgcm93LiAqL1xuICBASW5wdXQoKSBsYWJlbE1pblJlcXVpcmVkQ2VsbHM6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBjb2x1bW5zIGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgbnVtQ29scyA9IDc7XG5cbiAgLyoqIFRoZSBjZWxsIG51bWJlciBvZiB0aGUgYWN0aXZlIGNlbGwgaW4gdGhlIHRhYmxlLiAqL1xuICBASW5wdXQoKSBhY3RpdmVDZWxsID0gMDtcblxuICAvKipcbiAgICogVGhlIGFzcGVjdCByYXRpbyAod2lkdGggLyBoZWlnaHQpIHRvIHVzZSBmb3IgdGhlIGNlbGxzIGluIHRoZSB0YWJsZS4gVGhpcyBhc3BlY3QgcmF0aW8gd2lsbCBiZVxuICAgKiBtYWludGFpbmVkIGV2ZW4gYXMgdGhlIHRhYmxlIHJlc2l6ZXMuXG4gICAqL1xuICBASW5wdXQoKSBjZWxsQXNwZWN0UmF0aW8gPSAxO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgbmV3IHZhbHVlIGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0ZWRWYWx1ZUNoYW5nZTogRXZlbnRFbWl0dGVyPG51bWJlcj4gPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4oKTtcblxuICAvKiogVGhlIG51bWJlciBvZiBibGFuayBjZWxscyB0byBwdXQgYXQgdGhlIGJlZ2lubmluZyBmb3IgdGhlIGZpcnN0IHJvdy4gKi9cbiAgX2ZpcnN0Um93T2Zmc2V0OiBudW1iZXI7XG5cbiAgLyoqIFBhZGRpbmcgZm9yIHRoZSBpbmRpdmlkdWFsIGRhdGUgY2VsbHMuICovXG4gIF9jZWxsUGFkZGluZzogc3RyaW5nO1xuXG4gIC8qKiBXaWR0aCBvZiBhbiBpbmRpdmlkdWFsIGNlbGwuICovXG4gIF9jZWxsV2lkdGg6IHN0cmluZztcblxuICAvKiogVGhlIGNlbGwgbnVtYmVyIG9mIHRoZSBob3ZlcmVkIGNlbGwgKi9cbiAgX2NlbGxPdmVyOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7IH1cblxuICBfY2VsbENsaWNrZWQoY2VsbDogU2F0Q2FsZW5kYXJDZWxsKTogdm9pZCB7XG4gICAgaWYgKGNlbGwuZW5hYmxlZCkge1xuICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlQ2hhbmdlLmVtaXQoY2VsbC52YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgX21vdXNlT3ZlckNlbGwoY2VsbDogU2F0Q2FsZW5kYXJDZWxsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucmFuZ2VIb3ZlckVmZmVjdCkgdGhpcy5fY2VsbE92ZXIgPSBjZWxsLnZhbHVlO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IGNvbHVtbkNoYW5nZXMgPSBjaGFuZ2VzWydudW1Db2xzJ107XG4gICAgY29uc3Qge3Jvd3MsIG51bUNvbHN9ID0gdGhpcztcblxuICAgIGlmIChjaGFuZ2VzWydyb3dzJ10gfHwgY29sdW1uQ2hhbmdlcykge1xuICAgICAgdGhpcy5fZmlyc3RSb3dPZmZzZXQgPSByb3dzICYmIHJvd3MubGVuZ3RoICYmIHJvd3NbMF0ubGVuZ3RoID8gbnVtQ29scyAtIHJvd3NbMF0ubGVuZ3RoIDogMDtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1snY2VsbEFzcGVjdFJhdGlvJ10gfHwgY29sdW1uQ2hhbmdlcyB8fCAhdGhpcy5fY2VsbFBhZGRpbmcpIHtcbiAgICAgIHRoaXMuX2NlbGxQYWRkaW5nID0gYCR7NTAgKiB0aGlzLmNlbGxBc3BlY3RSYXRpbyAvIG51bUNvbHN9JWA7XG4gICAgfVxuXG4gICAgaWYgKGNvbHVtbkNoYW5nZXMgfHwgIXRoaXMuX2NlbGxXaWR0aCkge1xuICAgICAgdGhpcy5fY2VsbFdpZHRoID0gYCR7MTAwIC8gbnVtQ29sc30lYDtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlcy5hY3RpdmVDZWxsKSB7XG4gICAgICB0aGlzLl9jZWxsT3ZlciA9IHRoaXMuYWN0aXZlQ2VsbCArIDE7XG4gICAgfVxuICB9XG5cbiAgX2lzQWN0aXZlQ2VsbChyb3dJbmRleDogbnVtYmVyLCBjb2xJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgbGV0IGNlbGxOdW1iZXIgPSByb3dJbmRleCAqIHRoaXMubnVtQ29scyArIGNvbEluZGV4O1xuXG4gICAgLy8gQWNjb3VudCBmb3IgdGhlIGZhY3QgdGhhdCB0aGUgZmlyc3Qgcm93IG1heSBub3QgaGF2ZSBhcyBtYW55IGNlbGxzLlxuICAgIGlmIChyb3dJbmRleCkge1xuICAgICAgY2VsbE51bWJlciAtPSB0aGlzLl9maXJzdFJvd09mZnNldDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2VsbE51bWJlciA9PSB0aGlzLmFjdGl2ZUNlbGw7XG4gIH1cblxuICAvKiogV2hlbmV2ZXIgdG8gbWFyayBjZWxsIGFzIHNlbWktc2VsZWN0ZWQgKGluc2lkZSBkYXRlcyBpbnRlcnZhbCkuICovXG4gIF9pc1NlbWlTZWxlY3RlZChkYXRlOiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMucmFuZ2VNb2RlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLnJhbmdlRnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKiBEbyBub3QgbWFyayBzdGFydCBhbmQgZW5kIG9mIGludGVydmFsLiAqL1xuICAgIGlmIChkYXRlID09PSB0aGlzLmJlZ2luIHx8IGRhdGUgPT09IHRoaXMuZW5kKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLmJlZ2luICYmICF0aGlzLmVuZCkge1xuICAgICAgcmV0dXJuIGRhdGUgPiB0aGlzLmJlZ2luO1xuICAgIH1cbiAgICBpZiAodGhpcy5lbmQgJiYgIXRoaXMuYmVnaW4pIHtcbiAgICAgIHJldHVybiBkYXRlIDwgdGhpcy5lbmQ7XG4gICAgfVxuICAgIHJldHVybiBkYXRlID4gPG51bWJlcj50aGlzLmJlZ2luICYmIGRhdGUgPCA8bnVtYmVyPnRoaXMuZW5kO1xuICB9XG5cbiAgLyoqIFdoZW5ldmVyIHRvIG1hcmsgY2VsbCBhcyBzZW1pLXNlbGVjdGVkIGJlZm9yZSB0aGUgc2Vjb25kIGRhdGUgaXMgc2VsZWN0ZWQgKGJldHdlZW4gdGhlIGJlZ2luIGNlbGwgYW5kIHRoZSBob3ZlcmVkIGNlbGwpLiAqL1xuICBfaXNCZXR3ZWVuT3ZlckFuZEJlZ2luKGRhdGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5fY2VsbE92ZXIgfHwgIXRoaXMucmFuZ2VNb2RlIHx8ICF0aGlzLmJlZ2luU2VsZWN0ZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNCZWZvcmVTZWxlY3RlZCAmJiAhdGhpcy5iZWdpbikge1xuICAgICAgcmV0dXJuIGRhdGUgPiB0aGlzLl9jZWxsT3ZlcjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NlbGxPdmVyID4gdGhpcy5iZWdpbikge1xuICAgICAgcmV0dXJuIGRhdGUgPiB0aGlzLmJlZ2luICYmIGRhdGUgPCB0aGlzLl9jZWxsT3ZlcjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NlbGxPdmVyIDwgdGhpcy5iZWdpbikge1xuICAgICAgcmV0dXJuIGRhdGUgPCB0aGlzLmJlZ2luICYmIGRhdGUgPiB0aGlzLl9jZWxsT3ZlcjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIFdoZW5ldmVyIHRvIG1hcmsgY2VsbCBhcyBiZWdpbiBvZiB0aGUgcmFuZ2UuICovXG4gIF9pc0JlZ2luKGRhdGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnJhbmdlTW9kZSAmJiB0aGlzLmJlZ2luU2VsZWN0ZWQgJiYgdGhpcy5fY2VsbE92ZXIpIHtcbiAgICAgIGlmICh0aGlzLmlzQmVmb3JlU2VsZWN0ZWQgJiYgIXRoaXMuYmVnaW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NlbGxPdmVyID09PSBkYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmJlZ2luID09PSBkYXRlICYmICEodGhpcy5fY2VsbE92ZXIgPCB0aGlzLmJlZ2luKSkgfHxcbiAgICAgICAgICAodGhpcy5fY2VsbE92ZXIgPT09IGRhdGUgJiYgdGhpcy5fY2VsbE92ZXIgPCB0aGlzLmJlZ2luKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iZWdpbiA9PT0gZGF0ZTtcbiAgfVxuXG4gIC8qKiBXaGVuZXZlciB0byBtYXJrIGNlbGwgYXMgZW5kIG9mIHRoZSByYW5nZS4gKi9cbiAgX2lzRW5kKGRhdGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnJhbmdlTW9kZSAmJiB0aGlzLmJlZ2luU2VsZWN0ZWQgJiYgdGhpcy5fY2VsbE92ZXIpIHtcbiAgICAgIGlmICh0aGlzLmlzQmVmb3JlU2VsZWN0ZWQgJiYgIXRoaXMuYmVnaW4pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmVuZCA9PT0gZGF0ZSAmJiAhKHRoaXMuX2NlbGxPdmVyID4gdGhpcy5iZWdpbikpIHx8XG4gICAgICAgICAgKHRoaXMuX2NlbGxPdmVyID09PSBkYXRlICYmIHRoaXMuX2NlbGxPdmVyID4gdGhpcy5iZWdpbilcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5kID09PSBkYXRlO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGFjdGl2ZSBjZWxsIGFmdGVyIHRoZSBtaWNyb3Rhc2sgcXVldWUgaXMgZW1wdHkuICovXG4gIF9mb2N1c0FjdGl2ZUNlbGwoKSB7XG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuX25nWm9uZS5vblN0YWJsZS5hc09ic2VydmFibGUoKS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUNlbGw6IEhUTUxFbGVtZW50IHwgbnVsbCA9XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1hdC1jYWxlbmRhci1ib2R5LWFjdGl2ZScpO1xuXG4gICAgICAgIGlmIChhY3RpdmVDZWxsKSB7XG4gICAgICAgICAgYWN0aXZlQ2VsbC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBXaGVuZXZlciB0byBoaWdobGlnaHQgdGhlIHRhcmdldCBjZWxsIHdoZW4gc2VsZWN0aW5nIHRoZSBzZWNvbmQgZGF0ZSBpbiByYW5nZSBtb2RlICovXG4gIF9wcmV2aWV3Q2VsbE92ZXIoZGF0ZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NlbGxPdmVyID09PSBkYXRlICYmIHRoaXMucmFuZ2VNb2RlICYmIHRoaXMuYmVnaW5TZWxlY3RlZDtcbiAgfVxufVxuIl19