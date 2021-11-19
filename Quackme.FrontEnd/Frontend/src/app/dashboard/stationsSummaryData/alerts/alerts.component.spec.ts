import { TestBed, async } from '@angular/core/testing';
import { AlertsComponent } from './alerts.component';
import { FormControl, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from './../../../material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

describe('AlertsComponent', () => {
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        DemoMaterialModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      declarations: [
        AlertsComponent,
      ],
    }).compileComponents();
  }));

  it('should create the AlertsComponent', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should create the AlertsComponent', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const app = fixture.debugElement.componentInstance;
    app.alertObj = {
      property: 'test'
    };
    app.elementObj = {
      test: {
        status: 'W',
        value: 1
      }
    };
    app.outputObj = {};
    fixture.detectChanges();
    expect(app).toBeTruthy();
    expect(app.propertyName).toBe('test');
    expect(app.checkParameter).toBeFalsy();
  });

  it('should create the AlertsComponent forced Value', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const app = fixture.debugElement.componentInstance;
    app.alertObj = {
      property: 'test'
    };
    app.elementObj = {
      test: {
        status: 'F',
        value: 1
      }
    };
    app.outputObj = {};
    fixture.detectChanges();
    expect(app).toBeTruthy();
    expect(app.propertyName).toBe('test');
    expect(app.checkParameter).toBeTruthy();
  });

  it('should create the AlertsComponent forced Value', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const app = fixture.debugElement.componentInstance;
    app.alertObj = {
      property: 'test'
    };
    app.elementObj = {
      test: {
        status: 'F',
        value: 1
      }
    };
    app.outputObj = new EventEmitter();
    fixture.detectChanges();
    app.propagate();
    fixture.detectChanges();
    expect(app).toBeTruthy();
    expect(app.propertyName).toBe('test');
    expect(app.observation.get('value').disabled).toBeTruthy();
    expect(app.observation.get('status').disabled).toBeFalsy();
  });

  it('should create the AlertsComponent forced Value', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const app = fixture.debugElement.componentInstance;
    app.alertObj = {
      property: 'test'
    };
    app.elementObj = {
      test: {
        status: 'W',
        value: 1
      }
    };
    app.outputObj = new EventEmitter();
    fixture.detectChanges();
    app.propagate();
    fixture.detectChanges();
    expect(app).toBeTruthy();
    expect(app.propertyName).toBe('test');
    expect(app.observation.get('value').disabled).toBeFalsy();
    expect(app.observation.get('status').disabled).toBeFalsy();
  });

  it('should create the AlertsComponent forced Value', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const app = fixture.debugElement.componentInstance;
    app.alertObj = {
      property: 'test'
    };
    app.elementObj = {
      test: {
        status: 'W',
        value: 1
      }
    };
    app.outputObj = new EventEmitter();
    fixture.detectChanges();
    app.elementObj.test.value = 2;
    app.propagate();
    fixture.detectChanges();
    expect(app).toBeTruthy();
    expect(app.propertyName).toBe('test');
    expect(app.observation.get('value').disabled).toBeFalsy();
    expect(app.observation.get('status').disabled).toBeTruthy();
  });


});
