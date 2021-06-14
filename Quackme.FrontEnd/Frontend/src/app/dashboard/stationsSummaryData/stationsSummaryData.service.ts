import { Injectable } from '@angular/core';
import { basedValues } from './../../sharedServices/stepsConaitener';

@Injectable()
export class StationsSummaryDataService {
  public selectedStation = [];
  public selectedCheckLevel;
  public versions = [];
  constructor() { }

  public simpleParseDate(date) {
    const dateasString = '' + date;
    if (dateasString.length !== 10) {
      return date;
    }
    const year = dateasString.slice(0, 4);
    const mounth = dateasString.slice(4, 6);
    const day = dateasString.slice(6, 8);
    const hour = dateasString.slice(-2);
    return `${year}-${mounth}-${day} ${hour}:00 UTC`;
  }

  public parseDate(date) {
    const dateObject = new Date(date);
    const startDay = dateObject.getDate() < 10 ? '0' + dateObject.getDate() : dateObject.getDate();
    const startMounth = dateObject.getMonth() + 1 < 10 ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1;
    const hoursUTC = dateObject.getHours() < 10 ? '0' + dateObject.getHours() : dateObject.getHours();
    const minutesUTC = dateObject.getUTCMinutes() < 10 ? '0' + dateObject.getUTCMinutes() : dateObject.getUTCMinutes();
    const secondUTC = dateObject.getUTCSeconds() < 10 ? '0' + dateObject.getUTCSeconds() : dateObject.getUTCSeconds();
    const parsedDate = `${startDay}-${startMounth}-${dateObject.getFullYear()} ${hoursUTC}:${minutesUTC}:${secondUTC}`;
    return parsedDate;
  }

  public countModyfiedElements(list) {
    let editedCounter = 0;
    list.forEach((ele) => {
      const keys = Object.keys(ele.observation);
      let edited = true;
      keys.forEach(key => {
        if (ele.observation[key].status === basedValues.Suspicious || ele.observation[key].status === basedValues.Warning) {
          edited = false;
        }
      });
      if (edited) {
        editedCounter++;
      }
    });
    const result = {
      all: list.length,
      edited: editedCounter
    };
    return result;
  }
}
