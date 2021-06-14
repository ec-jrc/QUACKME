import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActionTypes } from '../../reducers/actions';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationStore, StationState } from '../../sharedServices/models';
import { HelperService } from '../stationsSummaryData/helper.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval } from 'rxjs';
import { basedValues } from '../../sharedServices/stepsConaitener';
import { MatDialog } from '@angular/material/dialog';
import { FileSelectionDialogComponent } from './fileSelectionDialog/fileSelectionDialog.component';
import { ConfirmationDialogComponent } from './confirmationDialog/confirmationDialog.component';
import moment from 'moment';

enum serverStatus {
  notBusy = 'CAN_RUN_JOB',
  busy = 'CANNOT_RUN_JOB',
}

const fileNumber = [
  'WeakChecks',
  'HeavyChecks',
  'ThresholdChecks',
  'ThresholdChecksEnd',
  'JustRefresh',
]

enum serverMessage {
  'WeakChecks' = 'The check ‘WeakChecks‘ you submitted is finished. Please click OK to refresh page and proceed to next step',
  'HeavyChecks' = 'The check ‘HeavyChecks‘ you submitted is finished. Please click OK to refresh page and proceed to next step',
  'ThresholdChecks' = 'The check ‘ThresholdCheks’ you submitted is finished. Please click OK to refresh page and proceed to next step',
  'ThresholdChecksEnd' = 'The check ‘ThresholdCheks’ is finished. All the steps are complete for this MARS - QUACKME run. Please click OK to refresh page and return to main window',
  'JustRefresh' = 'Press "OK" to reload this page with most up-to-date data from the server.'
}

const CHECK_STATUS_INTERVAL = 0;//10 * 1000; // 1 sec
const REFRESH_HOUR = 21;
const BEGIN_HOUR = 11;

@Component({
  selector: 'app-file-selection',
  templateUrl: 'fileSelection.component.html',
  styleUrls: ['fileSelection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})

export class FileSelectionComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private store: Store<{ application: ApplicationStore }>,
    private actionsSubj: ActionsSubject,
    public helperService: HelperService,
    private changeDetector: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder

  ) {

    this.form = fb.group({
      date: [{ begin: new Date(2018, 7, 5), end: new Date(2018, 7, 25) }]
    });
  }
  private isRefreshCall = false;
  public storedFlows = [];
  private inputData = [];
  public selectedFile;
  public displayedColumns: string[] = ['radio', 'checkLevel', 'referanceDates']; // elements of file interface
  public dataSource = new MatTableDataSource([]);
  public selection = new SelectionModel(true, []);
  public isExpanded = true;
  public sortedVersions = [];
  public country = 'EUR';
  public selectedFlow;
  public parsedRegion;
  public isServerBusy = false;
  public stepId = 'WeakChecks';
  public isCollectionEmpty = true;
  public isObservationChecked = false;
  private isUserRunFile = false;
  private oldfileList = [];
  private isUserRunNextStep = false;
  public isSflieGenerated = false;
  public sliderChecked = false;
  public isUserSendRequest = false;

  public dateForm = new FormGroup({
    endDate: new FormControl('')
  });

  public inlineRangeChange(eve) {
    const startDate = moment(eve.value.begin);
    const endDate = moment(eve.value.end);
    const action = {
      region: this.country,
      startDate: startDate.format('YYYYMMDD'),
      endDate: endDate.format('YYYYMMDD'),
    };
    this.store.dispatch({ type: ActionTypes.GetFlowsIdsFromDate, ...action });

  }

  public selectedFileName = '';

  /** Last server status from payload. */
  private lastServerStatus: serverStatus;

  public changeSelectedCountry($event) {
    if ($event.checked) {

      this.country = 'CHN';
      this.store.dispatch({ type: ActionTypes.FlyToChina });
    } else {
      this.country = 'EUR';
      this.store.dispatch({ type: ActionTypes.FlyToEurope });
    }
    this.isUserRunFile = false;
    this.oldfileList = this.oldfileList.length === 0 ? this.inputData : this.oldfileList;
    this.store.dispatch({ type: ActionTypes.GetFlowsIds, region: this.country });

    this.inputData = [];
    this.dataSource = new MatTableDataSource([]);
    this.changeDetector.markForCheck();
    this.selectedFile = undefined;
    this.saveRegion();
  }

  public saveRegion() {
    const itemToSave = {
      region: this.country,
      date: new Date(),
    };
    localStorage.setItem('last_region', JSON.stringify(itemToSave));
  }

  public getSavedRegion() {

    if (this.parsedRegion === null) {
      return null;
    }
    const storedDate = new Date(this.parsedRegion.date);
    const currentDate = new Date();
    if (storedDate.getDate() === currentDate.getDate() &&
      storedDate.getHours() >= BEGIN_HOUR &&
      storedDate.getHours() <= REFRESH_HOUR) {
      this.store.dispatch({ type: ActionTypes.FlyToChina });
      this.country = this.parsedRegion.region;
      this.isUserRunFile = false;
      this.oldfileList = this.oldfileList.length === 0 ? this.inputData : this.oldfileList;
      this.store.dispatch({ type: ActionTypes.GetFlowsIds, region: this.country });
      this.inputData = [];
      this.dataSource = new MatTableDataSource([]);
      this.selectedFile = undefined;
      this.changeDetector.markForCheck();
      this.setSliderFromCash();
    } else {
      this.clearChashe();
      this.store.dispatch({ type: ActionTypes.GetFlowsIds, region: 'EUR' });
    }

  }

  public clearChashe() {
    localStorage.removeItem('last_region');
  }

  public isNextStepDisable() {
    if (this.inputData.indexOf(this.selectedFile) !== this.inputData.length - 1) {
      return true;
    }
    return !(this.isCollectionEmpty && this.isCoreBlocked());
  }

  /**
   * isRerunStepDisable()
   * check if list of observations is empty and is  Backend blocked
   */
  public isRerunStepDisable() {
    return !(!this.isCollectionEmpty && this.isCoreBlocked());
  }

  /**
   * isCoreBlocked()
   * return true if server is busy and all observations are not checked
   */

  public isCoreBlocked() {
    return (!this.isServerBusy && this.isObservationChecked);
  }

  public isAllObservationChecked(collection) {
    let fileChecked = true;
    collection.forEach(element => {
      const observationKeys = Object.keys(element.observation);
      observationKeys.forEach(observation => {
        if (
          element.observation[observation].status === basedValues.Suspicious ||
          element.observation[observation].status === basedValues.Warning
        ) {
          fileChecked = false;
        }
      });
    });
    return fileChecked;
  }

  public runScript(action) {
    if (this.selectedFile === undefined) {
      return;
    }
    if (action === 'next') {
      this.showConfirmationDialog(action);
    } else {
      this.store.dispatch({
        type: ActionTypes.SendAcceptedFile,
        selectedFiles: this.selectedFile, sortedVersions: this.sortedVersions[0], action
      });
      this.setIntermidiateStep(action);
    }
  }

  public toggleFileInput() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.dataSource = new MatTableDataSource(this.inputData);
      this.store.dispatch({ type: ActionTypes.GetServerStatusForDate, date: this.selectedFlow.label.split(' ')[0] });
      this.changeDetector.markForCheck();
    }
  }

  public changeSelectedFile(fileObj) {
    this.selectedFile = fileObj;
    this.stepId = this.selectedFile.checkLevel;
    this.store.dispatch({ type: ActionTypes.LoadSelectedFileVersions, selectedFile: fileObj });
    this.store.dispatch({ type: ActionTypes.GetSelectedFlowStatus, flowId: this.selectedFile.flowId });
  }

  public getselectedObject(fileName) {
    return this.inputData.find((element) => {
      return element.fileName === fileName;
    });
  }

  public sortFiles(filesCollection) {
    const filteredCollection = filesCollection.filter(element => {
      return element.checkLevel === 'WeakChecks';
    });
    const heavyCheckCollection = filesCollection.find((element) => {
      return element.checkLevel === 'HeavyChecks';
    });
    if (heavyCheckCollection !== undefined) {
      filteredCollection.push(heavyCheckCollection);
    }
    const thresholdCheckCollection = filesCollection.find((element) => {
      return element.checkLevel === 'ThresholdChecks';
    });
    if (thresholdCheckCollection !== undefined) {
      filteredCollection.push(thresholdCheckCollection);
    }
    return filteredCollection;
  }

  public loadStation(state) {
    this.inputData = this.sortFiles(state);
    this.isExpanded = true;
    this.dataSource = new MatTableDataSource(this.inputData);
    if (this.selectedFile !== undefined) {
      const selectedFile = this.inputData.find((ele) => {
        return ele.fileName === this.selectedFile.fileName;
      });
      this.selectedFile = selectedFile;
    }

    if (this.isRefreshCall) {
      this.isRefreshCall = false;
      // allways select last file
      this.selectedFile = this.inputData[this.inputData.length - 1];
      this.store.dispatch({ type: ActionTypes.LoadSelectedFileVersions, selectedFile: this.selectedFile });
    }
    this.changeDetector.markForCheck();
  }

  public loadSelectedFlow($event) {
    this.selectedFlow = $event.value;
    this.store.dispatch({ type: ActionTypes.LoadStations, flowId: this.selectedFlow.flowId });
    this.selectedFile = undefined;
  }

  public createFlowIdLabel(storedFlows) {
    const result = [];
    storedFlows.forEach((flow) => {
      const date = flow.flowId.slice(4, 14);
      const time = flow.flowId.slice(15, 23);
      result.push({
        flowId: flow.flowId,
        label: `${date} ${time}`
      });
    });
    return result;
  }



  ngOnInit() {
    const selectionDate = new Date();
    selectionDate.setDate(selectionDate.getDate() - 1);
    this.dateForm.setValue({
      endDate: new Date(selectionDate)
    });

    this.store.dispatch({ type: ActionTypes.GetServerStatus });
    if (CHECK_STATUS_INTERVAL>0)
      interval(CHECK_STATUS_INTERVAL).subscribe(() => {
        this.store.dispatch({ type: ActionTypes.GetServerStatus });
      });

    this.actionsSubj.
      subscribe((state: StationState) => {

        if (state.type === ActionTypes.GetFlowsIdsSuccess) {
          const sortedColelction = this.helperService.sortFlows(state.payload);
          this.storedFlows = this.createFlowIdLabel(sortedColelction);
          this.selectedFlow = this.storedFlows[0];
          this.isExpanded = true;
          if (this.storedFlows.length !== 0) {
            this.store.dispatch({ type: ActionTypes.LoadStations, flowId: this.selectedFlow.flowId });
          } else {
            this.loadStation([]);
          }
        } else if (state.type === ActionTypes.LoadStationSuccess) {
          this.store.dispatch({ type: ActionTypes.GetServerStatusForDate, date: this.selectedFlow.label.split(' ')[0] });
          this.loadStation(state.payload);
        } else if (state.type === ActionTypes.LoadSelectedFileSuccess) {
          // debugger;
          this.isCollectionEmpty = (state.payload.length === 0);
          this.isObservationChecked = this.isAllObservationChecked(state.payload);
          this.isExpanded = false;
          this.changeDetector.markForCheck();
        } else if (state.type === ActionTypes.SendAcceptedFileSuccess) {
          const message = 'Data was sent successfully';
          this.snackBar.open(message, 'Ok', {
            duration: 5000,
          });
        } else if (state.type === ActionTypes.SendAcceptedFileFail) {
          this.isServerBusy = false;
          this.isUserRunFile = false;
        } else if (state.type === ActionTypes.GetServerStatusSuccess) {
          if (serverStatus.notBusy === state.payload && !this.isUserSendRequest) {
            if (this.isServerBusy) {
              this.store.dispatch({ type: ActionTypes.LoadStations, flowId: this.selectedFlow.flowId });
              if (this.selectedFile !== undefined) {
                this.store.dispatch({ type: ActionTypes.GetSelectedFlowStatus, flowId: this.selectedFile.flowId });
              }
            }
            this.isServerBusy = false;
          } else {
            this.isServerBusy = true;
            this.isUserSendRequest = false;
          }

          // Server status changed from busy to free, this can mean new data arrived
          // do data refresh
          if (this.lastServerStatus === serverStatus.busy && state.payload === serverStatus.notBusy) {
            this.refreshData();
            this.isUserRunFile = false;
          }
          this.lastServerStatus = state.payload;
          this.changeDetector.markForCheck();
        } else if (state.type === ActionTypes.GetSelectedFlowStatusSuccess) {
          this.isSflieGenerated = state.payload === 'GENERATE_SFILE';
        }
      });

    const savedRegion = localStorage.getItem('last_region');
    this.parsedRegion = JSON.parse(savedRegion);
    if (this.parsedRegion === null) {
      this.store.dispatch({ type: ActionTypes.GetFlowsIds, region: 'EUR' });
    } else {
      this.getSavedRegion();

    }

  }

  public setSliderFromCash() {
    if (this.parsedRegion.region === 'CHN') {
      this.sliderChecked = true;
      this.store.dispatch({ type: ActionTypes.FlyToChina });
    } else {
      this.sliderChecked = false;
      this.store.dispatch({ type: ActionTypes.FlyToEurope });
    }
  }

  private setIntermidiateStep(action) {
    this.isUserRunNextStep = action === 'next';
    this.oldfileList = this.inputData;
    this.isUserRunFile = true;
    this.isServerBusy = true;
    this.isUserSendRequest = true;
  }

  private refreshData(): void {
    // fix width, looks ok
    let nameOfCurrentFile = this.isUserRunFile === true ? fileNumber[this.oldfileList.length - 1] : fileNumber[4];
    if (this.isUserRunNextStep && this.oldfileList.length === 3) {
      nameOfCurrentFile = fileNumber[3];
      this.isUserRunNextStep = false;
    }
    const selectedMessage = serverMessage[nameOfCurrentFile];
    let selectedHelpMessage = false;
    if (nameOfCurrentFile === 'JustRefresh') {
      selectedHelpMessage = true;
    }
    const dialogData = {
      selectedMessage,
      selectedHelpMessage
    };
    const dialogRef = this.openDialog(FileSelectionDialogComponent, dialogData);
    this.oldfileList = [];
    (dialogRef as any).componentInstance.onSubmitReason.subscribe(() => {
      this.isRefreshCall = true;
      this.store.dispatch({ type: ActionTypes.LoadStations, flowId: this.selectedFlow.flowId });
    });
  }

  private showConfirmationDialog(action): void {
    // fix width, looks ok
    if (this.isSflieGenerated) {
      const dialogRef = this.openDialog(ConfirmationDialogComponent, this.country);
      (dialogRef as any).componentInstance.onSubmitReason.subscribe(() => {
        this.store.dispatch({
          type: ActionTypes.SendAcceptedFile,
          selectedFiles: this.selectedFile, sortedVersions: this.sortedVersions[0], action
        });
        this.setIntermidiateStep(action);
      });
    } else {
      this.store.dispatch({
        type: ActionTypes.SendAcceptedFile,
        selectedFiles: this.selectedFile, sortedVersions: this.sortedVersions[0], action
      });
      this.setIntermidiateStep(action);
    }
    if (this.selectedFile.checkLevel === 'ThresholdChecks') {
      this.clearChashe();
    }
  }

  private openDialog(type, dataType) {
    const constainerWidth = '700px';
    return this.dialog.open(type, {
      width: constainerWidth,
      data: dataType,
    });
  }
}
