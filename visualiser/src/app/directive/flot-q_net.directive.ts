import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlotDirective } from './flot.directive';

declare var $: any;

@Directive({
  selector: '[appFlotQNet]'
})
export class FlotQNetDirective extends FlotDirective {
  yPlotMax = 0.15;
  yPlotMin = 0.0;

  default_y_ticks = [ [ this.yPlotMin, '' + this.yPlotMin ],
                      [ 0.05, '0.05'],
                      [ 0.1, '0.1'],
                      [ this.yPlotMax, '' + this.yPlotMax ] ];

  constructor(elementRef: ElementRef) {
    super(elementRef, 'qNet');
    this.setOptions();
  }

  public setOptions() {
    this.options = $.extend(true, super.getDefaultOptions(), {
      yaxis: {
          ticks: this.default_y_ticks,
          axisLabel: 'qNet (C/F)'
      }
    });
  }

}