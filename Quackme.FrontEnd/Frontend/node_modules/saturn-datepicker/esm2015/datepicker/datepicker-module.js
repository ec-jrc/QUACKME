/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { SatCalendar, SatCalendarHeader, SatCalendarFooter } from './calendar';
import { SatCalendarBody } from './calendar-body';
import { SatDatepicker, SatDatepickerContent, MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER, } from './datepicker';
import { SatDatepickerInput } from './datepicker-input';
import { SatDatepickerIntl } from './datepicker-intl';
import { SatDatepickerToggle, SatDatepickerToggleIcon } from './datepicker-toggle';
import { SatMonthView } from './month-view';
import { SatMultiYearView } from './multi-year-view';
import { SatYearView } from './year-view';
let SatDatepickerModule = class SatDatepickerModule {
};
SatDatepickerModule = tslib_1.__decorate([
    NgModule({
        imports: [
            CommonModule,
            MatButtonModule,
            MatDialogModule,
            OverlayModule,
            A11yModule,
            PortalModule,
        ],
        exports: [
            SatCalendar,
            SatCalendarBody,
            SatDatepicker,
            SatDatepickerContent,
            SatDatepickerInput,
            SatDatepickerToggle,
            SatDatepickerToggleIcon,
            SatMonthView,
            SatYearView,
            SatMultiYearView,
            SatCalendarHeader,
            SatCalendarFooter,
        ],
        declarations: [
            SatCalendar,
            SatCalendarBody,
            SatDatepicker,
            SatDatepickerContent,
            SatDatepickerInput,
            SatDatepickerToggle,
            SatDatepickerToggleIcon,
            SatMonthView,
            SatYearView,
            SatMultiYearView,
            SatCalendarHeader,
            SatCalendarFooter,
        ],
        providers: [
            SatDatepickerIntl,
            MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        ],
        entryComponents: [
            SatDatepickerContent,
            SatCalendarHeader,
            SatCalendarFooter,
        ]
    })
], SatDatepickerModule);
export { SatDatepickerModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9zYXR1cm4tZGF0ZXBpY2tlci8iLCJzb3VyY2VzIjpbImRhdGVwaWNrZXIvZGF0ZXBpY2tlci1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDekQsT0FBTyxFQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUM3RSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUNMLGFBQWEsRUFDYixvQkFBb0IsRUFDcEIsK0NBQStDLEdBQ2hELE1BQU0sY0FBYyxDQUFDO0FBQ3RCLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQWtEeEMsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7Q0FBRyxDQUFBO0FBQXRCLG1CQUFtQjtJQS9DL0IsUUFBUSxDQUFDO1FBQ1IsT0FBTyxFQUFFO1lBQ1AsWUFBWTtZQUNaLGVBQWU7WUFDZixlQUFlO1lBQ2YsYUFBYTtZQUNiLFVBQVU7WUFDVixZQUFZO1NBQ2I7UUFDRCxPQUFPLEVBQUU7WUFDUCxXQUFXO1lBQ1gsZUFBZTtZQUNmLGFBQWE7WUFDYixvQkFBb0I7WUFDcEIsa0JBQWtCO1lBQ2xCLG1CQUFtQjtZQUNuQix1QkFBdUI7WUFDdkIsWUFBWTtZQUNaLFdBQVc7WUFDWCxnQkFBZ0I7WUFDaEIsaUJBQWlCO1lBQ2pCLGlCQUFpQjtTQUNsQjtRQUNELFlBQVksRUFBRTtZQUNaLFdBQVc7WUFDWCxlQUFlO1lBQ2YsYUFBYTtZQUNiLG9CQUFvQjtZQUNwQixrQkFBa0I7WUFDbEIsbUJBQW1CO1lBQ25CLHVCQUF1QjtZQUN2QixZQUFZO1lBQ1osV0FBVztZQUNYLGdCQUFnQjtZQUNoQixpQkFBaUI7WUFDakIsaUJBQWlCO1NBQ2xCO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsaUJBQWlCO1lBQ2pCLCtDQUErQztTQUNoRDtRQUNELGVBQWUsRUFBRTtZQUNmLG9CQUFvQjtZQUNwQixpQkFBaUI7WUFDakIsaUJBQWlCO1NBQ2xCO0tBQ0YsQ0FBQztHQUNXLG1CQUFtQixDQUFHO1NBQXRCLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ExMXlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7T3ZlcmxheU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHtQb3J0YWxNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TWF0QnV0dG9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xuaW1wb3J0IHtNYXREaWFsb2dNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQge1NhdENhbGVuZGFyLCBTYXRDYWxlbmRhckhlYWRlciwgU2F0Q2FsZW5kYXJGb290ZXJ9IGZyb20gJy4vY2FsZW5kYXInO1xuaW1wb3J0IHtTYXRDYWxlbmRhckJvZHl9IGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5pbXBvcnQge1xuICBTYXREYXRlcGlja2VyLFxuICBTYXREYXRlcGlja2VyQ29udGVudCxcbiAgTUFUX0RBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIsXG59IGZyb20gJy4vZGF0ZXBpY2tlcic7XG5pbXBvcnQge1NhdERhdGVwaWNrZXJJbnB1dH0gZnJvbSAnLi9kYXRlcGlja2VyLWlucHV0JztcbmltcG9ydCB7U2F0RGF0ZXBpY2tlckludGx9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnRsJztcbmltcG9ydCB7U2F0RGF0ZXBpY2tlclRvZ2dsZSwgU2F0RGF0ZXBpY2tlclRvZ2dsZUljb259IGZyb20gJy4vZGF0ZXBpY2tlci10b2dnbGUnO1xuaW1wb3J0IHtTYXRNb250aFZpZXd9IGZyb20gJy4vbW9udGgtdmlldyc7XG5pbXBvcnQge1NhdE11bHRpWWVhclZpZXd9IGZyb20gJy4vbXVsdGkteWVhci12aWV3JztcbmltcG9ydCB7U2F0WWVhclZpZXd9IGZyb20gJy4veWVhci12aWV3JztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIE1hdEJ1dHRvbk1vZHVsZSxcbiAgICBNYXREaWFsb2dNb2R1bGUsXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBBMTF5TW9kdWxlLFxuICAgIFBvcnRhbE1vZHVsZSxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFNhdENhbGVuZGFyLFxuICAgIFNhdENhbGVuZGFyQm9keSxcbiAgICBTYXREYXRlcGlja2VyLFxuICAgIFNhdERhdGVwaWNrZXJDb250ZW50LFxuICAgIFNhdERhdGVwaWNrZXJJbnB1dCxcbiAgICBTYXREYXRlcGlja2VyVG9nZ2xlLFxuICAgIFNhdERhdGVwaWNrZXJUb2dnbGVJY29uLFxuICAgIFNhdE1vbnRoVmlldyxcbiAgICBTYXRZZWFyVmlldyxcbiAgICBTYXRNdWx0aVllYXJWaWV3LFxuICAgIFNhdENhbGVuZGFySGVhZGVyLFxuICAgIFNhdENhbGVuZGFyRm9vdGVyLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBTYXRDYWxlbmRhcixcbiAgICBTYXRDYWxlbmRhckJvZHksXG4gICAgU2F0RGF0ZXBpY2tlcixcbiAgICBTYXREYXRlcGlja2VyQ29udGVudCxcbiAgICBTYXREYXRlcGlja2VySW5wdXQsXG4gICAgU2F0RGF0ZXBpY2tlclRvZ2dsZSxcbiAgICBTYXREYXRlcGlja2VyVG9nZ2xlSWNvbixcbiAgICBTYXRNb250aFZpZXcsXG4gICAgU2F0WWVhclZpZXcsXG4gICAgU2F0TXVsdGlZZWFyVmlldyxcbiAgICBTYXRDYWxlbmRhckhlYWRlcixcbiAgICBTYXRDYWxlbmRhckZvb3RlcixcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgU2F0RGF0ZXBpY2tlckludGwsXG4gICAgTUFUX0RBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIsXG4gIF0sXG4gIGVudHJ5Q29tcG9uZW50czogW1xuICAgIFNhdERhdGVwaWNrZXJDb250ZW50LFxuICAgIFNhdENhbGVuZGFySGVhZGVyLFxuICAgIFNhdENhbGVuZGFyRm9vdGVyLFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIFNhdERhdGVwaWNrZXJNb2R1bGUge31cbiJdfQ==