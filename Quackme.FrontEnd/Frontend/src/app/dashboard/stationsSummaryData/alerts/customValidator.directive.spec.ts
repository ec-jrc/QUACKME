import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { CustomInputDirective } from './customValidator.directive';
import { Component, DebugElement } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-alerts',
  template: `<input  appCustomInput class='js-input'/>`
})
class TestAlertsComponent {

}

describe('CustomInputDirective: HoverFocus', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
      declarations: [TestAlertsComponent, CustomInputDirective]
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(TestAlertsComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should klick on input, backspace', () => {
    const fixture = TestBed.createComponent(TestAlertsComponent);
    const element = fixture.debugElement.nativeElement;
    const event = new KeyboardEvent('keypress', {
      key: 'Backspace',
      code: 'Backspace'
    });
    fixture.debugElement.query(By.css('input')).triggerEventHandler('keydown', event);
    const propertyName = element.querySelector('.js-input').value;
    expect(propertyName).toBe('');
  });

  it('should klick on input, A', () => {
    const fixture = TestBed.createComponent(TestAlertsComponent);
    const element = fixture.debugElement.nativeElement;
    const event = new KeyboardEvent('keypress', {
      key: 'A'
    });
    fixture.debugElement.query(By.css('input')).triggerEventHandler('keydown', event);
    const propertyName = element.querySelector('.js-input').value;
    expect(propertyName).toBe('');
  });

  it('should klick on input, f', () => {
    const fixture = TestBed.createComponent(TestAlertsComponent);
    const element = fixture.debugElement.nativeElement;
    const event = new KeyboardEvent('keypress', {
      key: 'f'
    });
    fixture.debugElement.query(By.css('input')).triggerEventHandler('keydown', event);
    const propertyName = element.querySelector('.js-input').value;
    expect(propertyName).toBe('');
  });

  it('should klick on input, rt', () => {
    const fixture = TestBed.createComponent(TestAlertsComponent);
    const element = fixture.debugElement.nativeElement;
    const event = new KeyboardEvent('keypress', {
      key: 'rt'
    });
    fixture.debugElement.query(By.css('input')).triggerEventHandler('keydown', event);
    const propertyName = element.querySelector('.js-input').value;
    expect(propertyName).toBe('');
  });

});
