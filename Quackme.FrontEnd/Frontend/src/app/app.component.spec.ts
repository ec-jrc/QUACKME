import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DemoMaterialModule } from './material-module';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActionsSubject, Store } from '@ngrx/store';
import { StoreModule } from '@ngrx/store';
import { AuthService } from './sharedServices/auth.service';

const storeMock = {
  dispatch(ele) {
    return ele;
  }
};

const mockAuth = {

};

describe('AppComponent', () => {
  let actions$: Observable<any> = of([]);
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      providers: [
        ActionsSubject,
        MatSnackBar,
        { provide: Store, useValue: storeMock },
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: mockAuth }
      ],
      imports: [
        DemoMaterialModule,
        RouterTestingModule,
        StoreModule.forRoot({})
      ],
      declarations: [
        HeaderComponent,
        AppComponent,
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'MARS - QUACKME'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('MARS - QUACKME');
  });

  it(`should test 'LoadStationSuccess'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    actions$ = of([{ test: 1 }]);
    fixture.detectChanges();
    expect(app.title).toEqual('MARS - QUACKME');
  });

  it('should test displayMessage', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const testMessage = 'test';
    spyOn(app.snackBar, 'open');
    app.displayMessage(testMessage);
    expect(app.snackBar.open).toHaveBeenCalled();
  });


});
