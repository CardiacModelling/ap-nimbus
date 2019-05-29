import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlotDirective } from './flot.directive';

declare var $: any;

@Directive({
  selector: '[appFlotPeakVm]'
})
export class FlotPeakVmDirective extends FlotDirective {

  constructor(elementRef: ElementRef) {
    super(elementRef, 'Peak Vm');
  }

  public setOptions() {
    this.options = $.extend(true, super.getDefaultOptions(), {
      yaxis: { axisLabel: 'PeakVm (mV)' }
    });
  }

}