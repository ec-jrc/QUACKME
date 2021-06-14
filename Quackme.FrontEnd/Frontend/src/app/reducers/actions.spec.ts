import {
  LoadStations, LoadStationSuccess, LoadSelectedFile, LoadSelectedFileSuccess,
  AddAllStations, RemoveAllStations,
  RemoveSelectedStation, UpdateStationData, UpdateStationDataSuccess,
  UpdateStationDataFail, SendAcceptedFile, SendAcceptedFileSuccess, SendAcceptedFileFail,
  UserLogin, UserLoginSuccess, UserLoginFail,
  LoadSelectedFileVersions, LoadSelectedFileVersionsFail, LoadSelectedFileVersionsSuccess, HighLightSelectedStation, ScrollToStation
} from './actions';

describe('actions', () => {

  it('loadStations generated', () => {
    const loadStations = new LoadStations();
    expect(loadStations).toBeTruthy();
  });
  it('loadStationSuccess generated', () => {
    const loadStationSuccess = new LoadStationSuccess();
    expect(loadStationSuccess).toBeTruthy();
  });
  it('loadSelectedFile generated', () => {
    const loadSelectedFile = new LoadSelectedFile();
    expect(loadSelectedFile).toBeTruthy();
  });
  it('loadSelectedFileSuccess generated', () => {
    const loadSelectedFileSuccess = new LoadSelectedFileSuccess();
    expect(loadSelectedFileSuccess).toBeTruthy();
  });
  it('addAllStations generated', () => {
    const addAllStations = new AddAllStations();
    expect(addAllStations).toBeTruthy();
  });
  it('removeAllStations generated', () => {
    const removeAllStations = new RemoveAllStations();
    expect(removeAllStations).toBeTruthy();
  });
  it('removeSelectedStation generated', () => {
    const removeSelectedStation = new RemoveSelectedStation();
    expect(removeSelectedStation).toBeTruthy();
  });
  it('updateStationData generated', () => {
    const updateStationData = new UpdateStationData();
    expect(updateStationData).toBeTruthy();
  });
  it('updateStationDataSuccess generated', () => {
    const updateStationDataSuccess = new UpdateStationDataSuccess();
    expect(updateStationDataSuccess).toBeTruthy();
  });
  it('updateStationDataFail generated', () => {
    const updateStationDataFail = new UpdateStationDataFail();
    expect(updateStationDataFail).toBeTruthy();
  });
  it('sendAcceptedFile generated', () => {
    const sendAcceptedFile = new SendAcceptedFile();
    expect(sendAcceptedFile).toBeTruthy();
  });
  it('sendAcceptedFileSuccess generated', () => {
    const sendAcceptedFileSuccess = new SendAcceptedFileSuccess();
    expect(sendAcceptedFileSuccess).toBeTruthy();
  });
  it('sendAcceptedFileFail generated', () => {
    const sendAcceptedFileFail = new SendAcceptedFileFail();
    expect(sendAcceptedFileFail).toBeTruthy();
  });
  it('userLogin generated', () => {
    const userLogin = new UserLogin();
    expect(userLogin).toBeTruthy();
  });
  it('userLoginSuccess generated', () => {
    const userLoginSuccess = new UserLoginSuccess();
    expect(userLoginSuccess).toBeTruthy();
  });
  it('userLoginFail generated', () => {
    const userLoginFail = new UserLoginFail();
    expect(userLoginFail).toBeTruthy();
  });

  it('loadSelectedFileVersions generated', () => {
    const loadSelectedFileVersions = new LoadSelectedFileVersions();
    expect(loadSelectedFileVersions).toBeTruthy();
  });
  it('loadSelectedFileVersionsFail generated', () => {
    const loadSelectedFileVersionsFail = new LoadSelectedFileVersionsFail();
    expect(loadSelectedFileVersionsFail).toBeTruthy();
  });
  it('loadSelectedFileVersionsSuccess generated', () => {
    const loadSelectedFileVersionsSuccess = new LoadSelectedFileVersionsSuccess();
    expect(loadSelectedFileVersionsSuccess).toBeTruthy();
  });
  it('highLightSelectedStation generated', () => {
    const highLightSelectedStation = new HighLightSelectedStation();
    expect(highLightSelectedStation).toBeTruthy();
  });
  it('scrollToStation generated', () => {
    const scrollToStation = new ScrollToStation();
    expect(scrollToStation).toBeTruthy();
  });

});
