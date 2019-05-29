import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlotDirective } from './flot.directive';

declare var $: any;

@Directive({
  selector: '[appFlotAPD90]'
})
export class FlotAPD90Directive extends FlotDirective {
  constructor(elementRef: ElementRef) {
    super(elementRef, 'APD90');
  }

  setOptions(): void {
    this.options = $.extend(true, super.getDefaultOptions(), {
      yaxis: { axisLabel: 'APD90 (ms)' }
    });
  }

}