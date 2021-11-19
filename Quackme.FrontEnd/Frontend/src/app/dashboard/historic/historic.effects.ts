import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { DataService } from 'src/app/sharedServices/data.service';
import { ActionTypes } from '../../reducers/actions';
import mockObservations from '../stationsSummaryData/mockObservations';

interface ActionType {
  region: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class HistoricEffects {

  @Effect()
  serverStatus$ = this.actions$
    .pipe(
      ofType(ActionTypes.UploadFile),
      mergeMap((form: any) => this.dataService.sendFileToServer(form.form)
        .pipe(
          map(files => ({ type: ActionTypes.UploadFileSuccess, payload: files.body })),
          catchError(error => {
            return of({ type: ActionTypes.UploadFileError, payload: error });
          }
          )
        ))
    );

  constructor(
    private actions$: Actions,
    private dataService: DataService
  ) { }
}
