import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { ApplicationStore, StationState } from '../../../sharedServices/models';
import { ActionTypes } from '../../../reducers/actions';

export const serverStepName = {
  PREPARE_DATA: 0,
  MOS_INPUT: 1,
  RUN_WEAK_CHECKS_FOR_CURRENT_DATE: 2,
  RUN_AGGREGATION: 10,
  RUN_HEAVY_CHECKS: 11,
  RUN_THRESHOLD_CHECKS: 100,
  GENERATE_SFILE: 1000,
  RRR_GENERATOR: 10000,
  RUN_POST_QUACKME_CHECK: 10000,
  RUN_ADDITIONAL_QUALITY_CHECKS: 10000,
  COUNT_QUACKME_FLAGS: 10000,
  null: 0,
};

export const valueStepContainer = {
  Weakcheck: 10,
  HeavyCheck: 100,
  ThresholdCheck: 1000,
  Sfile: 10000
};

@Component({
  selector: 'app-server-flow-status',
  styleUrls: ['serverFlowStatus.component.scss'],
  templateUrl: 'serverFlowStatus.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class ServerFlowStatuComponent implements OnInit {
  public serverStatus = {};
  public isStatusNotRecived = true;

  constructor(
    private actionsSubj: ActionsSubject,
    private changeDetector: ChangeDetectorRef,

  ) { }

  public getStatusForStep(stepName, region) {
    if (this.serverStatus[region] === undefined) {
      return false;
    }
    return this.isWeightBigger(stepName, region);

  }

  public isStepNotFoud(stepName, region) {
    if (Object.keys(this.serverStatus).length === 0) {
      return false;
    }
    if (this.serverStatus[region] === undefined) {
      return true;
    }
    return !this.isWeightBigger(stepName, region);
  }

  public isWeightBigger(stepName, region) {
    const valueForSelectedStep = valueStepContainer[stepName];
    const valueForSelectedregion = serverStepName[this.serverStatus[region].lastFinishedStep];
    const currentStepValue = serverStepName[this.serverStatus[region].currentlyProcessedStep];
    return valueForSelectedregion + currentStepValue >= valueForSelectedStep ? true : false;
  }


  public rewriteServerStatusResponse(rawResponse) {
    // tslint:disable: no-string-literal
    this.serverStatus['EUR'] = {};
    this.serverStatus['CHN'] = {};
    this.serverStatus['EUR'] = rawResponse.find((ele) => {
      return ele.region === 'EUR';
    });
    this.serverStatus['CHN'] = rawResponse.find((ele) => {
      return ele.region === 'CHN';
    });
  }

  ngOnInit() {
    this.actionsSubj.
      subscribe((state: StationState) => {

        if (state.type === ActionTypes.GetServerStatusForDateSuccess) {
          this.rewriteServerStatusResponse(state.payload);
          this.isStatusNotRecived = false;
          this.changeDetector.markForCheck();
        }
      }
      );
  }
}
