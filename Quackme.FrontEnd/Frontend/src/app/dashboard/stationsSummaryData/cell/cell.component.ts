import { Component, Input } from '@angular/core';
import { basedValues } from '../../../sharedServices/stepsConaitener';

@Component({
  selector: 'app-cell',
  templateUrl: 'cell.component.html',
  styleUrls: [
    'cell.component.scss'
  ]
})

export class CellComponent {
  @Input() property: string;
  @Input() elementObj;

  constructor() { }


  public detectValue(property, element, operation) {
    let selectedElement = '';
    if (element.hasOwnProperty('observation')) {
      if (
        element.observation.hasOwnProperty(property)
      ) {
        selectedElement = element.observation[property][operation];
      }
    }
    return selectedElement;
  }

  public getValue(property) {
    return this.detectValue(property, this.elementObj, 'value');
  }

  public getStatus(property) {
    return this.detectValue(property, this.elementObj, 'status');
  }

  public checkStatus(element, property) {
    let statusLabel = '';
    if (element.hasOwnProperty('observation')) {
      if (
        element.observation.hasOwnProperty(property)
      ) {
        statusLabel = element.observation[property].status;
      }
    }
    let className = 'element__item--normal';
    switch (statusLabel) {
      case basedValues.Forced:
        className = 'element__item--forced';
        break;
      case basedValues.Suspicious:
        className = 'element__item--suspicius';
        break;
      case basedValues.Warning:
        className = 'element__item--warning';
        break;
      case basedValues.Modified:
        className = 'element__item--modified';
        break;
      default:
        className = 'element__item--normal';
        break;
    }
    return className;
  }
}
