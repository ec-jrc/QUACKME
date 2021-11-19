import {
  HelperService
} from './helper.service';
import { Property } from '../../sharedServices/models';
import mockData from './mockObservations';
import { isBigger, isEqual, isBiggerOrEqual } from '../../sharedServices/filtering.service';

const observationSample = [{
  station: {
    stationNumber: 1001,
    stationName: 'Jan Mayen',
    wmoNo: 1001,
    latitude: 70.9333,
    longitude: -8.6667,
    country: 'Norway'
  },
  observation: {
    '@type': 'W',
    alerts: [{
      level: 'S',
      property: 'TD',
      code: '003',
      message: 'Dew point temperature between two consecutive records (either hourly or 3-hourly) LESS than 0.1 degree',
      status: '?'
    }, {
      level: 'S',
      property: 'FF',
      code: '002',
      message: 'Wind speed between two consecutive records (either hourly or 3-hourly) LESS than 0.5 m/sec',
      status: '?'
    }],
    station: 1001,
    dayTime: '2018050202',
    TD: {
      value: '3',
      status: 'F'
    },
    FF: {
      value: '7.7',
      status: 'S'
    }
  }
},
{
  station: {
    stationNumber: 1002,
    stationName: 'Verlegenhuken',
    wmoNo: 1002,
    latitude: 80.05,
    longitude: 16.25,
    country: 'Norway'
  },
  observation: {
    '@type': 'W',
    alerts: [{
      level: 'S',
      property: 'DIR',
      code: '002',
      message: 'Wind direction between two consecutive records(either hourly or 3- hourly) LESS than 5 degree',
      status: ' ? '
    }],
    station: 1002,
    dayTime: '2018050206',
    DIR: {
      value: '140',
      status: 'S'
    }
  }
}];

describe('helper.service', () => {
  let service: HelperService;

  beforeEach(() => {
    service = new HelperService();

  });
  describe('splitInputToValues function()', () => {
    it('should test empty string: [\'\']', () => {
      const testedString = '';
      const result = service.splitInputToValues(testedString);
      expect(result).toEqual([testedString]);
    });

    it('should test string: [\'testString\']', () => {
      const testedString = 'testString';
      const result = service.splitInputToValues(testedString);
      expect(result).toEqual([testedString]);
    });

    it('should test string: [\'testString & testString\']', () => {
      const testedString = 'testString&testString';
      const result = service.splitInputToValues(testedString);
      expect(result.length).toBe(2);
      expect(result.length).not.toBe(1);
      expect(result.length).not.toBe(3);
    });
  });

  describe('genericCompare function()', () => {
    it('should test undefined parameter: [\'\']', () => {
      const item = undefined;
      const itemToCompare = undefined;
      const opertaion = undefined;
      const result = service.genericCompare(item, itemToCompare, opertaion);
      expect(result).toBeFalsy();
    });

    it('should test  string: [\'testString\']', () => {
      const item: Property = {
        value: '2',
        status: 'S'
      };
      const itemToCompare = undefined;
      const opertaion = () => {
        return true;
      };
      const result = service.genericCompare(item, itemToCompare, opertaion);
      expect(result).toBeTruthy();
    });
  });

  describe('numberFiltration function()', () => {
    it('should test numberFiltration stationproperty', () => {
      const testNumber = 1001;
      const mockObservations = mockData;
      const result = service.numberFiltration(mockObservations, testNumber);
      expect(result[0].station.stationName).toBe(mockObservations[0].station.stationName);
      expect(result[0].station.stationName).toBe(mockObservations[1].station.stationName);
    });

    it('should test numberFiltration object property', () => {
      const testNumber = 140;
      const mockObservations = mockData;
      const result = service.numberFiltration(mockObservations, testNumber);
      expect(result[0].station.stationName).toBe(mockObservations[3].station.stationName);
      expect(result.length).toBe(3);
    });
  });

  describe('checkIfAllArgsNotEqist function()', () => {
    it('should test checkIfAllArgsNotEqist on empty string', () => {
      const inputString = '';
      const validatorsList = ['>'];
      const result = service.checkIfAllArgsNotEqist(inputString, validatorsList);
      expect(result).toBeTruthy();
    });

    it('should test checkIfAllArgsNotEqist on random string', () => {
      const inputString = 'asdfqwer>5';
      const validatorsList = ['>', '>=', '=', '<', '<='];
      const result = service.checkIfAllArgsNotEqist(inputString, validatorsList);
      expect(result).toBeFalsy();
    });

    it('should test checkIfAllArgsNotEqist on random string', () => {
      const inputString = 'asdfqwer>5';
      const validatorsList = ['='];
      const result = service.checkIfAllArgsNotEqist(inputString, validatorsList);
      expect(result).toBeTruthy();
    });


    it('should test checkIfAllArgsNotEqist on random string', () => {
      const inputString = 'asdfqwer>5';
      const validatorsList = ['>'];
      const result = service.checkIfAllArgsNotEqist(inputString, validatorsList);
      expect(result).toBeFalsy();
    });

    it('should test checkIfAllArgsNotEqist on random string', () => {
      const inputString = 'asdfqwer=5';
      const validatorsList = ['>', '>=', '<', '<='];
      const result = service.checkIfAllArgsNotEqist(inputString, validatorsList);
      expect(result).toBeTruthy();
    });

  });

  describe('simpleFiltration function()', () => {
    it('should test simpleFiltration: 2 item selected', () => {
      const validatorsList = observationSample;
      const element = 'stationNumber';
      const result = service.simpleFiltration(element, validatorsList);
      expect(result.length).toBe(2);
    });

    it('should test simpleFiltration: 1 item selected', () => {
      const validatorsList = observationSample;
      const element = '1001';
      const result = service.simpleFiltration(element, validatorsList);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).not.toBe(observationSample[1].station.stationName);
    });

    it('should test simpleFiltration: 1 item selected', () => {
      const validatorsList = observationSample;
      const element = 'DIR';
      const result = service.simpleFiltration(element, validatorsList);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).not.toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).toBe(observationSample[1].station.stationName);
    });

    it('should test simpleFiltration: 1 item selected', () => {
      const validatorsList = observationSample;
      const element = 'TD';
      const result = service.simpleFiltration(element, validatorsList);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).not.toBe(observationSample[1].station.stationName);
    });

    it('should test simpleFiltration: 1 item selected', () => {
      const validatorsList = observationSample;
      const element = 'F';
      const result = service.simpleFiltration(element, validatorsList);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).not.toBe(observationSample[1].station.stationName);
    });

    it('should test simpleFiltration: 2 item selected', () => {
      const validatorsList = observationSample;
      const element = 'S';
      const result = service.simpleFiltration(element, validatorsList);
      expect(result.length).toBe(2);
    });

    it('should test simpleFiltration: 1 item selected', () => {
      const validatorsList = observationSample;
      const element = '2018050202';
      const result = service.simpleFiltration(element, validatorsList);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).not.toBe(observationSample[1].station.stationName);
    });

  });

  describe('filtrationByMark function()', () => {
    it('should test filtrationByMark with isBigger: 1 item selected', () => {
      const collection = observationSample;
      const element = 'DIR=140';
      const result = service.filtrationByMark(collection, element.split('='), isEqual);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).not.toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).toBe(observationSample[1].station.stationName);
    });

    it('should test filtrationByMark with isBigger: 1 item selected', () => {
      const collection = observationSample;
      const element = 'DIR>=130';
      const result = service.filtrationByMark(collection, element.split('>='), isBiggerOrEqual);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).not.toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).toBe(observationSample[1].station.stationName);
    });

    it('should test filtrationByMark with isBigger: 1 item selected', () => {
      const collection = observationSample;
      const element = 'DIR>=140';
      const result = service.filtrationByMark(collection, element.split('>='), isBiggerOrEqual);
      expect(result.length).toBe(1);
      expect(result[0].station.stationName).not.toBe(observationSample[0].station.stationName);
      expect(result[0].station.stationName).toBe(observationSample[1].station.stationName);
    });

    it('should test filtrationByMark with isBigger: 0 item selected', () => {
      const collection = observationSample;
      const element = 'DIR>140';
      const result = service.filtrationByMark(collection, element.split('>'), isBigger);
      expect(result.length).toBe(0);
    });
  });

  describe('checkEquality function()', () => {
    it('should test checkEquality with isBigger: 1 item selected Property search', () => {
      const collection = observationSample;
      const element = 'DIR=140';
      const result = service.checkEquality(collection, element);
      expect(result.length).toBe(1);
    });
    it('should test checkEquality with isBigger: 1 item selected station name', () => {
      const collection = observationSample;
      const element = 'stationName=Jan Mayen';
      const result = service.checkEquality(collection, element);
      expect(result.length).toBe(1);
    });
    it('should test checkEquality with isBigger: 1 item selected dayTime', () => {
      const collection = observationSample;
      const element = 'dayTime=2018050202';
      const result = service.checkEquality(collection, element);
      expect(result.length).toBe(1);
    });
    it('should test checkEquality with isBigger: 1 item selected dayTime', () => {
      const collection = observationSample;
      const element = 'DIR>=140';
      const result = service.checkEquality(collection, element);
      expect(result.length).toBe(2);
    });
    it('should test checkEquality with isBigger: 1 item selected dayTime', () => {
      const collection = observationSample;
      const element = 'DIR=150';
      const result = service.checkEquality(collection, element);
      expect(result.length).toBe(0);
    });
  });

  describe('detectOperation function()', () => {
    it('should test detectOperation with isBigger: 1 item selected dayTime', () => {
      const collection = observationSample;
      const element = 'DIR>140';
      const result = service.detectOperation(collection, element, 'isBigger');
      expect(result.length).toBe(0);
    });
    it('should test detectOperation with isBigger: 1 item selected dayTime', () => {
      const collection = observationSample;
      const element = 'DIR>=140';
      const result = service.detectOperation(collection, element, 'isBiggerOrEqual');
      expect(result.length).toBe(1);
    });
    it('should test detectOperation with isBigger: 1 item selected dayTime', () => {
      const collection = observationSample;
      const element = 'DIR<140';
      const result = service.detectOperation(collection, element, 'isBiggerOrEqual');
      expect(result.length).toBe(2);
    });
  });

  describe('observationFilter function()', () => {
    it('should test observationFilter and return 1 object', () => {
      const collection = observationSample;
      const element = 'DIR>=140';
      const result = service.observationFilter(element, collection);
      expect(result.length).toBe(1);
    });

    it('should test observationFilter with number: 1 element', () => {
      const collection = observationSample;
      const element = '140';
      const result = service.observationFilter(element, collection);
      expect(result.length).toBe(1);
    });

    it('should test observationFilter with PropertyName: 1 element', () => {
      const collection = observationSample;
      const element = 'DIR';
      const result = service.observationFilter(element, collection);
      expect(result.length).toBe(1);
    });
    it('should test observationFilter with PropertyName: 1 element', () => {
      const collection = observationSample;
      const element = 'stationName';
      const result = service.observationFilter(element, collection);
      expect(result.length).toBe(2);
    });
    it('should test observationFilter with PropertyName: 1 element', () => {
      const collection = mockData;
      const element = 'DIR=140&stationNumber=1026';
      const result = service.observationFilter(element, collection);
      expect(result.length).toBe(1);
    });
  });

  describe('uniquePush function()', () => {
    it('should test uniquePush with empty array: ', () => {
      const collection = [];
      const element = {
        id: 1
      };
      const result = service.uniquePush(element, collection);
      expect(result.length).toBe(1);
    });

    it('should test uniquePush with non empty array: ', () => {
      const collection = [];
      const element1 = {
        id: 1
      };
      const element2 = {
        id: 2
      };
      collection.push(element1);
      const result = service.uniquePush(element2, collection);
      expect(result.length).toBe(2);
    });

    it('should test uniquePush with non empty array the same element: ', () => {
      const collection = [];
      const element1 = {
        id: 1
      };
      collection.push(element1);
      const result = service.uniquePush(element1, collection);
      expect(result.length).toBe(1);
    });
  });

  describe('sortVersions function()', () => {
    const collection = [
      {
        lastModified: '2019-08-14'
      },
      {
        lastModified: '2019-08-15'
      },
      {
        lastModified: '2019-08-16'
      }
    ];

    it('should test sortVersions with empty array: ', () => {
      const testCollection = [];
      const result = service.sortVersions(testCollection);
      expect(result.length).toBe(0);
    });

    it('should test sortVersions with empty array: ', () => {
      const result = service.sortVersions(collection);
      expect(result.length).toBe(3);
      expect(result[0]).toBe(collection[0]);
    });
  });

  describe('sortVersions function()', () => {
    const collection = [
      {
        observation: {
          station: 3
        }
      },
      {
        observation: {
          station: 2
        }
      },
      {
        observation: {
          station: 1
        }
      }
    ];

    it('should test sortVersions with empty array: ', () => {
      const testCollection = [];
      const result = service.sortVersions(testCollection);
      expect(result.length).toBe(0);
    });

    it('should test sortVersions with empty array: ', () => {
      const result = service.sortVersions(collection);
      expect(result.length).toBe(3);
      expect(result[0]).toBe(collection[0]);
    });
  });

  describe('customParseDate test', () => {

    it('should test customParseDate, simple 00', () => {
      const result = service.customParseDate('2019-01-01 00:00:00');
      expect(result).toBe('01-01-2019 00');
    });

    it('should test customParseDate, simple 01', () => {
      const result = service.customParseDate('2019-01-01 01:00:00');
      expect(result).toBe('01-01-2019 01');
    });

    it('should test customParseDate, simple 11', () => {
      const result = service.customParseDate('2019-01-01 11:00:00');
      expect(result).toBe('01-01-2019 11');
    });

    it('should test customParseDate, simple 23', () => {
      const result = service.customParseDate('2019-01-01 23:00:00');
      expect(result).toBe('01-01-2019 23');
    });

    it('should test customParseDate, test month', () => {
      const result = service.customParseDate('2019-10-01 23:00:00');
      expect(result).toBe('01-10-2019 23');
    });

    it('should test customParseDate, simple day', () => {
      const result = service.customParseDate('2019-01-10 23:00:00');
      expect(result).toBe('10-01-2019 23');
    });
  });

  describe('checkIfNotTouched test', () => {
    it('should test checkIfNotTouched, test W: false', () => {
      const element = {
        observation: {
          test: {
            status: 'W'
          },
          alerts: [{
            property: 'test'
          }]
        }
      };
      const result = service.checkIfNotTouched(element);
      expect(result).toBeFalsy();
    });

    it('should test checkIfNotTouched, test S: false', () => {
      const element = {
        observation: {
          test: {
            status: 'S'
          },
          alerts: [{
            property: 'test'
          }]
        }
      };
      const result = service.checkIfNotTouched(element);
      expect(result).toBeFalsy();
    });

    it('should test checkIfNotTouched, test M: true', () => {
      const element = {
        observation: {
          test: {
            status: 'M'
          },
          alerts: [{
            property: 'test'
          }]
        }
      };
      const result = service.checkIfNotTouched(element);
      expect(result).toBeTruthy();
    });

    it('should test checkIfNotTouched, test F: true', () => {
      const element = {
        observation: {

          test: {
            status: 'F'
          },
          alerts: [{
            property: 'test'
          }]
        }
      };
      const result = service.checkIfNotTouched(element);
      expect(result).toBeTruthy();
    });

    it('should test checkIfNotTouched cross check, test F: false', () => {
      const element = {
        observation: {
          test: {
            status: 'F'
          },
          test2: {
            status: 'W'
          },
          alerts: [{
            property: 'test'
          },
          {
            property: 'test2'
          }]
        }
      };
      const result = service.checkIfNotTouched(element);
      expect(result).toBeFalsy();
    });

    it('should test checkIfNotTouched cross check, test F: true', () => {
      const element = {
        observation: {
          test: {
            status: 'F'
          },
          test2: {
            status: 'M'
          },
          alerts: [{
            property: 'test'
          },
          {
            property: 'test2'
          }]
        }
      };
      const result = service.checkIfNotTouched(element);
      expect(result).toBeTruthy();
    });
  });

  describe('checkIfNotTouched test', () => {
    it('should test sortStations', () => {
      const list = [{
        observation: {
          station: 2,
        }
      },
      {
        observation: {
          station: 1,
        }
      }];
      const result = service.sortStations(list);
      expect(result[0].observation.station).toBe(1);
    });
  });

});
