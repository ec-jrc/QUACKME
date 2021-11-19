import { StationsSummaryDataService } from './stationsSummaryData.service';

describe('StationsSummaryDataService', () => {
  let service: StationsSummaryDataService;
  beforeEach(() => { service = new StationsSummaryDataService(); });

  it('getValue should return real value', () => {
    expect(service).toBeTruthy();
  });

  it('should test simpleParseDate', () => {
    const result = service.simpleParseDate(2019010106);
    expect(result).toBe('2019-01-01 06:00 UTC');
  });

  it('should test simpleParseDate', () => {
    const result = service.simpleParseDate(201901010101);
    expect(result).toBe(result);
  });

  it('should test countModyfiedElements 0/1', () => {
    const list = [
      {
        observation: {
          test: {
            status: 'W'
          }
        }
      }
    ];
    const result = service.countModyfiedElements(list);
    expect(result.all).toBe(1);
    expect(result.edited).toBe(0);
  });

  it('should test countModyfiedElements: 1/1', () => {
    const list = [
      {
        observation: {
          test: {
            status: 'M'
          }
        }
      }
    ];
    const result = service.countModyfiedElements(list);
    expect(result.all).toBe(1);
    expect(result.edited).toBe(1);
  });


  it('should test countModyfiedElements: 1/2', () => {
    const list = [
      {
        observation: {
          test: {
            status: 'M'
          }
        }
      },
      {
        observation: {
          test: {
            status: 'W'
          }
        }
      }
    ];
    const result = service.countModyfiedElements(list);
    expect(result.all).toBe(2);
    expect(result.edited).toBe(1);
  });

  it('should test countModyfiedElements: 1/2', () => {
    const list = [
      {
        observation: {
          test: {
            status: 'M'
          },
          test2: {
            status: 'S'
          }
        }
      },
      {
        observation: {
          test: {
            status: 'W'
          }
        }
      }
    ];
    const result = service.countModyfiedElements(list);
    expect(result.all).toBe(2);
    expect(result.edited).toBe(0);
  });


  describe('parseDate function()', () => {
    it('should test parseDate \'01 - 01 - 1971 00: 00: 00\': [\'\']', () => {
      const testedDate = '01.01.1971';
      const expectedResult = '01-01-1971 00:00:00';
      const result = service.parseDate(testedDate);
      expect(result).toBe(expectedResult);
    });
    it('should test parseDate \'11 - 11 - 1971 00: 00: 00\': ', () => {
      const testedDate = '11.11.1971';
      const expectedResult = '11-11-1971 00:00:00';
      const result = service.parseDate(testedDate);
      expect(result).toBe(expectedResult);
    });
    it('should test parseDate \'11.11.1971 10: 10: 10\': ', () => {
      const testedDate = '11.11.1971 10:10:10';
      const expectedResult = '11-11-1971 10:10:10';
      const result = service.parseDate(testedDate);
      expect(result).toBe(expectedResult);
    });
  });

});
