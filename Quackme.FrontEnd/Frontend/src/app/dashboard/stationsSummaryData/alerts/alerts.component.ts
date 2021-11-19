import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, DoCheck, ChangeDetectorRef } from '@angular/core';
import { Alert, Observation } from '../../../sharedServices/models';
import { FormControl, FormGroup } from '@angular/forms';
import { checkCorectenessOfString, setObervationStatus } from './alerts.service';
import { basedValues } from './../../../sharedServices/stepsConaitener';

const stringRegexp = /\b(?:NA|na|Na|nA)/;
const initialValueSymbol = Symbol();
@Component({
  selector: 'app-alerts',
  templateUrl: 'alerts.component.html',
  styleUrls: ['alerts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AlertsComponent implements OnInit, DoCheck {
  public value;
  public checkParameter = false;
  public propertyName;
  public observationFormGroup: FormGroup;
  public disabled = false;
  /**
   * Used to store previously checked observation, for Angular change detection mechanic.
   */
  private previousObservation;
  @Input() alertProperty: string;
  @Input() observation: Observation;
  @Input() isEditingDisable: boolean;
  @Output() outputObj: EventEmitter<Observation> = new EventEmitter();

  constructor(
    private changeDetector: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    this.createFromElementFromModel();
  }

  /**
   * Rewrite Object and remove additional parameters,
   * Weach checks file provide additional properties which need to be removed from object
   */
  public simplifyElement(element): Observation {
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
   * Deep copy of object with inner objects
   */
  private deepCopyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * This function react to user change input and propagate new values to parent component
   */
  public propagate() {
    // clear and simplify object
    const copiedElement = this.deepCopyObject(this.observation);
    // Save previous value as a symbol just in case if use revert his changes
    this.observation =
      Object.assign({},
        this.observation
      );

    this.observation[initialValueSymbol] =
      this.getStoredInitialValue() === undefined ?
        Object.assign({}, this.observation[this.alertProperty]) :
        this.getStoredInitialValue()

    copiedElement[this.alertProperty] = this.observation[this.alertProperty];
    copiedElement.editedParameter = this.alertProperty;
    if (this.observationFormGroup.value.status === true) {
      this.disabled = false;
      this.observationFormGroup.get('value').disable();
    } else {
      this.observationFormGroup.get('value').enable();
      if (this.observationFormGroup.value.value === this.observation[this.alertProperty].value) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
      let value = this.observationFormGroup.value.value === '' ? 'NA' : this.observationFormGroup.value.value;
      value = checkCorectenessOfString(value, stringRegexp, this.observation, this.alertProperty);
      if (isNaN(+value)) {
        value = (value + '').slice(0, 2);
        value = value.toUpperCase();
      }
      this.observationFormGroup.controls.value.setValue(value);
      copiedElement[this.alertProperty] = Object.assign({}, copiedElement[this.alertProperty], { value: '' + value });
    }
    copiedElement[this.alertProperty] = setObervationStatus(copiedElement[this.alertProperty], this.observationFormGroup.value.status,
      copiedElement, this.alertProperty, this.getStoredInitialValue());
    this.outputObj.emit(copiedElement);
  }

  private getStoredInitialValue() {
    return this.observation[initialValueSymbol];
  }

  /**
   * Create form group in purpose of advanced validation of the alerts objects
   */
  public createFromElementFromModel() {
    const rewriteObj = this.deepCopyObject(this.observation);
    if (this.isEditingDisable) {
      this.checkParameter = true;
    } else {
      this.checkParameter = (rewriteObj[this.alertProperty].status === basedValues.Forced);
    }
    let isStatusDisable = false;
    if (rewriteObj[this.alertProperty].status === basedValues.Modified || this.isEditingDisable) {
      isStatusDisable = true;
      this.disabled = true;
    }

    // remove old form control and create new if it chashed
    if (this.observationFormGroup !== undefined) {
      this.observationFormGroup = undefined;
    }

    this.observationFormGroup = new FormGroup({
      value: new FormControl({ value: rewriteObj[this.alertProperty].value, disabled: this.checkParameter }),
      status: new FormControl({ value: this.checkParameter, disabled: isStatusDisable }),
    });
  }

  /**
   * The function is fired every time when user scroll virtual scroll list.
   * The purpose of this function is to ensure that every observation was render on DOM tree,
   * function is deep check observarationa nd detect changes.
   */
  public ngDoCheck() {
    if (
      this.previousObservation === undefined ||
      this.previousObservation.dayTime !== this.observation.dayTime ||
      this.previousObservation.station !== this.observation.station) {
      this.disabled = false;
      this.createFromElementFromModel();
      this.previousObservation = this.observation;
      this.changeDetector.markForCheck();
    }
  }
}
