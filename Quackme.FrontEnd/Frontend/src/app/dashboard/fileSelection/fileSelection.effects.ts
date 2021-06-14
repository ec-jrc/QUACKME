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
export class FileSelectionEffects {

  @Effect()
  serverStatus$ = this.actions$
    .pipe(
      ofType(ActionTypes.GetServerStatus),
      mergeMap(() => this.dataService.getServerStatus()
        .pipe(
          map(files => ({ type: ActionTypes.GetServerStatusSuccess, payload: files.body })),
          catchError(error => {
            return of({ type: ActionTypes.GetServerStatusError, payload: error });
          }
          )
        ))
    );

  @Effect()
  getSelectedFlowStatus$ = this.actions$
    .pipe(
      ofType(ActionTypes.GetSelectedFlowStatus),
      mergeMap((flowId) => this.dataService.getSelectedFlowStatus(flowId)
        .pipe(
          map(files => ({ type: ActionTypes.GetSelectedFlowStatusSuccess, payload: files.body })),
          catchError(error => {
            return of({ type: ActionTypes.GetSelectedFlowStatusError, payload: error });
          }
          )
        ))
    );

  @Effect()
  loadFiles$ = this.actions$
    .pipe(
      ofType(ActionTypes.LoadStations),
      mergeMap((flowId) => this.dataService.getFilesObject(flowId)
        .pipe(
          map(files => ({ type: ActionTypes.LoadStationSuccess, payload: files })),
          catchError(error => {
            return of({ type: ActionTypes.LoadStationsFail, payload: error });
          }
          )
        ))
    );

  @Effect()
  loadSelectedFile$ = this.actions$
    .pipe(
      ofType(ActionTypes.LoadSelectedFile),
      mergeMap((file) => this.dataService.getSelectedFile(file)
        .pipe(
          map(files => ({ type: ActionTypes.LoadSelectedFileSuccess, payload: FileSelectionEffects.filesOrMock(files) })),
          catchError(error => {
            return of({ type: ActionTypes.LoadSelectedFileFail, payload: error });
          }
          )
        ))
    );


  @Effect()
  sendAcceptedFiles$ = this.actions$
    .pipe(
      ofType(ActionTypes.SendAcceptedFile),
      mergeMap((file) => this.dataService.sendAcceptedFile(file)
        .pipe(
          map(files => ({ type: ActionTypes.SendAcceptedFileSuccess, payload: files })),
          catchError(error => {
            return of({ type: ActionTypes.SendAcceptedFileFail, payload: error });
          }
          )
        ))
    );

  @Effect()
  getFlowsId$ = this.actions$
    .pipe(
      ofType(ActionTypes.GetFlowsIds),
      mergeMap((action: ActionType) => this.dataService.getFlowsIds(action.region)
        .pipe(
          map(files => ({ type: ActionTypes.GetFlowsIdsSuccess, payload: files })),
          catchError(error => {
            return of({ type: ActionTypes.GetFlowsIdsFail, payload: error });
          })
        ))
    );

  @Effect()
  getFlowsIdsFromDate$ = this.actions$
    .pipe(
      ofType(ActionTypes.GetFlowsIdsFromDate),
      mergeMap((action: ActionType) => this.dataService.getFlowsIdsFromDate(action.region, action.startDate, action.endDate)
        .pipe(
          map(files => ({ type: ActionTypes.GetFlowsIdsSuccess, payload: files })),
          catchError(error => {
            return of({ type: ActionTypes.GetFlowsIdsFail, payload: error });
          })
        ))
    );

  @Effect()
  getStatusForDate$ = this.actions$
    .pipe(
      ofType(ActionTypes.GetServerStatusForDate),
      mergeMap((action: ActionType) => this.dataService.getServerStatusFromDate(action.date)
        .pipe(
          map(files => ({ type: ActionTypes.GetServerStatusForDateSuccess, payload: files })),
          catchError(error => {
            return of({ type: ActionTypes.GetServerStatusForDateError, payload: error });
          })
        ))
    );

  constructor(
    private actions$: Actions,
    private dataService: DataService
  ) { }

  /**
   * Returns parameter, or mocked files.
   */
  protected static filesOrMock(files) {
    const mockMode = Boolean(localStorage.getItem('mockMode'));
    if (mockMode) {
      return mockObservations;
    } else {
      return files;
    }
  }
}
