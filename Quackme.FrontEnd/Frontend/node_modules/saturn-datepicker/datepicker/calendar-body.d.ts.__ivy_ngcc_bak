/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, EventEmitter, NgZone, OnChanges, SimpleChanges } from '@angular/core';
/**
 * Extra CSS classes that can be associated with a calendar cell.
 */
export declare type SatCalendarCellCssClasses = string | string[] | Set<string> | {
    [key: string]: any;
};
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export declare class SatCalendarCell {
    value: number;
    displayValue: string;
    ariaLabel: string;
    enabled: boolean;
    cssClasses?: SatCalendarCellCssClasses;
    constructor(value: number, displayValue: string, ariaLabel: string, enabled: boolean, cssClasses?: SatCalendarCellCssClasses);
}
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
export declare class SatCalendarBody implements OnChanges {
    private _elementRef;
    private _ngZone;
    /** The label for the table. (e.g. "Jan 2017"). */
    label: string;
    /** Enables datepicker MouseOver effect on range mode */
    rangeHoverEffect: boolean;
    /** The cells to display in the table. */
    rows: SatCalendarCell[][];
    /** The value in the table that corresponds to today. */
    todayValue: number;
    /** The value in the table that is currently selected. */
    selectedValue: number;
    /** The value in the table since range of dates started.
     * Null means no interval or interval doesn't start in this month
     */
    begin: number | null;
    /** The value in the table representing end of dates range.
     * Null means no interval or interval doesn't end in this month
     */
    end: number | null;
    /** Whenever user already selected start of dates interval. */
    beginSelected: boolean;
    /** Whenever the current month is before the date already selected */
    isBeforeSelected: boolean;
    /** Whether to mark all dates as semi-selected. */
    rangeFull: boolean;
    /** Whether to use date range selection behaviour.*/
    rangeMode: boolean;
    /** The minimum number of free cells needed to fit the label in the first row. */
    labelMinRequiredCells: number;
    /** The number of columns in the table. */
    numCols: number;
    /** The cell number of the active cell in the table. */
    activeCell: number;
    /**
     * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
     * maintained even as the table resizes.
     */
    cellAspectRatio: number;
    /** Emits when a new value is selected. */
    readonly selectedValueChange: EventEmitter<number>;
    /** The number of blank cells to put at the beginning for the first row. */
    _firstRowOffset: number;
    /** Padding for the individual date cells. */
    _cellPadding: string;
    /** Width of an individual cell. */
    _cellWidth: string;
    /** The cell number of the hovered cell */
    _cellOver: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
    _cellClicked(cell: SatCalendarCell): void;
    _mouseOverCell(cell: SatCalendarCell): void;
    ngOnChanges(changes: SimpleChanges): void;
    _isActiveCell(rowIndex: number, colIndex: number): boolean;
    /** Whenever to mark cell as semi-selected (inside dates interval). */
    _isSemiSelected(date: number): boolean;
    /** Whenever to mark cell as semi-selected before the second date is selected (between the begin cell and the hovered cell). */
    _isBetweenOverAndBegin(date: number): boolean;
    /** Whenever to mark cell as begin of the range. */
    _isBegin(date: number): boolean;
    /** Whenever to mark cell as end of the range. */
    _isEnd(date: number): boolean;
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell(): void;
    /** Whenever to highlight the target cell when selecting the second date in range mode */
    _previewCellOver(date: number): boolean;
}
