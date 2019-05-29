import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlotDirective } from './flot.directive';

declare var $: any;

@Directive({
  selector: '[appFlotAPD50]'
})
export class FlotAPD50Directive extends FlotDirective {

  constructor(elementRef: ElementRef) {
    super(elementRef, 'APD50');
  }

  setOptions(): void {
    this.options = $.extend(true, super.getDefaultOptions(), {
      yaxis: { axisLabel: 'APD50 (ms)' }
    });
  }

}