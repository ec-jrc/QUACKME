import { isEqual, compraingOperation, opertaionObj } from '../../sharedServices/filtering.service';
import { Property } from '../../sharedServices/models';
import { basedValues } from '../../sharedServices/stepsConaitener';
import { Injectable } from '@angular/core';

export enum filtrationProperty {
  MESSAGE = 'message',
  PROPERTY = 'property',
  COUNTRY = 'country',
  LONGITUDE = 'longitude',
  ALTITUDE = 'altitude',
  LATITUDE = 'latitude',
  TIME = 'daytime',
  STATIONNAME = 'stationname',
  CODE = 'code',
  STATIONNUMBER = 'stationnumber'
}

interface SubOperation {
  leftHand: string;
  rightHand: string | SubOperation;
  operation: string;
}

@Injectable()
export class HelperService {
  public propertyList = [
    'TT', 'TD', 'TX', 'TN', 'TX1', 'TX6', 'TX12', 'TN1', 'TN6', 'TN12', 'TT06', 'TT09',
    'TT12', 'TT15', 'TT18', 'RH', 'D_RH', 'RH06', 'RH09', 'RH12', 'RH15', 'RH18', 'MVP', 'VPD',
    'FF', 'DIR', 'N', 'L', 'E0', 'ES0', 'VIS', 'SOIL', 'ET0', 'QFF', 'NDT', 'LDT',
    'MRAD', 'MSUN', 'SH', 'SH24', 'RD', 'RD24', 'ANGRAD', 'APRAD', 'CRAD', 'SVKRAD', 'HGVRAD', 'D_VPD', 'TND',
    'RR', 'RRR', 'PREC', 'PR06', 'PR24', 'TR', 'SNOW', 'SLOPE', 'AP', 'D_VP', 'D_SLOPE', 'D_E', 'L'
  ];
  public operatorsList = ['>', '>=', '<', '<=', '='];

  public splitAt = index => x => [x.slice(0, index), x.slice(index + 1)];


  public genericCompare(item: Property, itemToCompare: number, operation: compraingOperation): boolean {
    if (item === undefined) { return false; }
    let isSelected = false;
    if (item.value !== undefined) {
      isSelected = operation(+item.value, +itemToCompare);
    } else {
      isSelected = operation(+item, +itemToCompare);
    }
    return isSelected;
  }

  public customParseDate(date) {
    const dateObject = new Date(date);
    const startDay = dateObject.getDate() < 10 ? '0' + dateObject.getDate() : dateObject.getDate();
    const startMounth = dateObject.getMonth() + 1 < 10 ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1;
    const hoursUTC = dateObject.getHours() < 10 ? '0' + dateObject.getHours() : dateObject.getHours();
    const parsedDate = `${startDay}-${startMounth}-${dateObject.getFullYear()} ${hoursUTC}`;
    return parsedDate;
  }

  public numberFiltration(filtratedValues, numberElement) {
    return filtratedValues.filter((item) => {
      let isSelected = false;
      Object.keys(item.observation).forEach((key) => {
        if (isEqual(item.observation[key], numberElement) || isEqual(+item.observation[key].value, numberElement)) {
          isSelected = true;
        }
        if (key === 'alerts') {
          const alerts = item.observation[key];
          alerts.forEach(alert => {
            if (+alert.code === numberElement) {
              isSelected = true;
            }
            if (alert.message.toLocaleLowerCase().search(numberElement) >= 0) {
              isSelected = true;
            }
          });
        }

      });
      Object.keys(item.station).forEach((key) => {
        if (isEqual(item.station[key], numberElement)) {
          isSelected = true;
        }
      });
      return isSelected;
    });
  }

  public checkIfAllArgsNotEqist(ele: string, args: string[]): boolean {
    const result = [];
    args.forEach((arg) => {
      result.push(ele.search(arg) === -1);
    });
    const arrSum = result.reduce((a, b) => a + b);
    return (arrSum / args.length) === 1;
  }

  public simpleFiltration(ele, filtratedValues) {
    const propertyFiltrationList = filtratedValues.filter((item) => {
      return item.observation[ele.toUpperCase()] || item.station[ele.toUpperCase()];
    });
    const valueFiltrationList = filtratedValues.filter((item) => {
      let isSelected = false;
      Object.keys(item.observation).forEach((key) => {
        if (key !== '@type' && (isEqual(item.observation[key], ele) ||
          isEqual(item.observation[key].status, ele))) {
          isSelected = true;
        }

        if (key === 'alerts') {
          const alerts = item.observation[key];
          alerts.forEach(alert => {
            if (alert.message.toLocaleLowerCase().search(ele.toLocaleLowerCase()) >= 0) {
              isSelected = true;
            }
          });
        }
      });

      Object.keys(item.station).forEach((key) => {
        if (isEqual(('' + item.station[key]).trim(), ele)) {
          isSelected = true;
        }
      });

      return isSelected;
    });
    return [].concat(propertyFiltrationList, valueFiltrationList);
  }

  public detectOperation(filtratedValues, ele, operationName) {
    let searchedList = [];
    const operation = opertaionObj[operationName].label;
    const func = opertaionObj[operationName].func;
    const excluted = opertaionObj[operationName].excluted;
    if (ele.search(operation) >= 0 && ele.search(excluted) === -1) {
      searchedList = this.filtrationByMark(filtratedValues, ele.split(operation), func);
    } else {
      searchedList = filtratedValues;
    }
    return searchedList;
  }

  public filtrationByMark(filtratedValues, valueList, selectedFunction) {
    const filtratedArray = filtratedValues.filter((item) => {
      const isSelectedObservation = this.genericCompare(item.observation[valueList[0].toUpperCase()], +valueList[1], selectedFunction);
      const isSelectedStation = this.genericCompare(item.station[valueList[0]], +valueList[1], selectedFunction);
      return isSelectedObservation || isSelectedStation;
    });
    return filtratedArray;
  }

  public checkEquality(filtratedValues, ele) {
    let filtratedArray = filtratedValues;
    if (this.checkIfAllArgsNotEqist(ele, ['>', '>=', '<', '<=']) && ele.search('=') >= 0) {
      const equal = ele.split('=');
      filtratedArray = filtratedValues.filter((item) => {
        let isSelected = false;
        if (item.observation[equal[0]] === equal[1] || ('' + item.station[equal[0]]).trim() === equal[1]) {
          isSelected = true;
        }

        if (typeof item.observation[equal[0].toUpperCase()] === 'object') {
          const observationEqual = isEqual(item.observation[equal[0].toUpperCase()].value, equal[1]);
          if (observationEqual) {
            isSelected = true;
          }
        }
        const alerts = item.observation.alerts;
        alerts.forEach(alert => {
          if (alert.code === equal[1]) {
            isSelected = true;
          }
        });
        return isSelected;
      });
    }
    return filtratedArray;
  }

  public splitDataByOperation(filtratedValues, ele) {
    filtratedValues = this.detectOperation(filtratedValues, ele, 'isBigger');
    filtratedValues = this.detectOperation(filtratedValues, ele, 'isSmaller');
    filtratedValues = this.detectOperation(filtratedValues, ele, 'isSmallerOrEqual');
    filtratedValues = this.detectOperation(filtratedValues, ele, 'isBiggerOrEqual');
    filtratedValues = this.checkEquality(filtratedValues, ele);
    return filtratedValues;
  }

  /**
   * Split searching string into multidimensional array.
   * Inner arrays are splitted by operators and have inner structure:
   * [element1, element2, operator]
   */
  public splitFilterMessageToRequests(filterValue) {
    const splittedValues = filterValue.split('&&');
    const preparedInput = [];
    splittedValues.forEach(element => {
      this.operatorsList.forEach(operator => {
        if (element.indexOf(operator) > -1) {
          const innerSplit = this.splitAt(element.indexOf(operator))(element);
          const searchObj: SubOperation = {
            leftHand: innerSplit[0],
            rightHand: innerSplit[1],
            operation: operator,
          };
          preparedInput.push(searchObj);
        }
      });
    });
    return preparedInput;
  }

  public customTrim(element) {
    if (element === undefined) {
      return element;
    }
    let clearElement = element;
    if (clearElement.search('\"') > -1) {
      const trimmedElement = clearElement.trim();
      clearElement = trimmedElement.toLocaleLowerCase().slice(1, trimmedElement.length - 1);
    }
    return clearElement;
  }

  public filterCollectionByMessage(collection, clearElement) {
    const filtratedCollection = collection.filter((innerElement) => {
      let isSelected = false;
      const alertsList = innerElement.observation.alerts;
      alertsList.forEach(alertElement => {
        if (alertElement.message.toLocaleLowerCase().search(clearElement) >= 0) {
          isSelected = true;
        }
      });
      return isSelected;
    });
    return filtratedCollection;
  }

  public filterCollectionByProperty(collection, clearElement) {
    const filtratedCollection = collection.filter((innerElement) => {
      let isSelected = false;
      const observationObj = innerElement.observation;
      const observationKeys = Object.keys(observationObj);
      observationKeys.forEach(alertElement => {
        if (alertElement.toLocaleLowerCase() === clearElement &&
          observationObj[alertElement].status !== basedValues.Clear) {
          isSelected = true;
        }
      });
      return isSelected;
    });
    return filtratedCollection;
  }

  public filterCollectionByCode(collection, clearElement) {
    const filtratedCollection = collection.filter((innerElement) => {
      const alertsList = innerElement.observation.alerts;
      return alertsList.findIndex(e => e.code === clearElement) > -1;
    });
    return filtratedCollection;
  }

  public filterCollectionByTime(collection, clearElement) {
    let timeString = clearElement;
    if (clearElement !== undefined) {
      timeString = clearElement.replace(/[-\.\s]/g, '');
      const minutePosition = timeString.search(':');
      if (minutePosition >= 0) {
        timeString = timeString.slice(0, minutePosition);
      }
    }
    timeString = timeString.length > 10 ? timeString.slice(0, 10) : timeString;
    const filtratedCollection = collection.filter((innerElement) => {
      const observation = innerElement.observation;
      return observation.dayTime.search(timeString) >= 0;
    });
    return filtratedCollection;
  }

  public observationFilter(filterValue: string, dataCollection) {
    const splittedFilter = this.splitFilterMessageToRequests(filterValue);
    let filtratedCollection = dataCollection;
    splittedFilter.forEach(element => {
      const trimmedKeyElement = this.customTrim(element.leftHand).trim().toLocaleLowerCase();
      const clearElement = this.customTrim(element.rightHand);
      const recreateFilter = (element.leftHand + element.operation + element.rightHand).trim();
      if (trimmedKeyElement === filtrationProperty.MESSAGE) {
        filtratedCollection = this.filterCollectionByMessage(filtratedCollection, clearElement);
      } else if (trimmedKeyElement === filtrationProperty.PROPERTY
        && clearElement !== undefined
        && clearElement.length !== 0) {
        filtratedCollection = this.filterCollectionByProperty(filtratedCollection, clearElement);
      } else if (trimmedKeyElement === filtrationProperty.COUNTRY) {
        filtratedCollection = filtratedCollection.filter((innerElement) => {
          return innerElement.station.country.toLocaleLowerCase().search(clearElement) >= 0;
        });
      } else if (trimmedKeyElement === filtrationProperty.TIME) {
        filtratedCollection = this.filterCollectionByTime(filtratedCollection, clearElement);
      } else if (trimmedKeyElement === filtrationProperty.STATIONNAME) {
        filtratedCollection = filtratedCollection.filter((innerElement) => {
          return innerElement.station.stationName.toLocaleLowerCase().search(clearElement) >= 0;
        });
      } else if (trimmedKeyElement === filtrationProperty.STATIONNUMBER
        && clearElement !== undefined
        && clearElement.length !== 0) {
        filtratedCollection = filtratedCollection.filter((innerElement) => {
          return innerElement.station.stationNumber === +clearElement;
        });
      } else if (trimmedKeyElement === filtrationProperty.CODE) {
        filtratedCollection = this.filterCollectionByCode(filtratedCollection, clearElement);
      } else if (trimmedKeyElement.toLocaleLowerCase().search(filtrationProperty.LATITUDE) >= 0 ||
        trimmedKeyElement.toLocaleLowerCase().search(filtrationProperty.LONGITUDE) >= 0 ||
        trimmedKeyElement.toLocaleLowerCase().search(filtrationProperty.ALTITUDE) >= 0
      ) {
        if (!this.checkIfAllArgsNotEqist(recreateFilter, ['>', '>=', '<', '<=', '='])) {
          filtratedCollection = this.splitDataByOperation(filtratedCollection, recreateFilter);
        }
      } else {
        if (!this.checkIfAllArgsNotEqist(recreateFilter, ['>', '>=', '<', '<=', '='])) {
          filtratedCollection = this.splitDataByOperation(filtratedCollection, recreateFilter);
        }
      }
    });
    return filtratedCollection;
  }

  public checkIfNotTouched(element) {
    let condition = true;
    if (element === undefined) {
      return condition;
    }
    element.alerts.forEach(ele => {
      const property = element[ele.property];
      if (property !== undefined) {
        const status = element[ele.property].status;
        if (status === basedValues.Suspicious || status === basedValues.Warning) {
          condition = false;
        }
      }
    });
    return condition;
  }

  public uniquePush(element, collection) {
    if (collection.indexOf(element) < 0) { collection.push(element); }
    return collection;
  }

  public sortVersions(collection) {
    return collection.slice().sort((item1, item2) => (new Date(item2.lastModified)).getTime() - (new Date(item1.lastModified)).getTime());
  }

  public sortFlows(collection) {
    return collection.slice().
      sort((previousItem, nextItem) => {
        if (previousItem.flowId > nextItem.flowId) {
          return -1;
        }
        if (nextItem.flowId > previousItem.flowId) {
          return 1;
        }
        return 0;
      });
  }

  public sortStations(collection) {
    return collection.slice().sort((item1, item2) => (
      item1.observation.station) - (item2.observation.station));
  }

}
