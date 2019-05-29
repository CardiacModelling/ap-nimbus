import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlotDirective } from './flot.directive';

declare var $: any;

@Directive({
  selector: '[appFlotDeltaAPD90]'
})
export class FlotDeltaAPD90Directive extends FlotDirective {
  yPlotMax = 20.0;
  yPlotMin = -20.0;

  default_y_ticks = [ [ this.yPlotMin, '' + this.yPlotMin ],
                      [ -15.0, '-15'],
                      [ -10.0, '-10'],
                      [ -5.0, '-5'],
                      [ 0.0, '0'],
                      [ 5.0, '5'],
                      [ 10.0, '10'],
                      [ 15.0, '15'],
                      [ this.yPlotMax, '' + this.yPlotMax ] ];

  constructor(elementRef: ElementRef) {
    super(elementRef, '% Change (Δ APD90, [opt] Experimental)');
    this.setOptions();
  }

  public setOptions(): void {
    console.log('setOptions() called!');
    this.options = $.extend(true, super.getDefaultOptions(), {
      yaxis: {
        axisLabel: 'Change (%)',
        ticks: this.default_y_ticks,
      }
    });
    console.log('Options ' + JSON.stringify(this.options));
  }

}