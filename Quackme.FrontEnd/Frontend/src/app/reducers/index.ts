import {
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { ActionTypes, ActionsUnion } from './actions';
import { State, initialState } from '../sharedServices/models';

export function reducer(
  state = initialState,
  action: ActionsUnion
): State {
  switch (action.type) {
    case ActionTypes.LoadStationSuccess: {
      return {
        ...state,
        files: action.payload.files
      };
    }

    case ActionTypes.FlyToChina: {
      return {
        ...state,
      };
    }

    case ActionTypes.FlyToEurope: {
      return {
        ...state,
      };
    }


    case ActionTypes.LoadStationsFail: {
      return {
        ...state,
        files: action.payload.files
      };
    }

    case ActionTypes.LoadStations: {
      return {
        ...state,
      };
    }

    case ActionTypes.LoadSelectedFile: {
      return {
        ...state,
        selectedFile: action.selectedFile
      };
    }

    case ActionTypes.LoadSelectedFileVersions: {
      return {
        ...state,
        selectedFile: action.selectedFile
      };
    }

    case ActionTypes.LoadSelectedFileVersionsSuccess: {
      return {
        ...state,
        selectedFile: action.selectedFile
      };
    }

    case ActionTypes.LoadSelectedFileVersionsFail: {
      return {
        ...state,
        selectedFile: action.selectedFile
      };
    }

    case ActionTypes.AddAllStations: {
      return {
        ...state,
        selectedFile: action.stations
      };
    }


    case ActionTypes.RemoveAllStations: {
      return {
        ...state
      };
    }

    case ActionTypes.HighLightSelectedStation: {
      return {
        ...state,
        selectedElement: action.selectedElement
      };
    }

    case ActionTypes.RemoveSelectedStation: {
      return {
        ...state,
        selectedFile: action.station
      };
    }

    case ActionTypes.UpdateStationData: {
      return {
        ...state,
        selectedFile: action.station
      };
    }

    case ActionTypes.ScrollToStation: {
      return {
        ...state,
        station: action.station
      };
    }

    case ActionTypes.UpdateStationDataSuccess: {
      return {
        ...state,
        selectedFile: action.station
      };
    }

    case ActionTypes.UpdateStationDataFail: {
      return {
        ...state,
        selectedFile: action.station
      };
    }

    case ActionTypes.SendAcceptedFile: {
      return {
        ...state,
        selectedFile: action.station
      };
    }

    case ActionTypes.SendAcceptedFileSuccess: {
      return {
        ...state,
        selectedFile: action.station
      };
    }

    case ActionTypes.SendAcceptedFileFail: {
      return {
        ...state,
        selectedFile: action.station
      };
    }

    case ActionTypes.UserLogin: {
      return {
        ...state,
        user: action.user
      };
    }

    case ActionTypes.UserLoginSuccess: {
      return {
        ...state,
        user: action.user
      };
    }

    case ActionTypes.UserLoginFail: {
      return {
        ...state
      };
    }

    case ActionTypes.GetFlowsIds: {
      return {
        ...state,
        region: action.region
      };
    }

    case ActionTypes.GetFlowsIdsFromDate: {
      return {
        ...state,
        region: action.region,
        startDate: action.startDate,
        endDate: action.endDate
      };
    }

    case ActionTypes.GetFlowsIdsSuccess: {
      return {
        ...state
      };
    }

    case ActionTypes.GetFlowsIdsFail: {
      return {
        ...state
      };
    }

    case ActionTypes.GetServerStatus: {
      return {
        ...state,
      };
    }

    case ActionTypes.GetServerStatusSuccess: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    case ActionTypes.GetServerStatusError: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    case ActionTypes.GetSelectedFlowStatus: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    case ActionTypes.GetSelectedFlowStatusSuccess: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    case ActionTypes.GetSelectedFlowStatusError: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    case ActionTypes.GetServerStatusForDate: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    case ActionTypes.GetServerStatusForDateSuccess: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    case ActionTypes.GetServerStatusForDateError: {
      return {
        ...state,
        serverStatus: action.serverStatus
      };
    }

    default: {
      return state;
    }
  }
}

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
