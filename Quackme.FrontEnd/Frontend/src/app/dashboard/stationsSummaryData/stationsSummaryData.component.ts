import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { StationsSummaryDataService } from './stationsSummaryData.service';
import { ActionTypes } from '../../reducers/actions';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { StationDataState } from '../../sharedServices/models';
import { HelperService } from './helper.service';
import { basedValues } from './../../sharedServices/stepsConaitener';
import { valueStepContainer, serverStepName } from '../fileSelection/serverFlowStatus/serverFlowStatus.component';

const nextStepMessage = {
  NoFile: 'Nothing to check, yet. Please come back later.',
  Weakcheck: 'Please select the WeakChecks from the table above.',
  HeavyCheck: 'Please select the HeavyChecks from the table above.',
  NoHeavyCheck: 'Nothing to check, yet. Please wait until the HeavyChecks will be available',
  ThresholdCheck: 'Please select the ThresholdChecks from the table above.',
  NoThresholdCheck: 'Nothing to check, yet. Please wait until the ThresholdChecks will be available',
  Sfile: 'All files were processed and sFile has been generated. No further action is required.'
};

class CodeCombinations {
  public stringTemplate;
  constructor(
    public property: string,
    public code: string,
  ) {
    this.stringTemplate = `property="${property}" && code="${code}"`;
  }
}

@Component({
  selector: 'app-stations-data',
  templateUrl: 'stationsSummaryData.component.html',
  styleUrls: ['stationsSummaryData.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class StationsSummaryDataComponent implements OnInit {
  public dataSource: Observable<Array<any>> = of([]);
  public collection = [];
  public formData = [];
  public rows = of([]);
  public gridHeight = 480;
  public ModifiedAlerts = true;
  public searchValue = '';
  public selectedCheckLevel;
  public forcedAlerts = true;
  public flowId;
  public editedCount = 0;
  public selected;
  public selectedElementItem = 0;
  public isEditingDisable = false;
  public isFileSelected = false;
  public referenceDates;
  public selectedFile;
  public isEUSelected = true;
  public isFilterSelected = false;
  public cashedFilterValue = '';
  public filtratedItemCount = 0;
  public filesCount = 0;
  public changedElement;
  public possibleCombinations = [];
  public counterData = {
    all: 0,
    edited: 0
  };
  public serverStatus = { EUR: 0, CHN: 0 };
  observerArray = [];
  public areOptionsExpanded  = false;

  public propertyList = [
    ['TT', 'TD', 'TX', 'TN', 'TX1', 'TX6', 'TX12', 'TN1', 'TN6', 'TN12', 'TT06', 'TT09'],
    ['TT12', 'TT15', 'TT18', 'RH', 'D_RH', 'RH06', 'RH09', 'RH12', 'RH15', 'RH18', 'MVP', 'VPD'],
    ['FF', 'DIR', 'N', 'L', 'E0', 'ES0', 'VIS', 'SOIL', 'ET0', 'QFF', 'NDT', 'LDT'],
    ['MRAD', 'MSUN', 'SH', 'SH24', 'RD', 'RD24', 'ANGRAD', 'APRAD', 'CRAD', 'SVKRAD', 'HGVRAD', 'D_VPD', 'TND'],
    ['RR', 'RRR', 'PREC', 'PR06', 'PR24', 'TR', 'SNOW', 'SLOPE', 'AP', 'D_VP', 'D_SLOPE', 'D_E', 'L']
  ];
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;

  constructor(
    private store: Store<{}>,
    private actionsSubj: ActionsSubject,
    public stationsSummaryDataService: StationsSummaryDataService,
    private changeDetector: ChangeDetectorRef,
    private helperService: HelperService
  ) {
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler($event) {
    if (this.formData.length !== 0) {
      $event.preventDefault();
      $event.returnValue = 'Some data are unsaved';
    }
  }

  public updateValues(collection) {
    this.dataSource = of(collection);
    this.store.dispatch({ type: ActionTypes.RemoveAllStations });
    this.store.dispatch({
      type: ActionTypes.AddAllStations,
      selectedStation: collection
    });
  }

  public upDateInnerCollection(values) {
    this.collection = JSON.parse(JSON.stringify(values));
    this.updateValues(values);
  }

  public customParseDate(date) {
    return this.stationsSummaryDataService.simpleParseDate(date);
  }

  public parseInputDate(date) {
    return this.stationsSummaryDataService.parseDate(date);
  }

  public applyFilter(filterValue: string) {
    this.cashedFilterValue = filterValue;
    let collectionToUpdate = this.stationsSummaryDataService.selectedStation;
    if (filterValue.length !== 0) {
      collectionToUpdate = this.helperService.observationFilter(filterValue, this.stationsSummaryDataService.selectedStation);
      this.filtratedItemCount = collectionToUpdate.length;
      this.isFilterSelected = true;
    } else {
      this.filtratedItemCount = 0;
      this.isFilterSelected = false;
    }
    this.searchValue = filterValue;
    this.upDateInnerCollection(collectionToUpdate);

    this.changeDetector.markForCheck();
  }

  public checkIfNotTouched(element) {
    let selectedElement = element.observation;
    if (this.changedElement !== undefined &&
      this.changedElement.station === element.observation.station &&
      this.changedElement.dayTime === element.observation.dayTime
    ) {
      selectedElement = this.changedElement;
    }
    return this.helperService.checkIfNotTouched(selectedElement);
  }


  public saveValues() {
    if (this.formData.length === 0) { return; }
    const rewrite = Object.assign({}, {
      selectedCheckLevel: this.stationsSummaryDataService.selectedCheckLevel,
      values: this.formData,
      flowId: this.flowId,
      selectedFile: this.selectedFile,
    });
    this.store.dispatch({ type: ActionTypes.UpdateStationData, file: rewrite });
    this.formData = [];
  }

  /**
   * Rewrite Object and remove additional parameters,
   * Weach checks file provide additional properties which need to be removed from object
   */
  public simplifyElement(element) {
    const objProperty = Object.keys(element);
    const clonedObservation = {
      dayTime: element.dayTime,
      editedParameter: element.editedParameter,
      station: element.station,
      alerts: element.alerts,
    };
    objProperty.forEach((property) => {
      if (element[property].status !== basedValues.Clear) {
        clonedObservation[property] = element[property];
      }
    });

    return clonedObservation;
  }

  /**
   * Lister of messages emmited from input component.
   * This function is also applied for data change
   */
  public updateDataCollection(observationToUpdate) {
    let selectedElement = this.stationsSummaryDataService.selectedStation.find((ele) => {
      return ele.observation.station === observationToUpdate.station && ele.observation.dayTime === observationToUpdate.dayTime;
    });
    const indexOfSearchedElement = this.stationsSummaryDataService.selectedStation.indexOf(selectedElement);
    selectedElement = Object.assign({}, selectedElement, { observation: Object.assign({}, observationToUpdate) });
    const copyCollection = this.stationsSummaryDataService.selectedStation.slice();
    copyCollection[indexOfSearchedElement] = selectedElement;
    this.stationsSummaryDataService.selectedStation = copyCollection;
    this.rewriteStructure(copyCollection);
    this.changeDetector.markForCheck();
  }


  public alertListner($event) {
    const simplyElement = this.simplifyElement($event);
    this.updateDataCollection($event);
    this.changedElement = $event;
    const findedRow = this.formData.find((element) => {
      return element.station === simplyElement.station && element.dayTime === simplyElement.dayTime;
    });
    const index = this.formData.indexOf(findedRow);
    if (index > -1) {
      findedRow[simplyElement.editedParameter] = simplyElement[simplyElement.editedParameter];
    } else {
      const changedObj = JSON.parse(JSON.stringify(simplyElement));
      delete changedObj.editedParameter;
      this.formData.push(changedObj);
      this.editedCount++;
    }
  }

  public isSaveDisable() {
    return this.formData.length === 0;
  }

  public isFileFulfill() {
    return this.stationsSummaryDataService.selectedStation.length === 0 && this.isFileSelected;
  }

  public toogleVersioningBlock(version) {
    const fristItem = this.stationsSummaryDataService.versions[0];
    this.isEditingDisable = !(fristItem.versionId === version);
  }

  public getSelectedfile($event) {
    this.store.dispatch({
      type: ActionTypes.LoadSelectedFile,
      selectedFile: this.selectedCheckLevel, id: $event.value.versionId, flowId: this.flowId
    });
    this.toogleVersioningBlock($event.value.versionId);
  }

  public checkEqualStatus(element, value) {
    return element === value;
  }

  public triggerFiltration() {
    let filtretedData = [];
    this.collection.forEach((element) => {
      Object.keys(element.observation).forEach((ele) => {
        if (element.observation[ele].status === basedValues.Suspicious ||
          element.observation[ele].status === basedValues.Warning) {
          filtretedData = this.helperService.uniquePush(element, filtretedData);
        } else {
          if (element.observation[ele].status === basedValues.Modified && this.ModifiedAlerts) {
            filtretedData = this.helperService.uniquePush(element, filtretedData);
          }
          if (element.observation[ele].status === basedValues.Forced && this.forcedAlerts) {
            filtretedData = this.helperService.uniquePush(element, filtretedData);
          }
        }
      });
    });
    this.updateValues(filtretedData);
  }

  public alertAgregation(alertsList) {
    const properties = [];
    alertsList.forEach(alert => {
      if (properties.indexOf(alert.property) === -1) {
        properties.push(alert.property);
      }
    });
    return properties;
  }

  public goToUnchecked() {
    let isItemNotFound = true;
    let selectedIndex = 0;
    for (let index = 0; index < this.collection.length && isItemNotFound; index++) {
      const selectedItem = this.collection[index];
      const observation = selectedItem.observation;
      const keys = Object.keys(observation);

      keys.forEach(element => {
        const property = observation[element];
        if (property.status !== undefined) {

          if (this.checkNotTouchedObservation(property)) {
            isItemNotFound = false;
            selectedIndex = index;
          }
        }
      });
    }
    this.viewPort.scrollToIndex(selectedIndex);
  }

  public rewriteStructure(collection) {
    const newStructure = JSON.parse(JSON.stringify(collection));
    this.collection = newStructure;
    this.dataSource = of(this.collection);
    this.viewPort.checkViewportSize();
    this.changeDetector.markForCheck();
  }

  public detectIfPropertyIsSearched(prop) {
    let isPropertyFound = false;
    this.propertyList.forEach((list) => {
      const searchedProperty = list.find(ele => ele === prop);
      if (searchedProperty !== undefined && searchedProperty.length > -1) {
        isPropertyFound = true;
      }
    });
    return isPropertyFound;
  }

  /**
   * Function is detecting the property by the message typed in by user.
   */
  public detectPropertyByMessage(element, clearElement) {
    let propertyToSelect;
    const selectedElement = element.observation;
    const alertsList = selectedElement.alerts;
    alertsList.forEach(alertElement => {
      if (alertElement.message.toLocaleLowerCase().search(clearElement) >= 0) {
        propertyToSelect = alertElement.property;
      }
    });
    return propertyToSelect;
  }

  /**
   * Checking if property exist in observation.
   */
  public checkIfPropertyExists(collectionElement, clearElement) {
    let propertyToSelect;
    const observationObj = collectionElement.observation;
    const observationKeys = Object.keys(observationObj);
    observationKeys.forEach(alertElement => {
      if (alertElement.toLocaleLowerCase() === clearElement &&
        observationObj[alertElement].status !== basedValues.Modified &&
        observationObj[alertElement].status !== basedValues.Clear &&
        observationObj[alertElement].status !== basedValues.Forced
      ) {
        propertyToSelect = clearElement;

      }
    });
    return propertyToSelect;
  }

  /**
   *  Simple split the values of input by logic operator.
   */
  public splitByOperator(key) {
    let property;
    if (key.indexOf('>') > -1) {
      property = key.split('>')[0];
    } else if (key.indexOf('>=') > -1) {
      property = key.split('>=')[0];
    } else if (key.indexOf('<') > -1) {
      property = key.split('<')[0];
    } else if (key.indexOf('<=') > -1) {
      property = key.split('<=')[0];
    }
    return property;
  }

  /**
   * Function is detecting parameter by logic operation typed in input.
   */
  public checkIfPropertyExistsAdvanced(element, trimmedKeyElement) {
    let propertyToSelect;
    const filtratedCollection = this.helperService.splitDataByOperation([element], trimmedKeyElement);
    if (filtratedCollection.length > 0) {
      propertyToSelect = this.splitByOperator(trimmedKeyElement);
    }
    return propertyToSelect;
  }

  /**
   * Function is detecting property in the filtrated collection and
   * set status of it.
   */
  public changePropertyInCollection(actionTypeFunction) {
    const collectionToUpdate = this.helperService.observationFilter(this.searchValue, this.stationsSummaryDataService.selectedStation);
    const splittedFilter = this.helperService.splitFilterMessageToRequests(this.searchValue);
    collectionToUpdate.forEach(element => {
      let propertyToSelect;
      let propertyIsNotSearch = true;
      splittedFilter.forEach(innerElement => {
        const trimmedKeyElement = innerElement.leftHand.trim();
        const clearElement = this.helperService.customTrim(innerElement.rightHand);
        if (trimmedKeyElement.toLocaleLowerCase() === 'message') {
          propertyToSelect = this.detectPropertyByMessage(element, clearElement);
        }

        if (trimmedKeyElement.toLocaleLowerCase() === 'property') {
          propertyToSelect = this.checkIfPropertyExists(element, clearElement);
        }

        if (!this.helperService.checkIfAllArgsNotEqist(trimmedKeyElement, ['>', '>=', '<', '<=', '='])) {
          propertyToSelect = this.checkIfPropertyExistsAdvanced(element, trimmedKeyElement);
        } else {
          propertyIsNotSearch = false;
        }

      });
      this.applyStatusTocollection(propertyToSelect, element, propertyIsNotSearch, actionTypeFunction);
    });
    this.store.dispatch({
      type: ActionTypes.AddAllStations, selectedStation:
        this.stationsSummaryDataService.selectedStation
    });
    this.filtratedItemCount = 0;
    this.rewriteStructure(this.stationsSummaryDataService.selectedStation);
  }

  /**
   * Apply selected status to collection.
   */
  public applyStatusTocollection(propertyToSelect, element, propertyIsNotSearch, actionTypeFunction) {
    if (propertyToSelect !== undefined) {
      const changedElement = actionTypeFunction(element, propertyToSelect.toUpperCase());
      this.alertListner(changedElement.observation);
    } else if (propertyIsNotSearch) {
      const observationObj = element.observation;
      const observationKeys = Object.keys(observationObj);
      observationKeys.forEach(alertElement => {
        const changedElement = actionTypeFunction(element, alertElement);
        this.alertListner(changedElement.observation);
      });
    }
    this.searchValue = '';
  }

  /**
   * check if property was not modified and set status to Force
   */
  public forceSelectedObservation(element, alertElement) {
    if (
      element.observation[alertElement].status !== undefined &&
      element.observation[alertElement].status !== basedValues.Modified &&
      element.observation[alertElement].status !== basedValues.Clear &&
      element.observation[alertElement].status !== basedValues.Forced
    ) {
      element = Object.assign({}, element);
      let selectedProperty = element.observation[alertElement];
      selectedProperty = Object.assign({}, selectedProperty, { status: basedValues.Forced });
      element.observation = Object.assign({}, element.observation);
      element.observation[alertElement] = Object.assign({}, element.observation[alertElement], selectedProperty);
    }
    return element;
  }

  /**
   * check if property was not modified and set status to Not avalible
   */
  public setNaSelectedObservation(element, alertElement) {
    if (
      element.observation[alertElement].status !== undefined &&
      element.observation[alertElement].status !== basedValues.Forced &&
      element.observation[alertElement].status !== basedValues.Clear &&
      element.observation[alertElement].status !== basedValues.Modified
    ) {
      element = Object.assign({}, element);
      let selectedProperty = element.observation[alertElement];
      selectedProperty = Object.assign({}, selectedProperty, { status: basedValues.Modified, value: 'NA' });
      element.observation = Object.assign({}, element.observation);
      element.observation[alertElement] = Object.assign({}, element.observation[alertElement], selectedProperty);
    }
    return element;
  }

  public acceptAllSelectedObservations() {
    this.changePropertyInCollection(this.forceSelectedObservation);
  }

  public setAllObservationsToNA() {
    this.changePropertyInCollection(this.setNaSelectedObservation);
  }

  public checkIfUserISSearchForProperty() {
    const filterValue = this.searchValue.toLocaleLowerCase();
    const isMessageFound = filterValue.search('message') > -1;
    const isPropertyFound = filterValue.search('property') > -1;
    const regex = /code="[\d]{3}"/;
    const isCodeFound = filterValue.match(regex);
    return (isMessageFound && isCodeFound) || (isPropertyFound && isCodeFound);
  }

  public isFilteredButtonDisabled() {
    return !this.checkIfUserISSearchForProperty() || !this.isFilterSelected;
  }

  public isFilterDisabled() {
    return this.stationsSummaryDataService.selectedStation.length === 0;
  }

  public isLastUncheckedDisable() {
    return this.collection.length === 0;
  }

  public getSortedVersion() {
    return this.stationsSummaryDataService.versions;
  }

  public displayedStation(ele) {
    const selectedElement = this.collection[ele];
    this.selectedElementItem = ele + 1;
    this.store.dispatch({ type: ActionTypes.HighLightSelectedStation, selectedElement });
  }

  public undoChanges() {
    this.upDateInnerCollection(this.stationsSummaryDataService.selectedStation);
    this.formData = [];
    if (this.cashedFilterValue.length !== 0) {
      this.applyFilter(this.cashedFilterValue);
    }
  }

  /**
   * clearInput
   */
  public clearInput() {
    this.applyFilter('');
  }

  /**
   * toggleOptions
   */
  public toggleOptions() {
    this.areOptionsExpanded  = !this.areOptionsExpanded ;
  }

  /**
   * getCodeCombinations
   */
  public getCodeCombinations(payload) {
    const combinations = [];
    let index = 0;
    payload.forEach(element => {
      element.observation.alerts.forEach(alert => {
        const isExist = combinations.find((existItem) => {
          return existItem.property === alert.property &&
            existItem.code === alert.code;
        });
        if (!isExist) {
          const newElement = new CodeCombinations(alert.property, alert.code);
          index++;
          combinations.push(newElement);
        }
      });
    });
    return combinations;
  }

  public actionOnLoadSelectedFileSuccess(state) {
    this.possibleCombinations = this.getCodeCombinations(state.payload);

    this.isFileSelected = true;
    this.stationsSummaryDataService.selectedStation = this.helperService.sortStations(state.payload);
    this.counterData = this.stationsSummaryDataService
      .countModyfiedElements(this.stationsSummaryDataService.selectedStation);
    this.dataSource = of(this.stationsSummaryDataService.selectedStation);
    this.upDateInnerCollection(this.stationsSummaryDataService.selectedStation);
    this.changeDetector.markForCheck();
    this.store.dispatch({ type: ActionTypes.RemoveAllStations });
    this.store.dispatch({
      type: ActionTypes.AddAllStations, selectedStation:
        this.stationsSummaryDataService.selectedStation
    });
    this.store.dispatch({
      type: ActionTypes.HighLightSelectedStation, selectedElement:
        this.stationsSummaryDataService.selectedStation[0]
    });
  }

  public actionOnLoadSelectedFileVersionsSuccess(state) {
    const fileInfo = state.selectedFile;
    this.flowId = fileInfo.flowId;
    this.referenceDates = fileInfo.referenceDates;
    this.selectedFile = fileInfo.checkLevel;
    this.store.dispatch({
      type: ActionTypes.LoadSelectedFile,
      selectedFile: this.selectedFile,
      flowId: fileInfo.flowId,
      referenceDates: this.referenceDates,
    });
    this.stationsSummaryDataService.selectedCheckLevel = this.selectedCheckLevel;
    this.changeDetector.markForCheck();
  }

  public actionOnLoadStationSuccess() {
    this.stationsSummaryDataService.selectedStation = [];
    this.upDateInnerCollection([]);
    this.changeDetector.markForCheck();
    this.store.dispatch({ type: ActionTypes.RemoveAllStations });
  }

  public checkNotTouchedObservation(element) {
    return element.status === basedValues.Warning || element.status === basedValues.Suspicious;
  }

  public getFirstNotTouchedStation(stationList) {
    let selectedStation;
    let index = 0;
    let isNotFound = true;
    if (stationList.length > 1) {
      while (isNotFound) {
        if (stationList[index] === undefined) {
          selectedStation = stationList[0];
          isNotFound = false;
        } else {
          const listElement = stationList[index];
          const keys = Object.keys(listElement.observation);
          keys.forEach(key => {
            if (this.checkNotTouchedObservation(listElement.observation[key])) {
              selectedStation = listElement;
              isNotFound = false;
            }
          });
        }
        index++;
      }
    } else {
      selectedStation = stationList[0];
    }
    return selectedStation;
  }

  public actionOnScrollToStation(state) {
    const stationNumber = state.station;
    const stationList = this.collection.filter(ele => {
      return ele.station.stationNumber === stationNumber;
    });
    const selectedStation = this.getFirstNotTouchedStation(stationList);
    const stationIndex = this.collection.indexOf(selectedStation);
    this.viewPort.scrollToIndex(stationIndex);
  }

  public getNextStepName(value) {
    let nextStep = 'Weakcheck';
    if (this.filesCount === 0) {
      nextStep = 'NoFile';
    } else if (this.filesCount === 1 && value >= valueStepContainer.Weakcheck) {
      nextStep = 'NoHeavyCheck';
    } else if (this.filesCount === 2 && value >= valueStepContainer.HeavyCheck) {
      nextStep = 'NoThresholdCheck';
    } else if (this.filesCount === 2) {
      nextStep = 'HeavyCheck';
    } else if (this.filesCount === 3) {
      nextStep = 'ThresholdCheck';
      if (value >= valueStepContainer.ThresholdCheck) {
        nextStep = 'Sfile';
      }
    }
    return nextStep;
  }

  public nextPossibleStep() {
    const regionName = this.isEUSelected ? 'EUR' : 'CHN';
    const serverValue = this.serverStatus[regionName];
    const determinateNextStepMessage = this.getNextStepName(serverValue)
    return nextStepMessage[determinateNextStepMessage];
  }

  public calculateServerValueForRegion(region, collection) {
    const selectedRegionStatus = collection.find((row) => {
      return row.region === region;
    });
    return serverStepName[selectedRegionStatus.lastFinishedStep] + serverStepName[selectedRegionStatus.currentlyProcessedStep];
  }

  ngOnInit() {
    this.actionsSubj.
      subscribe((state: StationDataState) => {
        if (state.type === ActionTypes.LoadSelectedFileSuccess) {
          this.searchValue = '';
          this.actionOnLoadSelectedFileSuccess(state);
        } else if (state.type === ActionTypes.LoadSelectedFileVersions) {
          this.actionOnLoadSelectedFileVersionsSuccess(state);
        } else if (state.type === ActionTypes.UpdateStationDataSuccess) {
          const selectedFile = {
            flowId: this.flowId,
            referenceDates: this.referenceDates,
            selectedFile: this.selectedFile
          };
          this.store.dispatch({ type: ActionTypes.LoadSelectedFile, ...selectedFile });
        } else if (state.type === ActionTypes.LoadStationSuccess) {
          this.stationsSummaryDataService.versions = [];
          this.counterData = {
            all: 0,
            edited: 0
          };
          this.formData = [];
          this.editedCount = 0;
          this.selectedElementItem = 0;
          this.filesCount = state.payload.length;
          this.actionOnLoadStationSuccess();
        } else if (state.type === ActionTypes.ScrollToStation) {
          this.actionOnScrollToStation(state);
        } else if (state.type === ActionTypes.FlyToEurope) {
          this.isEUSelected = true;
          this.isFileSelected = false;
          this.changeDetector.markForCheck();
        } else if (state.type === ActionTypes.FlyToChina) {
          this.isEUSelected = false;
          this.isFileSelected = false;
          this.changeDetector.markForCheck();
        } else if (state.type === ActionTypes.GetServerStatusForDateSuccess) {
          const serverStatusResponse = state.payload;
          this.serverStatus.EUR = this.calculateServerValueForRegion('EUR', serverStatusResponse);
          this.serverStatus.CHN = this.calculateServerValueForRegion('CHN', serverStatusResponse);
          this.changeDetector.markForCheck();
        }
      });
  }

}
