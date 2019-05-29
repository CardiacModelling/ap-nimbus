import { ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

//require('flot');

//import 'flot';
//import * as $ from 'jquery';
declare var $: any;

//window['$'] = window['jQuery'] = $;

export abstract class FlotDirective implements OnChanges, OnInit {

  $element: any

  @Input()
  directiveData: any;

  private plotData: any;
  private xAxisDefaultLabel: string = 'Concentration (µM)';
  private xAxisDefaultTicks = [ [-3.0, '0.001'], 
                                [-2.523,'0.003'],
                                [-2.0, '0.01'],
                                [-1.523, '0.03'],
                                [-1.0, '0.1'],
                                [-0.523, '0.3'],
                                [0.0 , '1'],
                                [0.477 , '3'],
                                [1.0 , '10'],
                                [1.477 , '30'],
                                [2.0 , '100'],
                                [2.477 , '300'],
                                [3.0 , '1000'],
                                [3.477 , '3000'],
                                [4.0 , '10000'],
                                [4.477 , '30000'],
                                [5.0 , '100000'] ];

  protected yPlotMax: number;
  protected yPlotMin: number;
  protected yValueMax: number;
  protected yValueMin: number;

  protected options: object;

  defaultOptions: object = {
    legend: {
      show: true,
    },
    series: {
      lines: {
        show: true,
        lineWidth: 1
      },
      shadowSize: 0
    },
    xaxis: { ticks: this.xAxisDefaultTicks,
             autoscaleMargin: 0.05,
             axisLabel: this.xAxisDefaultLabel,
             axisLabelPadding: 10 },
    yaxis: { ticks: 4,
             autoscaleMargin: 0.05,},
    grid: { color: '#999' },
    selection: { mode: 'xy' }
  };

  constructor(elementRef: ElementRef, title: string) {
    this.$element = $(elementRef.nativeElement);
    $('<div />').text(title || 'undefined')
                .addClass('bold')
                .insertBefore(this.$element);
  }

  /**
   * Detect changes in series data (e.g. `deltaAPD90Data`) derived from
   * processing voltage results data in `results.component.ts`.
   * 
   * Note that `results.component.html` declares directives such as
   * `[directiveData]="deltaAPD90Data"`.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    let directiveDataChanges = changes['directiveData'];
    //console.log('directiveDataChanges ' + JSON.stringify(directiveDataChanges));
    if (typeof directiveDataChanges !== 'undefined' &&
        Array.isArray(directiveDataChanges.currentValue)) {
      if (directiveDataChanges.currentValue.length == 0) {
        console.log('Reset to default options');
        this.resetToDefault();
      }
      this.plotData = [];
      directiveDataChanges.currentValue.forEach((eachChartData) => {
        let label = eachChartData['name'];
        let series = eachChartData['series'];
        let groupLevel = eachChartData['groupLevel'];
        let pacingFrequency = eachChartData['pacingFrequency'];
        let newPlotData = [];

        if (typeof series !== 'undefined') {
          series.forEach((eachPlotPoint) => {
            let x = eachPlotPoint['name'];
            let y = eachPlotPoint['value'];

            if (typeof this.yValueMin === 'undefined') {
              this.yValueMin = y;
            } else {
              if (y < this.yValueMin) {
                this.yValueMin = y
              }
            }
            if (typeof this.yValueMax === 'undefined') {
              this.yValueMax = y;
            } else {
              if (y > this.yValueMax) {
                this.yValueMax = y;
              }
            }

            newPlotData.push( [ x, y ] );
          });
        }
        this.plotData.push({
          'label': label,
          'data': newPlotData
        });
      });

      this.render();
    }
  }

  public render(): void {
    if ((typeof this.yPlotMin !== 'undefined' && this.yValueMin < this.yPlotMin) ||
        (typeof this.yPlotMax !== 'undefined' && this.yValueMax > this.yPlotMax)) {
      console.log(this.yPlotMin + ' vs. ' + this.yValueMin + ' & ' + this.yPlotMax + ' vs. ' + this.yValueMax);

      this.unsetY();
    }

    $.plot(this.$element, this.plotData, this.getOptions());
  }

  public ngOnInit(): void {
    //this.render();
  }

  protected getDefaultOptions() {
    return this.defaultOptions;
  }

  protected getOptions() {
    return this.options;
  }

  abstract setOptions(): void;

  public resetToDefault() {
    this.yValueMax = undefined;
    this.yValueMin = undefined;
    this.setOptions();
  }

  public unsetY(): void {
    this.options = $.extend(true, this.getOptions(), {
      yaxis: { 
        ticks: null
      }
    });
  }

  /*      // TODO : Should check min! Should also check if this.xScaleMax is integer value!
      if (minMax.x.max > this.xScaleMax) {
        let newTicks = [];
        let newMax = this.xScaleMax;
        while (newMax < minMax.x.max) {
          newMax += 0.477;
          newTicks.push(newMax);
          newMax += 0.523;
          newTicks.push(newMax);
        }
        this.xScaleMax = newMax;
        this.xAxisTicks = this.xAxisTicks.concat(newTicks);
      }

      if (minMax.y.min < this.yScaleMin || minMax.y.max > this.yScaleMax) {
        this.yScaleMin = minMax.y.min;
        this.yScaleMax = minMax.y.max;

        let newTicks = [];
        let startAt = (Math.round(this.yScaleMin/this.yAxisRescale) - 1) * this.yAxisRescale;
        for (let tickPoint = startAt; tickPoint <= this.yScaleMax;) {
          tickPoint+=this.yAxisRescale;
          newTicks.push(tickPoint);
        }
        this.yAxisTicks = newTicks;
      }

*/
}