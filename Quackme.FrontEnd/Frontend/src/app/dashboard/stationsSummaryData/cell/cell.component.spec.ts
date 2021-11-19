import { TestBed, async } from '@angular/core/testing';
import { CellComponent } from './cell.component';

describe('CellComponent', () => {
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        CellComponent,
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should test detectValue function', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const app = fixture.debugElement.componentInstance;
    const property = 'test';
    const testObj = {
      observation: {

      }
    };
    const operation = 'value';
    const result = app.detectValue(property, testObj, operation);
    expect(result).toBe('');
  });

  it('should test detectValue function', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const app = fixture.debugElement.componentInstance;
    const property = 'test';
    const testObj = {
    };
    const operation = 'value';
    const result = app.detectValue(property, testObj, operation);
    expect(result).toBe('');
  });

  it('should test checkStatus function: element__item--normal', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const app = fixture.debugElement.componentInstance;
    const property = 'test';
    const testObj = {
    };
    const result = app.checkStatus(testObj, property);
    expect(result).toBe('element__item--normal');
  });

  it('should test checkStatus function: element__item--modified', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const app = fixture.debugElement.componentInstance;
    const property = 'test';
    const testObj = {
      observation: {
        test: {
          value: 1,
          status: 'M'
        }
      }
    };
    const result = app.checkStatus(testObj, property);
    expect(result).toBe('element__item--modified');
  });

  it('should test checkStatus function:element__item--forced', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const app = fixture.debugElement.componentInstance;
    const property = 'test';
    const testObj = {
      observation: {
        test: {
          value: 1,
          status: 'F'
        }
      }
    };
    const result = app.checkStatus(testObj, property);
    expect(result).toBe('element__item--forced');
  });


  it('should test detectValue function', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const app = fixture.debugElement.componentInstance;
    const property = 'test';
    const testObj = {
      observation: {
        test: {
          value: 1,
          status: 'M'
        }
      }
    };
    const operation = 'value';
    const result = app.detectValue(property, testObj, operation);
    expect(result).toBe(1);
  });


  it('should fill input and render data', () => {
    const fixture = TestBed.createComponent(CellComponent);
    const component = fixture.debugElement.componentInstance;
    const testObj = {
      observation: {
        test: {
          value: 1,
          status: 'M'
        }
      }
    };
    component.property = 'test';
    component.elementObj = testObj;
    fixture.detectChanges();
    const element = fixture.debugElement.nativeElement;
    const propertyName = element.querySelector('.element__item-property');
    const propertyValue = element.querySelector('.element__item-value');
    const propertyStatus = element.querySelector('.element__item-status');

    expect(propertyName.innerHTML.trim()).toBe('test:');
    expect(propertyValue.innerHTML.trim()).toBe('1');
    expect(propertyStatus.innerHTML.trim()).toBe('M');
  });
});
