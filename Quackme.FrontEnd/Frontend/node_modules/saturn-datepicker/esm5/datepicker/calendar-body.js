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
var SatCalendarCell = /** @class */ (function () {
    function SatCalendarCell(value, displayValue, ariaLabel, enabled, cssClasses) {
        this.value = value;
        this.displayValue = displayValue;
        this.ariaLabel = ariaLabel;
        this.enabled = enabled;
        this.cssClasses = cssClasses;
    }
    return SatCalendarCell;
}());
export { SatCalendarCell };
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
var SatCalendarBody = /** @class */ (function () {
    function SatCalendarBody(_elementRef, _ngZone) {
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
    SatCalendarBody.prototype._cellClicked = function (cell) {
        if (cell.enabled) {
            this.selectedValueChange.emit(cell.value);
        }
    };
    SatCalendarBody.prototype._mouseOverCell = function (cell) {
        if (this.rangeHoverEffect)
            this._cellOver = cell.value;
    };
    SatCalendarBody.prototype.ngOnChanges = function (changes) {
        var columnChanges = changes['numCols'];
        var _a = this, rows = _a.rows, numCols = _a.numCols;
        if (changes['rows'] || columnChanges) {
            this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
        }
        if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
            this._cellPadding = 50 * this.cellAspectRatio / numCols + "%";
        }
        if (columnChanges || !this._cellWidth) {
            this._cellWidth = 100 / numCols + "%";
        }
        if (changes.activeCell) {
            this._cellOver = this.activeCell + 1;
        }
    };
    SatCalendarBody.prototype._isActiveCell = function (rowIndex, colIndex) {
        var cellNumber = rowIndex * this.numCols + colIndex;
        // Account for the fact that the first row may not have as many cells.
        if (rowIndex) {
            cellNumber -= this._firstRowOffset;
        }
        return cellNumber == this.activeCell;
    };
    /** Whenever to mark cell as semi-selected (inside dates interval). */
    SatCalendarBody.prototype._isSemiSelected = function (date) {
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
    };
    /** Whenever to mark cell as semi-selected before the second date is selected (between the begin cell and the hovered cell). */
    SatCalendarBody.prototype._isBetweenOverAndBegin = function (date) {
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
    };
    /** Whenever to mark cell as begin of the range. */
    SatCalendarBody.prototype._isBegin = function (date) {
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
    };
    /** Whenever to mark cell as end of the range. */
    SatCalendarBody.prototype._isEnd = function (date) {
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
    };
    /** Focuses the active cell after the microtask queue is empty. */
    SatCalendarBody.prototype._focusActiveCell = function () {
        var _this = this;
        this._ngZone.runOutsideAngular(function () {
            _this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(function () {
                var activeCell = _this._elementRef.nativeElement.querySelector('.mat-calendar-body-active');
                if (activeCell) {
                    activeCell.focus();
                }
            });
        });
    };
    /** Whenever to highlight the target cell when selecting the second date in range mode */
    SatCalendarBody.prototype._previewCellOver = function (date) {
        return this._cellOver === date && this.rangeMode && this.beginSelected;
    };
    SatCalendarBody.ctorParameters = function () { return [
        { type: ElementRef },
        { type: NgZone }
    ]; };
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
    return SatCalendarBody;
}());
export { SatCalendarBody };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItYm9keS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3NhdHVybi1kYXRlcGlja2VyLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9jYWxlbmRhci1ib2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04saUJBQWlCLEVBQ2pCLE1BQU0sRUFDTixTQUFTLEVBQ1QsYUFBYSxHQUNkLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQU9wQzs7O0dBR0c7QUFDSDtJQUNFLHlCQUFtQixLQUFhLEVBQ2IsWUFBb0IsRUFDcEIsU0FBaUIsRUFDakIsT0FBZ0IsRUFDaEIsVUFBc0M7UUFKdEMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNoQixlQUFVLEdBQVYsVUFBVSxDQUE0QjtJQUFHLENBQUM7SUFDL0Qsc0JBQUM7QUFBRCxDQUFDLEFBTkQsSUFNQzs7QUFHRDs7O0dBR0c7QUFlSDtJQW9FRSx5QkFBb0IsV0FBb0MsRUFBVSxPQUFlO1FBQTdELGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFoRWpGLHdEQUF3RDtRQUMvQyxxQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUE4QmpDLG9EQUFvRDtRQUMzQyxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBSzNCLDBDQUEwQztRQUNqQyxZQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLHVEQUF1RDtRQUM5QyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRXhCOzs7V0FHRztRQUNNLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1FBRTdCLDBDQUEwQztRQUN2Qix3QkFBbUIsR0FBeUIsSUFBSSxZQUFZLEVBQVUsQ0FBQztJQWNMLENBQUM7SUFFdEYsc0NBQVksR0FBWixVQUFhLElBQXFCO1FBQ2hDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMzQztJQUNILENBQUM7SUFFRCx3Q0FBYyxHQUFkLFVBQWUsSUFBcUI7UUFDbEMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCO1lBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3pELENBQUM7SUFFRCxxQ0FBVyxHQUFYLFVBQVksT0FBc0I7UUFDaEMsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLElBQUEsU0FBc0IsRUFBckIsY0FBSSxFQUFFLG9CQUFlLENBQUM7UUFFN0IsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3RjtRQUVELElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNyRSxJQUFJLENBQUMsWUFBWSxHQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sTUFBRyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQU0sR0FBRyxHQUFHLE9BQU8sTUFBRyxDQUFDO1NBQ3ZDO1FBRUQsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7U0FDdEM7SUFDSCxDQUFDO0lBRUQsdUNBQWEsR0FBYixVQUFjLFFBQWdCLEVBQUUsUUFBZ0I7UUFDOUMsSUFBSSxVQUFVLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBRXBELHNFQUFzRTtRQUN0RSxJQUFJLFFBQVEsRUFBRTtZQUNaLFVBQVUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDO1NBQ3BDO1FBRUQsT0FBTyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN2QyxDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHlDQUFlLEdBQWYsVUFBZ0IsSUFBWTtRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCw2Q0FBNkM7UUFDN0MsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUM1QyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUMzQixPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUMzQixPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxJQUFJLEdBQVcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUM5RCxDQUFDO0lBRUQsK0hBQStIO0lBQy9ILGdEQUFzQixHQUF0QixVQUF1QixJQUFZO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDN0QsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELElBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUN4QyxPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQzlCO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDL0IsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUNuRDtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQy9CLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDbkQ7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxtREFBbUQ7SUFDbkQsa0NBQVEsR0FBUixVQUFTLElBQVk7UUFDbkIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMxRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ3hDLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUM7YUFDaEM7aUJBQU07Z0JBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDNUQsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUMzRDtTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUQsaURBQWlEO0lBQ2pELGdDQUFNLEdBQU4sVUFBTyxJQUFZO1FBQ2pCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDMUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUN4QyxPQUFPLEtBQUssQ0FBQzthQUNkO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFELENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDM0Q7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVELGtFQUFrRTtJQUNsRSwwQ0FBZ0IsR0FBaEI7UUFBQSxpQkFXQztRQVZDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7WUFDN0IsS0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDM0QsSUFBTSxVQUFVLEdBQ1osS0FBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBRTlFLElBQUksVUFBVSxFQUFFO29CQUNkLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDcEI7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHlGQUF5RjtJQUN6RiwwQ0FBZ0IsR0FBaEIsVUFBaUIsSUFBWTtRQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUN6RSxDQUFDOztnQkE3SGdDLFVBQVU7Z0JBQWdDLE1BQU07O0lBbEV4RTtRQUFSLEtBQUssRUFBRTtrREFBZTtJQUdkO1FBQVIsS0FBSyxFQUFFOzZEQUF5QjtJQUd4QjtRQUFSLEtBQUssRUFBRTtpREFBMkI7SUFHMUI7UUFBUixLQUFLLEVBQUU7dURBQW9CO0lBR25CO1FBQVIsS0FBSyxFQUFFOzBEQUF1QjtJQUt0QjtRQUFSLEtBQUssRUFBRTtrREFBb0I7SUFLbkI7UUFBUixLQUFLLEVBQUU7Z0RBQWtCO0lBR2pCO1FBQVIsS0FBSyxFQUFFOzBEQUF3QjtJQUd2QjtRQUFSLEtBQUssRUFBRTs2REFBMkI7SUFHMUI7UUFBUixLQUFLLEVBQUU7c0RBQW9CO0lBR25CO1FBQVIsS0FBSyxFQUFFO3NEQUFtQjtJQUdsQjtRQUFSLEtBQUssRUFBRTtrRUFBK0I7SUFHOUI7UUFBUixLQUFLLEVBQUU7b0RBQWE7SUFHWjtRQUFSLEtBQUssRUFBRTt1REFBZ0I7SUFNZjtRQUFSLEtBQUssRUFBRTs0REFBcUI7SUFHbkI7UUFBVCxNQUFNLEVBQUU7Z0VBQWlGO0lBdEQvRSxlQUFlO1FBZDNCLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUNuQixRQUFRLEVBQUUscUJBQXFCO1lBQy9CLHdyRkFBaUM7WUFFakMsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSxtQkFBbUI7Z0JBQzVCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLGVBQWUsRUFBRSxNQUFNO2FBQ3hCO1lBQ0QsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtZQUNyQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTs7U0FDaEQsQ0FBQztPQUNXLGVBQWUsQ0FrTTNCO0lBQUQsc0JBQUM7Q0FBQSxBQWxNRCxJQWtNQztTQWxNWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKipcbiAqIEV4dHJhIENTUyBjbGFzc2VzIHRoYXQgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCBhIGNhbGVuZGFyIGNlbGwuXG4gKi9cbmV4cG9ydCB0eXBlIFNhdENhbGVuZGFyQ2VsbENzc0NsYXNzZXMgPSBzdHJpbmcgfCBzdHJpbmdbXSB8IFNldDxzdHJpbmc+IHwge1trZXk6IHN0cmluZ106IGFueX07XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgY2xhc3MgdGhhdCByZXByZXNlbnRzIHRoZSBkYXRhIGNvcnJlc3BvbmRpbmcgdG8gYSBzaW5nbGUgY2FsZW5kYXIgY2VsbC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFNhdENhbGVuZGFyQ2VsbCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlzcGxheVZhbHVlOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBhcmlhTGFiZWw6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGVuYWJsZWQ6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBjc3NDbGFzc2VzPzogU2F0Q2FsZW5kYXJDZWxsQ3NzQ2xhc3Nlcykge31cbn1cblxuXG4vKipcbiAqIEFuIGludGVybmFsIGNvbXBvbmVudCB1c2VkIHRvIGRpc3BsYXkgY2FsZW5kYXIgZGF0YSBpbiBhIHRhYmxlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgc2VsZWN0b3I6ICdbc2F0LWNhbGVuZGFyLWJvZHldJyxcbiAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhci1ib2R5Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnY2FsZW5kYXItYm9keS5jc3MnXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtY2FsZW5kYXItYm9keScsXG4gICAgJ3JvbGUnOiAnZ3JpZCcsXG4gICAgJ2FyaWEtcmVhZG9ubHknOiAndHJ1ZSdcbiAgfSxcbiAgZXhwb3J0QXM6ICdtYXRDYWxlbmRhckJvZHknLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbn0pXG5leHBvcnQgY2xhc3MgU2F0Q2FsZW5kYXJCb2R5IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqIFRoZSBsYWJlbCBmb3IgdGhlIHRhYmxlLiAoZS5nLiBcIkphbiAyMDE3XCIpLiAqL1xuICBASW5wdXQoKSBsYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBFbmFibGVzIGRhdGVwaWNrZXIgTW91c2VPdmVyIGVmZmVjdCBvbiByYW5nZSBtb2RlICovXG4gIEBJbnB1dCgpIHJhbmdlSG92ZXJFZmZlY3QgPSB0cnVlO1xuXG4gIC8qKiBUaGUgY2VsbHMgdG8gZGlzcGxheSBpbiB0aGUgdGFibGUuICovXG4gIEBJbnB1dCgpIHJvd3M6IFNhdENhbGVuZGFyQ2VsbFtdW107XG5cbiAgLyoqIFRoZSB2YWx1ZSBpbiB0aGUgdGFibGUgdGhhdCBjb3JyZXNwb25kcyB0byB0b2RheS4gKi9cbiAgQElucHV0KCkgdG9kYXlWYWx1ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgdmFsdWUgaW4gdGhlIHRhYmxlIHRoYXQgaXMgY3VycmVudGx5IHNlbGVjdGVkLiAqL1xuICBASW5wdXQoKSBzZWxlY3RlZFZhbHVlOiBudW1iZXI7XG5cbiAgLyoqIFRoZSB2YWx1ZSBpbiB0aGUgdGFibGUgc2luY2UgcmFuZ2Ugb2YgZGF0ZXMgc3RhcnRlZC5cbiAgICogTnVsbCBtZWFucyBubyBpbnRlcnZhbCBvciBpbnRlcnZhbCBkb2Vzbid0IHN0YXJ0IGluIHRoaXMgbW9udGhcbiAgICovXG4gIEBJbnB1dCgpIGJlZ2luOiBudW1iZXJ8bnVsbDtcblxuICAvKiogVGhlIHZhbHVlIGluIHRoZSB0YWJsZSByZXByZXNlbnRpbmcgZW5kIG9mIGRhdGVzIHJhbmdlLlxuICAgKiBOdWxsIG1lYW5zIG5vIGludGVydmFsIG9yIGludGVydmFsIGRvZXNuJ3QgZW5kIGluIHRoaXMgbW9udGhcbiAgICovXG4gIEBJbnB1dCgpIGVuZDogbnVtYmVyfG51bGw7XG5cbiAgLyoqIFdoZW5ldmVyIHVzZXIgYWxyZWFkeSBzZWxlY3RlZCBzdGFydCBvZiBkYXRlcyBpbnRlcnZhbC4gKi9cbiAgQElucHV0KCkgYmVnaW5TZWxlY3RlZDogYm9vbGVhbjtcblxuICAvKiogV2hlbmV2ZXIgdGhlIGN1cnJlbnQgbW9udGggaXMgYmVmb3JlIHRoZSBkYXRlIGFscmVhZHkgc2VsZWN0ZWQgKi9cbiAgQElucHV0KCkgaXNCZWZvcmVTZWxlY3RlZDogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciB0byBtYXJrIGFsbCBkYXRlcyBhcyBzZW1pLXNlbGVjdGVkLiAqL1xuICBASW5wdXQoKSByYW5nZUZ1bGw6IGJvb2xlYW47XG5cbiAgLyoqIFdoZXRoZXIgdG8gdXNlIGRhdGUgcmFuZ2Ugc2VsZWN0aW9uIGJlaGF2aW91ci4qL1xuICBASW5wdXQoKSByYW5nZU1vZGUgPSBmYWxzZTtcblxuICAvKiogVGhlIG1pbmltdW0gbnVtYmVyIG9mIGZyZWUgY2VsbHMgbmVlZGVkIHRvIGZpdCB0aGUgbGFiZWwgaW4gdGhlIGZpcnN0IHJvdy4gKi9cbiAgQElucHV0KCkgbGFiZWxNaW5SZXF1aXJlZENlbGxzOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgdGFibGUuICovXG4gIEBJbnB1dCgpIG51bUNvbHMgPSA3O1xuXG4gIC8qKiBUaGUgY2VsbCBudW1iZXIgb2YgdGhlIGFjdGl2ZSBjZWxsIGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgYWN0aXZlQ2VsbCA9IDA7XG5cbiAgLyoqXG4gICAqIFRoZSBhc3BlY3QgcmF0aW8gKHdpZHRoIC8gaGVpZ2h0KSB0byB1c2UgZm9yIHRoZSBjZWxscyBpbiB0aGUgdGFibGUuIFRoaXMgYXNwZWN0IHJhdGlvIHdpbGwgYmVcbiAgICogbWFpbnRhaW5lZCBldmVuIGFzIHRoZSB0YWJsZSByZXNpemVzLlxuICAgKi9cbiAgQElucHV0KCkgY2VsbEFzcGVjdFJhdGlvID0gMTtcblxuICAvKiogRW1pdHMgd2hlbiBhIG5ldyB2YWx1ZSBpcyBzZWxlY3RlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGVkVmFsdWVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KCk7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgYmxhbmsgY2VsbHMgdG8gcHV0IGF0IHRoZSBiZWdpbm5pbmcgZm9yIHRoZSBmaXJzdCByb3cuICovXG4gIF9maXJzdFJvd09mZnNldDogbnVtYmVyO1xuXG4gIC8qKiBQYWRkaW5nIGZvciB0aGUgaW5kaXZpZHVhbCBkYXRlIGNlbGxzLiAqL1xuICBfY2VsbFBhZGRpbmc6IHN0cmluZztcblxuICAvKiogV2lkdGggb2YgYW4gaW5kaXZpZHVhbCBjZWxsLiAqL1xuICBfY2VsbFdpZHRoOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBjZWxsIG51bWJlciBvZiB0aGUgaG92ZXJlZCBjZWxsICovXG4gIF9jZWxsT3ZlcjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LCBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkgeyB9XG5cbiAgX2NlbGxDbGlja2VkKGNlbGw6IFNhdENhbGVuZGFyQ2VsbCk6IHZvaWQge1xuICAgIGlmIChjZWxsLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZUNoYW5nZS5lbWl0KGNlbGwudmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIF9tb3VzZU92ZXJDZWxsKGNlbGw6IFNhdENhbGVuZGFyQ2VsbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnJhbmdlSG92ZXJFZmZlY3QpIHRoaXMuX2NlbGxPdmVyID0gY2VsbC52YWx1ZTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBjb2x1bW5DaGFuZ2VzID0gY2hhbmdlc1snbnVtQ29scyddO1xuICAgIGNvbnN0IHtyb3dzLCBudW1Db2xzfSA9IHRoaXM7XG5cbiAgICBpZiAoY2hhbmdlc1sncm93cyddIHx8IGNvbHVtbkNoYW5nZXMpIHtcbiAgICAgIHRoaXMuX2ZpcnN0Um93T2Zmc2V0ID0gcm93cyAmJiByb3dzLmxlbmd0aCAmJiByb3dzWzBdLmxlbmd0aCA/IG51bUNvbHMgLSByb3dzWzBdLmxlbmd0aCA6IDA7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbJ2NlbGxBc3BlY3RSYXRpbyddIHx8IGNvbHVtbkNoYW5nZXMgfHwgIXRoaXMuX2NlbGxQYWRkaW5nKSB7XG4gICAgICB0aGlzLl9jZWxsUGFkZGluZyA9IGAkezUwICogdGhpcy5jZWxsQXNwZWN0UmF0aW8gLyBudW1Db2xzfSVgO1xuICAgIH1cblxuICAgIGlmIChjb2x1bW5DaGFuZ2VzIHx8ICF0aGlzLl9jZWxsV2lkdGgpIHtcbiAgICAgIHRoaXMuX2NlbGxXaWR0aCA9IGAkezEwMCAvIG51bUNvbHN9JWA7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXMuYWN0aXZlQ2VsbCkge1xuICAgICAgdGhpcy5fY2VsbE92ZXIgPSB0aGlzLmFjdGl2ZUNlbGwgKyAxO1xuICAgIH1cbiAgfVxuXG4gIF9pc0FjdGl2ZUNlbGwocm93SW5kZXg6IG51bWJlciwgY29sSW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGxldCBjZWxsTnVtYmVyID0gcm93SW5kZXggKiB0aGlzLm51bUNvbHMgKyBjb2xJbmRleDtcblxuICAgIC8vIEFjY291bnQgZm9yIHRoZSBmYWN0IHRoYXQgdGhlIGZpcnN0IHJvdyBtYXkgbm90IGhhdmUgYXMgbWFueSBjZWxscy5cbiAgICBpZiAocm93SW5kZXgpIHtcbiAgICAgIGNlbGxOdW1iZXIgLT0gdGhpcy5fZmlyc3RSb3dPZmZzZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNlbGxOdW1iZXIgPT0gdGhpcy5hY3RpdmVDZWxsO1xuICB9XG5cbiAgLyoqIFdoZW5ldmVyIHRvIG1hcmsgY2VsbCBhcyBzZW1pLXNlbGVjdGVkIChpbnNpZGUgZGF0ZXMgaW50ZXJ2YWwpLiAqL1xuICBfaXNTZW1pU2VsZWN0ZWQoZGF0ZTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLnJhbmdlTW9kZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5yYW5nZUZ1bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKiogRG8gbm90IG1hcmsgc3RhcnQgYW5kIGVuZCBvZiBpbnRlcnZhbC4gKi9cbiAgICBpZiAoZGF0ZSA9PT0gdGhpcy5iZWdpbiB8fCBkYXRlID09PSB0aGlzLmVuZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5iZWdpbiAmJiAhdGhpcy5lbmQpIHtcbiAgICAgIHJldHVybiBkYXRlID4gdGhpcy5iZWdpbjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZW5kICYmICF0aGlzLmJlZ2luKSB7XG4gICAgICByZXR1cm4gZGF0ZSA8IHRoaXMuZW5kO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZSA+IDxudW1iZXI+dGhpcy5iZWdpbiAmJiBkYXRlIDwgPG51bWJlcj50aGlzLmVuZDtcbiAgfVxuXG4gIC8qKiBXaGVuZXZlciB0byBtYXJrIGNlbGwgYXMgc2VtaS1zZWxlY3RlZCBiZWZvcmUgdGhlIHNlY29uZCBkYXRlIGlzIHNlbGVjdGVkIChiZXR3ZWVuIHRoZSBiZWdpbiBjZWxsIGFuZCB0aGUgaG92ZXJlZCBjZWxsKS4gKi9cbiAgX2lzQmV0d2Vlbk92ZXJBbmRCZWdpbihkYXRlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuX2NlbGxPdmVyIHx8ICF0aGlzLnJhbmdlTW9kZSB8fCAhdGhpcy5iZWdpblNlbGVjdGVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQmVmb3JlU2VsZWN0ZWQgJiYgIXRoaXMuYmVnaW4pIHtcbiAgICAgIHJldHVybiBkYXRlID4gdGhpcy5fY2VsbE92ZXI7XG4gICAgfVxuICAgIGlmICh0aGlzLl9jZWxsT3ZlciA+IHRoaXMuYmVnaW4pIHtcbiAgICAgIHJldHVybiBkYXRlID4gdGhpcy5iZWdpbiAmJiBkYXRlIDwgdGhpcy5fY2VsbE92ZXI7XG4gICAgfVxuICAgIGlmICh0aGlzLl9jZWxsT3ZlciA8IHRoaXMuYmVnaW4pIHtcbiAgICAgIHJldHVybiBkYXRlIDwgdGhpcy5iZWdpbiAmJiBkYXRlID4gdGhpcy5fY2VsbE92ZXI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBXaGVuZXZlciB0byBtYXJrIGNlbGwgYXMgYmVnaW4gb2YgdGhlIHJhbmdlLiAqL1xuICBfaXNCZWdpbihkYXRlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5yYW5nZU1vZGUgJiYgdGhpcy5iZWdpblNlbGVjdGVkICYmIHRoaXMuX2NlbGxPdmVyKSB7XG4gICAgICBpZiAodGhpcy5pc0JlZm9yZVNlbGVjdGVkICYmICF0aGlzLmJlZ2luKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jZWxsT3ZlciA9PT0gZGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodGhpcy5iZWdpbiA9PT0gZGF0ZSAmJiAhKHRoaXMuX2NlbGxPdmVyIDwgdGhpcy5iZWdpbikpIHx8XG4gICAgICAgICAgKHRoaXMuX2NlbGxPdmVyID09PSBkYXRlICYmIHRoaXMuX2NlbGxPdmVyIDwgdGhpcy5iZWdpbilcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmVnaW4gPT09IGRhdGU7XG4gIH1cblxuICAvKiogV2hlbmV2ZXIgdG8gbWFyayBjZWxsIGFzIGVuZCBvZiB0aGUgcmFuZ2UuICovXG4gIF9pc0VuZChkYXRlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5yYW5nZU1vZGUgJiYgdGhpcy5iZWdpblNlbGVjdGVkICYmIHRoaXMuX2NlbGxPdmVyKSB7XG4gICAgICBpZiAodGhpcy5pc0JlZm9yZVNlbGVjdGVkICYmICF0aGlzLmJlZ2luKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodGhpcy5lbmQgPT09IGRhdGUgJiYgISh0aGlzLl9jZWxsT3ZlciA+IHRoaXMuYmVnaW4pKSB8fFxuICAgICAgICAgICh0aGlzLl9jZWxsT3ZlciA9PT0gZGF0ZSAmJiB0aGlzLl9jZWxsT3ZlciA+IHRoaXMuYmVnaW4pXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZCA9PT0gZGF0ZTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xuICBfZm9jdXNBY3RpdmVDZWxsKCkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUuYXNPYnNlcnZhYmxlKCkucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBjb25zdCBhY3RpdmVDZWxsOiBIVE1MRWxlbWVudCB8IG51bGwgPVxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYXQtY2FsZW5kYXItYm9keS1hY3RpdmUnKTtcblxuICAgICAgICBpZiAoYWN0aXZlQ2VsbCkge1xuICAgICAgICAgIGFjdGl2ZUNlbGwuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogV2hlbmV2ZXIgdG8gaGlnaGxpZ2h0IHRoZSB0YXJnZXQgY2VsbCB3aGVuIHNlbGVjdGluZyB0aGUgc2Vjb25kIGRhdGUgaW4gcmFuZ2UgbW9kZSAqL1xuICBfcHJldmlld0NlbGxPdmVyKGRhdGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jZWxsT3ZlciA9PT0gZGF0ZSAmJiB0aGlzLnJhbmdlTW9kZSAmJiB0aGlzLmJlZ2luU2VsZWN0ZWQ7XG4gIH1cbn1cbiJdfQ==