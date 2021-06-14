import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appCustomInput]'
})
export class CustomInputDirective {

  @HostListener('keydown', ['$event']) onKeyDown(e) {
    if (e.code === 'Backspace') {
      return;
    }
    if (e.code === 'Tab') {
      return e;
    }
    const paragraph = e.key;
    const regex = /[NnAa,.0-9-]*/;
    const found = paragraph.match(regex);
    if (found[0].length === 0) {
      e.preventDefault();
    }
    return e;
  }
}
