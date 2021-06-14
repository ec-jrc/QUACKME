import { Action } from '@ngrx/store';
import { PayloadStore } from '../sharedServices/models';

export enum ActionTypes {
  LoadStations = 'Load Stations',
  LoadStationSuccess = 'Load Stations Success',
  LoadStationsFail = 'Load Stations Fail',
  LoadSelectedFile = 'Load Selected File',
  LoadSelectedFileVersions = 'Load Selected File Versions',
  LoadSelectedFileVersionsSuccess = 'Load Selected File Versions Success',
  LoadSelectedFileVersionsFail = 'Load Selected File Versions Fail',
  LoadSelectedFileSuccess = 'Load Selected File Success',
  LoadSelectedFileFail = 'Load Selected File Fail',
  AddAllStations = 'Add All Stations',
  RemoveAllStations = 'Remove All Stations',
  HighLightSelectedStation = 'HighLight Selected Station',
  RemoveSelectedStation = 'Remove Selected Station',
  UpdateStationData = 'Update Station Data',
  UpdateStationDataSuccess = 'Update Station Data Success',
  UpdateStationDataFail = 'Update Station Data Fail',
  ScrollToStation = 'Scroll to Station',
  SendAcceptedFile = 'Send Accepted Files',
  SendAcceptedFileSuccess = 'Send Accepted Files Success',
  SendAcceptedFileFail = 'Send Accepted Files Fail',
  UserLogin = '[Auth] User Login',
  UserLoginSuccess = '[Auth] User Login Success',
  UserLoginFail = '[Auth] User Login Fail',
  GetFlowsIds = '[Flows ids] Get last 10 flows ids',
  GetFlowsIdsSuccess = '[Flows ids] Get last 10 flows ids success',
  GetFlowsIdsFail = '[Flows ids] Get last 10 flows ids fail',
  GetFlowsIdsFromDate = '[Flows ids] Get flows ids from selectedDate',
  GetServerStatus = '[Flows] Get current server status',
  GetServerStatusSuccess = '[Flows] Return current server status success',
  GetServerStatusError = '[Flows] Return current server status fail',
  FlyToEurope = '[Map] fly to europe',
  FlyToChina = '[Map] fly to china',
  GetSelectedFlowStatus = '[Files] Get last runned step',
  GetSelectedFlowStatusSuccess = '[Files] Get last runned step Success',
  GetSelectedFlowStatusError = '[Files] Get last runned step Error',
  GetServerStatusForDate = '[Status Date] Get status for selected date',
  GetServerStatusForDateSuccess = '[Status Date] Get status for selected date Success',
  GetServerStatusForDateError = '[Status Date] Get status for selected date Error',
  StopSpinner = '[App] Stop spinner',
  StartSpinner = '[App] Start spinner',
  UploadFile = '[Historic] Uplaod file to server',
  UploadFileSuccess = '[Historic] Uplaod file to server success',
  UploadFileError = '[Historic] Uplaod file to server error',
}

export class LoadStations implements Action {
  readonly type = ActionTypes.LoadStations;
}

export class FlyToEurope implements Action {
  readonly type = ActionTypes.FlyToEurope;
}

export class FlyToChina implements Action {
  readonly type = ActionTypes.FlyToChina;
}

export class LoadStationSuccess implements Action {
  readonly type = ActionTypes.LoadStationSuccess;
  readonly payload: PayloadStore;
}

export class LoadStationsFail implements Action {
  readonly type = ActionTypes.LoadStationsFail;
  readonly payload: PayloadStore;
}

export class LoadSelectedFile implements Action {
  readonly type = ActionTypes.LoadSelectedFile;
  readonly payload: PayloadStore;
  readonly selectedFile: any;
}

export class LoadSelectedFileVersionsSuccess implements Action {
  readonly type = ActionTypes.LoadSelectedFileVersionsSuccess;
  readonly payload: PayloadStore;
  readonly selectedFile: any;
}

export class LoadSelectedFileVersions implements Action {
  readonly type = ActionTypes.LoadSelectedFileVersions;
  readonly payload: PayloadStore;
  readonly selectedFile: any;
}

export class LoadSelectedFileVersionsFail implements Action {
  readonly type = ActionTypes.LoadSelectedFileVersionsFail;
  readonly payload: PayloadStore;
  readonly selectedFile: any;
}

export class LoadSelectedFileSuccess implements Action {
  readonly type = ActionTypes.LoadSelectedFileSuccess;
  readonly payload: PayloadStore;
  readonly selectedFile: any;
}


export class AddAllStations implements Action {
  readonly type = ActionTypes.AddAllStations;
  readonly stations: any;
}

export class RemoveAllStations implements Action {
  readonly type = ActionTypes.RemoveAllStations;
}

export class RemoveSelectedStation implements Action {
  readonly type = ActionTypes.RemoveSelectedStation;
  readonly station: any;
}

export class UpdateStationData implements Action {
  readonly type = ActionTypes.UpdateStationData;
  readonly station: any;
}

export class UpdateStationDataFail implements Action {
  readonly type = ActionTypes.UpdateStationDataFail;
  readonly station: any;
}

export class UpdateStationDataSuccess implements Action {
  readonly type = ActionTypes.UpdateStationDataSuccess;
  readonly station: any;
}

export class SendAcceptedFile implements Action {
  readonly type = ActionTypes.SendAcceptedFile;
  readonly station: any;
}

export class ScrollToStation implements Action {
  readonly type = ActionTypes.ScrollToStation;
  readonly station: any;
}

export class SendAcceptedFileSuccess implements Action {
  readonly type = ActionTypes.SendAcceptedFileSuccess;
  readonly station: any;
}

export class SendAcceptedFileFail implements Action {
  readonly type = ActionTypes.SendAcceptedFileFail;
  readonly station: any;
}

export class UserLogin implements Action {
  readonly type = ActionTypes.UserLogin;
  readonly user: any;
}

export class UserLoginSuccess implements Action {
  readonly type = ActionTypes.UserLoginSuccess;
  readonly user: any;
}

export class UserLoginFail implements Action {
  readonly type = ActionTypes.UserLoginFail;
  readonly user: any;
}

export class HighLightSelectedStation implements Action {
  readonly type = ActionTypes.HighLightSelectedStation;
  readonly selectedElement: any;
}

export class GetFlowsIds implements Action {
  readonly type = ActionTypes.GetFlowsIds;
  readonly flowIds: any;
  readonly region: string;
}

export class GetFlowsIdsFromDate implements Action {
  readonly type = ActionTypes.GetFlowsIdsFromDate;
  readonly flowIds: any;
  readonly region: string;
  readonly startDate: string;
  readonly endDate: string;
}

export class GetFlowsIdsSuccess implements Action {
  readonly type = ActionTypes.GetFlowsIdsSuccess;
  readonly flowIds: any;
}

export class GetFlowsIdsFail implements Action {
  readonly type = ActionTypes.GetFlowsIdsFail;
  readonly flowIds: any;
}

export class GetServerStatus implements Action {
  readonly type = ActionTypes.GetServerStatus;
}

export class GetServerStatusSuccess implements Action {
  readonly type = ActionTypes.GetServerStatusSuccess;
  readonly serverStatus: any;
}

export class GetServerStatusError implements Action {
  readonly type = ActionTypes.GetServerStatusError;
  readonly serverStatus: any;
}

export class GetSelectedFlowStatus implements Action {
  readonly type = ActionTypes.GetSelectedFlowStatus;
  readonly serverStatus: any;
}

export class GetSelectedFlowStatusSuccess implements Action {
  readonly type = ActionTypes.GetSelectedFlowStatusSuccess;
  readonly serverStatus: any;
}

export class GetSelectedFlowStatusError implements Action {
  readonly type = ActionTypes.GetSelectedFlowStatusError;
  readonly serverStatus: any;
}

export class GetServerStatusForDate implements Action {
  readonly type = ActionTypes.GetServerStatusForDate;
  readonly serverStatus: any;
}

export class GetServerStatusForDateSuccess implements Action {
  readonly type = ActionTypes.GetServerStatusForDateSuccess;
  readonly serverStatus: any;
}

export class GetServerStatusForDateError implements Action {
  readonly type = ActionTypes.GetServerStatusForDateError;
  readonly serverStatus: any;
}

export class UploadFile implements Action {
  readonly type = ActionTypes.UploadFile;
  readonly form: any;
}

export class UploadFileSuccess implements Action {
  readonly type = ActionTypes.UploadFile;
  readonly form: any;
}

export class UploadFileError implements Action {
  readonly type = ActionTypes.UploadFile;
  readonly form: any;
}

export type ActionsUnion = LoadStations | LoadStationSuccess | LoadSelectedFile | LoadSelectedFileSuccess |
  AddAllStations | RemoveAllStations | GetFlowsIds | GetFlowsIdsSuccess | GetFlowsIdsFail | GetFlowsIdsFromDate |
  RemoveSelectedStation | UpdateStationData | UpdateStationDataSuccess | LoadStationsFail |
  UpdateStationDataFail | SendAcceptedFile | SendAcceptedFileSuccess | SendAcceptedFileFail |
  UserLogin | UserLoginSuccess | UserLoginFail | GetServerStatus | GetServerStatusSuccess | GetServerStatusError |
  LoadSelectedFileVersions | LoadSelectedFileVersionsFail | LoadSelectedFileVersionsSuccess | HighLightSelectedStation | ScrollToStation |
  FlyToEurope | FlyToChina | GetSelectedFlowStatus | GetSelectedFlowStatusSuccess | GetSelectedFlowStatusError |
  GetServerStatusForDate | GetServerStatusForDateSuccess | GetServerStatusForDateError | UploadFile | UploadFileSuccess | UploadFileError;
