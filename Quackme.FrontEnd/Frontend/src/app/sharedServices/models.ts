export interface State { }

export const initialState: State = {};

export interface StatusState {
  type: string;
  payload: any;
}

export interface StationState {
  type: string;
  payload: any;
  station: any[];
}

export interface StationDataState {
  type: string;
  payload: any;
  station: any;
  selectedFile: any;
}

export interface FileStore {
  checkLevel: string;
  fileName: string;
  path: string;
  referanceDate: string;
}

export interface ApplicationStore {
  files: FileStore[];
}

export interface PayloadStore {
  files: FileStore[];
  user: any;
}

export interface MapState extends StationState {
  type: string;
  payload: any;
  station: any[];
  selectedFile: any;
  selectedStation: any;
  fileName: any;
  selectedElement: any;
}

export interface Alert {
  code: string;
  level: string;
  message: string;
  property: string;
  status?: string;
  values: string;
}

export interface Property {
  value: string;
  status: string;
}

export interface Observation {
  editedParameter?: any;
  DIR?: Property;
  alerts: Alert[];
  dayTime: string;
  station: number;
}
