import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { DataService } from 'src/app/sharedServices/data.service';
import { ActionTypes } from '../../reducers/actions';

@Injectable()
export class StationsSummaryDataEffects {

  @Effect()
  updateAlerts$ = this.actions$
    .pipe(
      ofType(ActionTypes.UpdateStationData),
      mergeMap((file: any) => this.dataService.putNewAlertData(file)
        .pipe(
          map(files => ({ type: ActionTypes.UpdateStationDataSuccess, payload: Object.assign({}, { filtratedData: files }, file) })),
          catchError(error => {
            return of({ type: ActionTypes.UpdateStationDataFail, payload: error });
          }
          )))
    );

  constructor(
    private actions$: Actions,
    private dataService: DataService
  ) { }
}
