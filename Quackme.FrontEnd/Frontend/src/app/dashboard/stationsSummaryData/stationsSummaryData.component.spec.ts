import { TestBed, async } from '@angular/core/testing';
import { StationsSummaryDataComponent } from './stationsSummaryData.component';
import { FormControl, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from './../../material-module';
import { Component, DebugElement, Input, Output, EventEmitter } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { StationsSummaryDataService } from './stationsSummaryData.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HelperService } from './helper.service';
import { and } from '@angular/router/src/utils/collection';

const helperServiceMock = {
  observationFilter(input1, input2) {
    return true;
  },
  checkIfNotTouched() {
    return true;
  },
  uniquePush(ele) {
    return ele;
  }
};

const storeMock = {
  dispatch(ele) {
    return ele;
  }
};

const stationsSummaryDataServiceMock = {
  simpleParseDate(input) {
    return input;
  },
  parseDate(input) {
    return input;
  },
  versions() {
    return true;
  },
  selectedStation: 'test'
};

@Component({
  selector: 'app-cell',
  template: ``
})
class MockAppComponent {
  @Input() property: string;
  @Input() elementObj;

}

@Component({
  selector: 'app-alerts',
  template: ``
})
class MockAppAlertsComponent {
  @Input() alertObj;
  @Input() elementObj;
  @Input() isEditingDisable;
  @Output() outputObj = new EventEmitter();
}

describe('StationsSummaryDataComponent', () => {
  const actions$: Observable<any> = of([]);
  let fixture;
  let app;
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        DemoMaterialModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot({}),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: Store, useValue: storeMock },
        ActionsSubject,
        provideMockActions(() => actions$),
        { provide: StationsSummaryDataService, useValue: stationsSummaryDataServiceMock },
        { provide: HelperService, useValue: helperServiceMock },
      ],
      declarations: [
        MockAppComponent,
        MockAppAlertsComponent,
        StationsSummaryDataComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StationsSummaryDataComponent);
    app = fixture.debugElement.componentInstance;
  });

  it('should create the app', () => {

    expect(app).toBeTruthy();
  });

  it('should updateValues ', () => {

    const list = [
      { ele: 1 },
      { ele: 2 },
      { ele: 3 },
      { ele: 4 },
    ];
    app.updateValues(list);
    expect(app).toBeTruthy();
    expect(app.dataSource.value.length).toBe(4);
  });

  it('should upDateInnerCollection ', () => {

    const list = [
      { ele: 1 },
      { ele: 2 },
      { ele: 3 },
      { ele: 4 },
    ];
    app.upDateInnerCollection(list);
    expect(app).toBeTruthy();
    expect(app.dataSource.value.length).toBe(4);
  });

  it('should customParseDate ', () => {

    spyOn(stationsSummaryDataServiceMock, 'simpleParseDate').and.returnValue(
      true
    );
    const date = 2019081401;
    const result = app.customParseDate(date);
    expect(result).toBeTruthy();
  });

  it('should call parseInputDate', () => {

    spyOn(stationsSummaryDataServiceMock, 'parseDate').and.returnValue(true);
    const result = app.parseInputDate('20190101');
    expect(result).toBeTruthy();
  });


  it('should call checkEqualStatus', () => {

    const val1 = 2;
    const val2 = 2;
    const result = app.checkEqualStatus(val1, val2);
    expect(result).toBeTruthy();
  });

  it('should call checkEqualStatus', () => {

    const val1 = 2;
    const val2 = 1;
    const result = app.checkEqualStatus(val1, val2);
    expect(result).toBeFalsy();
  });

  it('should call checkIfNotTouched', () => {

    spyOn(helperServiceMock, 'checkIfNotTouched').and.returnValue(true);
    const testElement = {};
    const result = app.checkIfNotTouched(testElement);
    expect(result).toBeTruthy();
  });

  it('should call saveValues', () => {


    app.formData = [];
    const result = app.saveValues();
    expect(result).toBe(undefined);
  });

  it('should call saveValues: propagate changes', () => {

    app.fileName = 'test';
    app.flowId = '1';
    app.formData = [{}];
    spyOn(app.store, 'dispatch');
    app.saveValues();
    expect(app.store.dispatch).toHaveBeenCalled();
  });

  describe('applyFilter test', () => {
    it('should test empty input', () => {


      const result = app.applyFilter('');
      expect(result).toBe(undefined);
    });

    it('should test non empty input', () => {


      spyOn(app, 'upDateInnerCollection');
      const result = app.applyFilter('test');
      expect(result).toBe(undefined);
      expect(app.upDateInnerCollection).toHaveBeenCalled();
    });
  });

  it('should call getSortedVersion', () => {

    spyOn(stationsSummaryDataServiceMock, 'versions').and.returnValue(true);
    const result = app.getSortedVersion();
    expect(result).toBeTruthy();
  });

  describe('alertListner', () => {
    const testData = [
      {
        station: 1,
        dayTime: 1,
        value: 1
      },
      {
        station: 2,
        dayTime: 2,
        value: 2
      },
      {
        station: 3,
        dayTime: 3,
        value: 3
      },
      {
        station: 4,
        dayTime: 4,
        value: 4
      }
    ];
    const testelement = {
      station: 3,
      dayTime: 3,
      value: 4
    };
    it('should call alertListner', () => {
      app.formData = testData;
      spyOn(stationsSummaryDataServiceMock, 'versions').and.returnValue(true);
      app.alertListner(testelement);
      const result = app.formData;
      expect(result.length).toBe(4);
      expect(result[3].value).toBe(testelement.value);
    });

    it('should call alertListner: element not found', () => {


      app.formData = testData;
      spyOn(stationsSummaryDataServiceMock, 'versions').and.returnValue(true);
      app.alertListner(testelement);
      const result = app.formData;
      expect(result.length).toBe(4);
      expect(result[3].value).toBe(testData[3].value);
    });
  });

  describe('getSelectedfile', () => {
    it('should call getSelectedfile', () => {
      const testElement = {
        value: { versionId: 1 }
      };
      app.stationsSummaryDataService.versions = [{ versionId: 1 }];
      spyOn(app.store, 'dispatch');
      app.getSelectedfile(testElement);
      expect(app.store.dispatch).toHaveBeenCalled();
    });
  });

  describe('triggerFiltration', () => {
    it('should call triggerFiltration, normal behaviour', () => {
      const testCollectin = [
        {
          observation: {
            test: {
              status: 'S'
            }
          }
        }
      ];
      app.collection = testCollectin;
      spyOn(app.helperService, 'uniquePush');
      app.triggerFiltration();
      expect(app.helperService.uniquePush).toHaveBeenCalled();
    });

    it('should call triggerFiltration, modified', () => {
      const testCollectin = [
        {
          observation: {
            test: {
              status: 'M'
            }
          }
        }
      ];
      app.collection = testCollectin;
      spyOn(app.helperService, 'uniquePush');
      app.triggerFiltration();
      expect(app.helperService.uniquePush).toHaveBeenCalled();
    });

    it('should call triggerFiltration, modified and falsed', () => {
      const testCollectin = [
        {
          observation: {
            test: {
              status: 'M'
            }
          }
        }
      ];
      app.ModifiedAlerts = false;
      app.collection = testCollectin;
      spyOn(app.helperService, 'uniquePush');
      app.triggerFiltration();
      expect(app.helperService.uniquePush).not.toHaveBeenCalled();
    });

    it('should call triggerFiltration, forced', () => {
      const testCollectin = [
        {
          observation: {
            test: {
              status: 'F'
            }
          }
        }
      ];
      app.collection = testCollectin;
      spyOn(app.helperService, 'uniquePush');
      app.triggerFiltration();
      expect(app.helperService.uniquePush).toHaveBeenCalled();
    });


    it('should call triggerFiltration, forced and false', () => {
      const testCollectin = [
        {
          observation: {
            test: {
              status: 'F'
            }
          }
        }
      ];
      app.collection = testCollectin;
      app.forcedAlerts = false;
      spyOn(app.helperService, 'uniquePush');
      app.triggerFiltration();
      expect(app.helperService.uniquePush).not.toHaveBeenCalled();
    });
  });


  describe('smaller functions', () => {
    it('should call displayedStation', () => {
      const testElement = 'test';
      spyOn(stationsSummaryDataServiceMock, 'selectedStation').and.returnValue(true);
      spyOn(app.store, 'dispatch');
      app.displayedStation(testElement);
      expect(app.store.dispatch).toHaveBeenCalled();
    });

    it('should call checkNotTouchedObservation', () => {
      const testElement = 'W';
      const result = app.checkNotTouchedObservation(testElement);
      expect(result).toBeTruthy();
    });

    it('should call checkNotTouchedObservation', () => {
      const testElement = 'S';
      const result = app.checkNotTouchedObservation(testElement);
      expect(result).toBeTruthy();
    });

    it('should call checkNotTouchedObservation', () => {
      const testElement = 'F';
      const result = app.checkNotTouchedObservation(testElement);
      expect(result).toBeFalsy();
    });

    it('should call checkNotTouchedObservation', () => {
      const testElement = 'M';
      const result = app.checkNotTouchedObservation(testElement);
      expect(result).toBeFalsy();
    });

    it('should call actionOnLoadStationSuccess', () => {
      spyOn(app, 'upDateInnerCollection');
      spyOn(app.store, 'dispatch');
      app.actionOnLoadStationSuccess();
      expect(app.upDateInnerCollection).toHaveBeenCalled();
      expect(app.stationsSummaryDataService.selectedStation.length).toBe(0);
      expect(app.store.dispatch).toHaveBeenCalled();
    });

  });

  describe('actionOnScrollToStation', () => {
    it('should call actionOnScrollToStation', () => {
      const testElement = 'test';
      const mockState = {
        station: {
          options: {
            stationNumber: 1
          }
        }
      };
      const mockList = [
        {
          station: {
            stationNumber: 1
          },
          observation: {
            test: {
              value: 1,
              status: 'M'
            }
          }
        },
        {
          station: {
            stationNumber: 1
          },
          observation: {
            test: {
              value: 2,
              status: 'S'
            }
          }
        },
        {
          station: {
            stationNumber: 2
          },
          observation: {
            test: {
              value: 1,
              status: 'W'
            }
          }
        },
        {
          station: {
            stationNumber: 3
          },
          observation: {
            test: {
              value: 3,
              status: 'S'
            }
          }
        }
      ];
      app.stationsSummaryDataService.selectedStation = mockList;
      app.viewPort = {
        scrollToIndex(value) {

        }
      };
      spyOn(app, 'getFirstNotTouchedStation');
      app.actionOnScrollToStation(mockState);

      expect(app.getFirstNotTouchedStation).toHaveBeenCalledWith([]);
    });
  });

  describe('getFirstNotTouchedStation', () => {
    it('should call getFirstNotTouchedStation', () => {
      const mockList = [
        {
          station: {
            stationNumber: 1
          },
          observation: {
            test: {
              value: 1,
              status: 'M'
            }
          }
        },
        {
          station: {
            stationNumber: 1
          },
          observation: {
            test: {
              value: 2,
              status: 'S'
            }
          }
        }];
      const result = app.getFirstNotTouchedStation(mockList);
      expect(result).toBe(mockList[1]);
    });

    it('should call getFirstNotTouchedStation one item', () => {
      const mockList = [
        {
          station: {
            stationNumber: 1
          },
          observation: {
            test: {
              value: 2,
              status: 'S'
            }
          }
        }];

      const result = app.getFirstNotTouchedStation(mockList);
      expect(result).toBe(mockList[0]);
    });

    it('should call getFirstNotTouchedStation, everything modified', () => {
      const mockList = [
        {
          station: {
            stationNumber: 1
          },
          observation: {
            test: {
              value: 1,
              status: 'M'
            }
          }
        },
        {
          station: {
            stationNumber: 1
          },
          observation: {
            test: {
              value: 2,
              status: 'M'
            }
          }
        }];
      const result = app.getFirstNotTouchedStation(mockList);
      expect(result).toBe(mockList[0]);
    });

  });


});
