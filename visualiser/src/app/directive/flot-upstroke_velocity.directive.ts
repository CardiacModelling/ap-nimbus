import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlotDirective } from './flot.directive';

declare var $: any;

@Directive({
  selector: '[appFlotUpstrokeVelocity]'
})
export class FlotUpstrokeVelocityDirective extends FlotDirective {

  constructor(elementRef: ElementRef) {
    super(elementRef, 'Upstroke Velocity');
  }

  public setOptions() {
    this.options = $.extend(true, super.getDefaultOptions(), {
      yaxis: { axisLabel: 'Upstroke Velocity (mV/ms)' }
    });
  }

}