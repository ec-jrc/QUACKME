import { TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from './../../material-module';
import { Component,  Input  } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { FileSelectionComponent } from './fileSelection.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HelperService } from '../stationsSummaryData/helper.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const storeMock = {
  dispatch(ele) {
    return ele;
  }
};

@Component({
  selector: 'app-file-list',
  template: ``
})
class FileSelectionListMockComponent {
  @Input() dataSource;
  @Input() displayedColumns;
  @Input() selection;
  @Input() selectedFile;
}

describe('FileSelectionComponent', () => {
  const actions$: Observable<any> = of([]);

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        DemoMaterialModule,
        CommonModule,
        FormsModule,
        DemoMaterialModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({})
      ],
      providers: [
        { provide: Store, useValue: storeMock },
        HelperService,
        ActionsSubject,
        MatSnackBar,
        provideMockActions(() => actions$),
      ],
      declarations: [
        FileSelectionComponent,
        FileSelectionListMockComponent,
      ],
    }).compileComponents();
  }));

  it('should create the fileSelection component', () => {
    const fixture = TestBed.createComponent(FileSelectionComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });


  it('should test runScript: no result', () => {
    const fixture = TestBed.createComponent(FileSelectionComponent);
    const app = fixture.debugElement.componentInstance;
    const testAction = 'test';
    spyOn(app.store, 'dispatch');
    app.runScript(testAction);
    expect(app.store.dispatch).not.toHaveBeenCalled();
  });

  it('should test runScript', () => {
    const fixture = TestBed.createComponent(FileSelectionComponent);
    const app = fixture.debugElement.componentInstance;
    app.selectedFile = 'test file';
    const testAction = 'test';
    spyOn(app.store, 'dispatch');
    app.runScript(testAction);
    expect(app.store.dispatch).toHaveBeenCalled();
  });

  it('should test loadSelectedFlow', () => {
    const fixture = TestBed.createComponent(FileSelectionComponent);
    const app = fixture.debugElement.componentInstance;
    const testAction = { value: 'test' };
    spyOn(app.store, 'dispatch');
    app.loadSelectedFlow(testAction);
    expect(app.store.dispatch).toHaveBeenCalled();
  });

  describe('block of testing isAllObservationChecked',()=>{

    it('should test isAllObservationChecked', () => {
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
              status: 'F'
            }
          }
        }
      ];
      const fixture = TestBed.createComponent(FileSelectionComponent);
      const app = fixture.debugElement.componentInstance;
      const result = app.isAllObservationChecked(mockList);
      expect(result).toBeFalsy();
    });

    it('should test isAllObservationChecked', () => {
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
        },
        {
          station: {
            stationNumber: 2
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
      const fixture = TestBed.createComponent(FileSelectionComponent);
      const app = fixture.debugElement.componentInstance;
      const result = app.isAllObservationChecked(mockList);
      expect(result).toBeFalsy();
    });

    it('should test isAllObservationChecked', () => {
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
        },
        {
          station: {
            stationNumber: 2
          },
          observation: {
            test: {
              value: 1,
              status: 'SM'
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
              status: 'F'
            }
          }
        }
      ];
      const fixture = TestBed.createComponent(FileSelectionComponent);
      const app = fixture.debugElement.componentInstance;
      const result = app.isAllObservationChecked(mockList);
      expect(result).toBeTruthy();
    });
  });

});
