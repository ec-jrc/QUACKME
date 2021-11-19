import * as tslib_1 from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/** Datepicker data that requires internationalization. */
var SatDatepickerIntl = /** @class */ (function () {
    function SatDatepickerIntl() {
        /**
         * Stream that emits whenever the labels here are changed. Use this to notify
         * components if the labels have changed after initialization.
         */
        this.changes = new Subject();
        /** A label for the calendar popup (used by screen readers). */
        this.calendarLabel = 'Calendar';
        /** A label for the button used to open the calendar popup (used by screen readers). */
        this.openCalendarLabel = 'Open calendar';
        /** A label for the previous month button (used by screen readers). */
        this.prevMonthLabel = 'Previous month';
        /** A label for the next month button (used by screen readers). */
        this.nextMonthLabel = 'Next month';
        /** A label for the previous year button (used by screen readers). */
        this.prevYearLabel = 'Previous year';
        /** A label for the next year button (used by screen readers). */
        this.nextYearLabel = 'Next year';
        /** A label for the previous multi-year button (used by screen readers). */
        this.prevMultiYearLabel = 'Previous 20 years';
        /** A label for the next multi-year button (used by screen readers). */
        this.nextMultiYearLabel = 'Next 20 years';
        /** A label for the 'switch to month view' button (used by screen readers). */
        this.switchToMonthViewLabel = 'Choose date';
        /** A label for the 'switch to year view' button (used by screen readers). */
        this.switchToMultiYearViewLabel = 'Choose month and year';
    }
    SatDatepickerIntl.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function SatDatepickerIntl_Factory() { return new SatDatepickerIntl(); }, token: SatDatepickerIntl, providedIn: "root" });
    SatDatepickerIntl = tslib_1.__decorate([
        Injectable({ providedIn: 'root' })
    ], SatDatepickerIntl);
    return SatDatepickerIntl;
}());
export { SatDatepickerIntl };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnRsLmpzIiwic291cmNlUm9vdCI6Im5nOi8vc2F0dXJuLWRhdGVwaWNrZXIvIiwic291cmNlcyI6WyJkYXRlcGlja2VyL2RhdGVwaWNrZXItaW50bC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOztBQUc3QiwwREFBMEQ7QUFFMUQ7SUFEQTtRQUVFOzs7V0FHRztRQUNNLFlBQU8sR0FBa0IsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUV0RCwrREFBK0Q7UUFDL0Qsa0JBQWEsR0FBVyxVQUFVLENBQUM7UUFFbkMsdUZBQXVGO1FBQ3ZGLHNCQUFpQixHQUFXLGVBQWUsQ0FBQztRQUU1QyxzRUFBc0U7UUFDdEUsbUJBQWMsR0FBVyxnQkFBZ0IsQ0FBQztRQUUxQyxrRUFBa0U7UUFDbEUsbUJBQWMsR0FBVyxZQUFZLENBQUM7UUFFdEMscUVBQXFFO1FBQ3JFLGtCQUFhLEdBQVcsZUFBZSxDQUFDO1FBRXhDLGlFQUFpRTtRQUNqRSxrQkFBYSxHQUFXLFdBQVcsQ0FBQztRQUVwQywyRUFBMkU7UUFDM0UsdUJBQWtCLEdBQVcsbUJBQW1CLENBQUM7UUFFakQsdUVBQXVFO1FBQ3ZFLHVCQUFrQixHQUFXLGVBQWUsQ0FBQztRQUU3Qyw4RUFBOEU7UUFDOUUsMkJBQXNCLEdBQVcsYUFBYSxDQUFDO1FBRS9DLDZFQUE2RTtRQUM3RSwrQkFBMEIsR0FBVyx1QkFBdUIsQ0FBQztLQUM5RDs7SUFwQ1ksaUJBQWlCO1FBRDdCLFVBQVUsQ0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsQ0FBQztPQUNwQixpQkFBaUIsQ0FvQzdCOzRCQWxERDtDQWtEQyxBQXBDRCxJQW9DQztTQXBDWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cblxuLyoqIERhdGVwaWNrZXIgZGF0YSB0aGF0IHJlcXVpcmVzIGludGVybmF0aW9uYWxpemF0aW9uLiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgU2F0RGF0ZXBpY2tlckludGwge1xuICAvKipcbiAgICogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIGxhYmVscyBoZXJlIGFyZSBjaGFuZ2VkLiBVc2UgdGhpcyB0byBub3RpZnlcbiAgICogY29tcG9uZW50cyBpZiB0aGUgbGFiZWxzIGhhdmUgY2hhbmdlZCBhZnRlciBpbml0aWFsaXphdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IGNoYW5nZXM6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgY2FsZW5kYXIgcG9wdXAgKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xuICBjYWxlbmRhckxhYmVsOiBzdHJpbmcgPSAnQ2FsZW5kYXInO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgYnV0dG9uIHVzZWQgdG8gb3BlbiB0aGUgY2FsZW5kYXIgcG9wdXAgKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xuICBvcGVuQ2FsZW5kYXJMYWJlbDogc3RyaW5nID0gJ09wZW4gY2FsZW5kYXInO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgcHJldmlvdXMgbW9udGggYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cbiAgcHJldk1vbnRoTGFiZWw6IHN0cmluZyA9ICdQcmV2aW91cyBtb250aCc7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBuZXh0IG1vbnRoIGJ1dHRvbiAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIG5leHRNb250aExhYmVsOiBzdHJpbmcgPSAnTmV4dCBtb250aCc7XG5cbiAgLyoqIEEgbGFiZWwgZm9yIHRoZSBwcmV2aW91cyB5ZWFyIGJ1dHRvbiAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIHByZXZZZWFyTGFiZWw6IHN0cmluZyA9ICdQcmV2aW91cyB5ZWFyJztcblxuICAvKiogQSBsYWJlbCBmb3IgdGhlIG5leHQgeWVhciBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xuICBuZXh0WWVhckxhYmVsOiBzdHJpbmcgPSAnTmV4dCB5ZWFyJztcblxuICAvKiogQSBsYWJlbCBmb3IgdGhlIHByZXZpb3VzIG11bHRpLXllYXIgYnV0dG9uICh1c2VkIGJ5IHNjcmVlbiByZWFkZXJzKS4gKi9cbiAgcHJldk11bHRpWWVhckxhYmVsOiBzdHJpbmcgPSAnUHJldmlvdXMgMjAgeWVhcnMnO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgbmV4dCBtdWx0aS15ZWFyIGJ1dHRvbiAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIG5leHRNdWx0aVllYXJMYWJlbDogc3RyaW5nID0gJ05leHQgMjAgeWVhcnMnO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgJ3N3aXRjaCB0byBtb250aCB2aWV3JyBidXR0b24gKHVzZWQgYnkgc2NyZWVuIHJlYWRlcnMpLiAqL1xuICBzd2l0Y2hUb01vbnRoVmlld0xhYmVsOiBzdHJpbmcgPSAnQ2hvb3NlIGRhdGUnO1xuXG4gIC8qKiBBIGxhYmVsIGZvciB0aGUgJ3N3aXRjaCB0byB5ZWFyIHZpZXcnIGJ1dHRvbiAodXNlZCBieSBzY3JlZW4gcmVhZGVycykuICovXG4gIHN3aXRjaFRvTXVsdGlZZWFyVmlld0xhYmVsOiBzdHJpbmcgPSAnQ2hvb3NlIG1vbnRoIGFuZCB5ZWFyJztcbn1cbiJdfQ==