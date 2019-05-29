import { ChangeDetectorRef, Component, DoCheck, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, timer, interval, of } from 'rxjs'

import { ApPredictOutput, DataType } from '../../class/ap-predict-output';
import { SimulationService } from '../../service/simulation.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements DoCheck, OnChanges {

  contento: string;
  errorMessages: string[] = [];
  qNetMessage: string;
  vrMessage: string;
  //vtMessage: string;

  @Input()
  simulationsOutput: object;

  private mathLog10 = Math.log(10);

  private simCnt: number = 0;

  apd50Data: any[] = [];
  apd90Data: any[] = [];
  deltaAPD90Data: any[] = [];
  peakVmData: any[] = [];
  qNetData: any[] = [];
  upstrokeVelocityData: any[] = [];

  private notionalMinConc: number = 0.001;

  allSimulationResults: any = {};

  constructor(private changeDetector: ChangeDetectorRef,
              @Inject('SimulationService')
                      private simulationService: SimulationService) {
    // Empty!
  }

  ngDoCheck() {
    let newCnt: number = Object.keys(this.simulationsOutput['output']).length;
    if (newCnt != this.simCnt) {
      console.log('Change in simulation count! New ' + newCnt + ' vs. Old ' + this.simCnt);
      this.simCnt = newCnt;

      // Unsubscribe any timers not in current simulations.
      let allSimulationResultsKeys = Object.keys(this.allSimulationResults);
      let newArrivalsKeys = Object.keys(this.simulationsOutput['output']);

      allSimulationResultsKeys.forEach((simulationId) => {
        if (!newArrivalsKeys.includes(simulationId)) {
          // It's a previous simulation!
          this.stopTimer(simulationId);
        }
      });

      //
      newArrivalsKeys.forEach((simulationId) => {
        let simulationResults = this.allSimulationResults[simulationId];
        if (typeof simulationResults !== 'undefined') {
          // Known simulation id.
        } else {
          // Newly arrived simulation id.
          let metaData = this.simulationsOutput['output'][simulationId]['metaData'];
          console.log('New simulation - adding timer ' + simulationId);
          this.allSimulationResults[simulationId] = {
            'timer' : timer(0, 500).subscribe((val) => {
                                                          this.serviceSubscription(simulationId,
                                                                                   metaData) }),
            'completed' : false,
            'voltage_results' : []
          };
        }
      });

      //this.contento = JSON.stringify(this.simulationsOutput, null, 2);
      this.changeDetector.markForCheck();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let simulationsOutputChanges = changes['simulationsOutput'];
    if (typeof simulationsOutputChanges !== 'undefined') {
      /* This isn't being triggered when ApPredict invocation (via 
       *   DefaultSimulationsServiceImpl#invokeSimulations()) ApPredictOutput
       *   observable is received and simulationsOutput is modified!
       * Assume that this only gets triggered when home component itself 
       *   modifies simulationsOutput structure
       */
      console.log('ngOnChanges() : Start new simulation!');

      this.simCnt = 0;
      this.errorMessages = [];

      const currentValue = simulationsOutputChanges.currentValue;
      let experimentalOnly = [];
      if (typeof currentValue !== 'undefined' && typeof currentValue['input'] !== 'undefined') {
        const experimentalData = currentValue['input']['experimental'];
        if (typeof experimentalData !== 'undefined' && Object.keys(experimentalData).length > 0) {
          let pacingFrequencies = Object.keys(experimentalData);

          for (let pacingFrequency in experimentalData) {
            let pacingFrequencyData = experimentalData[pacingFrequency];
            pacingFrequencyData.forEach((perFreqSource) => {
              let seriesData = [];
              perFreqSource.values.forEach((perFreqSourceValues) => {
                let pctChangeConc = perFreqSourceValues.experimental_conc;
                let pctChangeMean = perFreqSourceValues.experimental_pct_change_mean;
                if (!Number.isNaN(Number.parseFloat(pctChangeMean))) {
                  let dataPoint = {
                    name: this.log10(Number.parseFloat(pctChangeConc)),
                    value: Number.parseFloat(pctChangeMean)
                  }
                  seriesData.push(dataPoint);
                }
              });
              let newData = {
                name: perFreqSource.source + '@' + pacingFrequency + 'Hz',
                series: seriesData
              };
              experimentalOnly.push(newData);
            });
          }
        }
      }

      this.deltaAPD90Data = [];
      this.apd50Data = [];
      this.apd90Data = [];
      this.peakVmData = [];
      this.qNetData = [];
      this.upstrokeVelocityData = [];
      if (experimentalOnly.length > 0) {
        experimentalOnly.sort(function(a, b) {
          var aName = a['name'];
          var bName = b['name'];
          if (aName < bName) return -1;
          if (aName > bName) return 1;
          return 0;
        });
        this.deltaAPD90Data = experimentalOnly;
      }
    }
  }

  /**
   * Handle backend errors.
   * 
   * @param error Error to handle.
   * @link https://angular.io/guide/http#getting-error-details 
   */
  private handleError(error, simulationId: string) {
    if (typeof error.message !== 'undefined') {
      if (error.message == 'Http failure response for (unknown url): 0 Unknown Error') {
        // 'app-manager' or 'datastore' didn't start or has stopped (or network problem)?
        this.errorMessages.push('Error encountered communicating with the simulation results source!');
      } else {
        this.errorMessages.push(error.message);
      }
    } else {
      this.errorMessages.push(JSON.stringify(error));
    }

    this.stopTimer(simulationId);
  };

  private isCompleted(simulationId: string): boolean {
    return this.allSimulationResults[simulationId].completed;
  }

  private log10(value): number {
    return Math.log(value) / this.mathLog10;
  }

  private processSI(apPredictOutput: ApPredictOutput, simulationId: string): void {
    let completed = apPredictOutput.completed;
    if (typeof completed !== 'undefined' && completed) {
      this.setCompleted(simulationId);
    }
  }

  private processQNet(apPredictOutput: ApPredictOutput, simulationId: string,
                      metaData: object): void {
    if (apPredictOutput.hasWaitingMessage()) {
      this.qNetMessage = apPredictOutput.message;
    } else if (apPredictOutput.hasData(DataType.QNET)) {
      this.qNetMessage = null;

      let qNetResults = apPredictOutput.qNet;

      let qNetSeriesData = [];
      JSON.parse(qNetResults).forEach((perConcentrationData) => {
        let concentration = perConcentrationData['c'];
        if (concentration != 'Concentration(uM)' && +concentration >= this.notionalMinConc) {
          let qNet = perConcentrationData['qnet'];

          if (!Number.isNaN(Number.parseFloat(qNet))) {
            qNetSeriesData.push({
              name: this.log10(Number.parseFloat(concentration)),
              value: Number.parseFloat(qNet)
            });
          }
        }
      });

      let latestSeriesCnt = qNetSeriesData.length;

      let found: boolean = false;
      this.qNetData.forEach((eachPlotData) => {
        let eachPlotDataName = eachPlotData['name'];
        let eachPlotDataSeries = eachPlotData['series'];

        if (eachPlotDataName == metaData['title']) {
          found = true;
          if (eachPlotDataSeries.length != latestSeriesCnt) {
            eachPlotData['series'] = qNetSeriesData;
          }
          return;
        }
      });

      if (!found) {
        let newQNetData = {
          groupLevel: metaData['groupLevel'],
          pacingFrequency: metaData['pacingFrequency'],
          name: metaData['title'],
          series: qNetSeriesData
        };
        this.qNetData.push(newQNetData);
      }

      this.sortGrpLvlPacFreq(this.qNetData);
      this.qNetData = [...this.qNetData];
    } else {
      // No data - looks serious!
      this.qNetMessage = null;
      this.errorMessages.push(apPredictOutput.message);
    }
  }

  /**
   * Process the VoltageResults response (usu. content of `voltage_results.dat`)
   * from `app-manager`.
   * 
   * Put the results into data series which flot directive subclasses (e.g.
   * `flot-delta_apd90.directive.ts`) watch for changes.
   */
  public processVoltageResults(apPredictOutput: ApPredictOutput, simulationId: string,
                               metaData: object): void {
    if (apPredictOutput.hasWaitingMessage()) {
      this.vrMessage = apPredictOutput.message;
    } else if (apPredictOutput.hasData(DataType.VOLTAGE_RESULTS)) {
      this.vrMessage = null;

      let voltageResults = apPredictOutput.voltageResults;

      let apd50SeriesData = [];
      let apd90SeriesData = [];
      let deltaAPD90SeriesData = [];
      let peakVmSeriesData = [];
      let upstrokeVelocitySeriesData = [];

      /* 
       * Transfer each of the per-concentration voltage results data into the
       * series data (e.g. Delta APD90, Upstroke velocity, etc) arrays.
       * */
      JSON.parse(voltageResults).forEach((perConcentrationData) => {
        let concentration = perConcentrationData['c'];               // Concentration(uM)
        if (concentration != 'Concentration(uM)' && +concentration >= this.notionalMinConc) {
          let upstrokeVelocity = perConcentrationData['uv'];         // UpstrokeVelocity(mV/ms)
          let peakVm = perConcentrationData['pv'];                   // PeakVm(mV)
          let apd50 = perConcentrationData['a50'];                   // APD50(ms)
          let apd90 = perConcentrationData['a90'];                   // APD90(ms)
          let deltaAPD90 = perConcentrationData['da90'];             // delta_APD90(%) or dAp95%low,dAp86%low,dAp68%low,dAp38%low,median_delta_APD90,dAp38%upp,dAp68%upp,dAp86%upp,dAp95%upp

          if (!Number.isNaN(Number.parseFloat(deltaAPD90))) {

            let dataPointConc = this.log10(Number.parseFloat(concentration));

            apd50SeriesData.push({
              name: dataPointConc,
              value: Number.parseFloat(apd50)
            });

            apd90SeriesData.push({
              name: dataPointConc,
              value: Number.parseFloat(apd90)
            });

            deltaAPD90SeriesData.push({
              name: dataPointConc,
              value: Number.parseFloat(deltaAPD90)
            });

            peakVmSeriesData.push({
              name: dataPointConc,
              value: Number.parseFloat(peakVm)
            });

            upstrokeVelocitySeriesData.push({
              name: dataPointConc,
              value: Number.parseFloat(upstrokeVelocity)
            });
          } else {
            let errMsg = 'At ' + concentration + 'µM : ';
            if (deltaAPD90 == 'NoActionPotential_1') {
              errMsg += 'No action potential traces were recorded.';
            } else {
              // %ile data?
              errMsg += 'Cannot interpret a value of ' + deltaAPD90 + ' in the Delta APD90 field!';
            }
            if (this.errorMessages.indexOf(errMsg) == -1) {
              this.errorMessages.push(errMsg);
            }
          }
        }
      });

      let latestSeriesCnt = deltaAPD90SeriesData.length;

      let isInitialising: boolean = true;
      let isUpdating: boolean = false;

      let metaDataTitle = metaData['title'];

      /* Look through current DeltaAPD90 data. If the series name (e.g 'QSAR@0,5Hz') 
       * matches the metadata title, then update the series data if there's been
       * a change in the number of data points (i.e. concentrations).
       * 
       * Note that there may be experimental data in amongst Delta APD90 data!
       */
      this.deltaAPD90Data.forEach((eachPlotData) => {
        let eachPlotDataName = eachPlotData['name'];
        let eachPlotDataSeries = eachPlotData['series'];

        if (eachPlotDataName == metaDataTitle) {
          // We've seen this series name before, so not initialising!
          isInitialising = false;
          if (eachPlotDataSeries.length != latestSeriesCnt) {
            isUpdating = true;
            // Known series, and there's some new data arrived so update the series data. 
            eachPlotData['series'] = deltaAPD90SeriesData;
          }
          return;
        }
      });

      this.upstrokeVelocityData.forEach((eachPlotData) => {
        let eachPlotDataName = eachPlotData['name'];
        let eachPlotDataSeries = eachPlotData['series'];

        if (eachPlotDataName == metaDataTitle) {
          if (eachPlotDataSeries.length != latestSeriesCnt) {
            eachPlotData['series'] = upstrokeVelocitySeriesData;
          }
          return;
        }
      });

      this.peakVmData.forEach((eachPlotData) => {
        let eachPlotDataName = eachPlotData['name'];
        let eachPlotDataSeries = eachPlotData['series'];

        if (eachPlotDataName == metaDataTitle) {
          if (eachPlotDataSeries.length != latestSeriesCnt) {
            eachPlotData['series'] = peakVmSeriesData;
          }
          return;
        }
      });

      this.apd50Data.forEach((eachPlotData) => {
        let eachPlotDataName = eachPlotData['name'];
        let eachPlotDataSeries = eachPlotData['series'];

        if (eachPlotDataName == metaDataTitle) {
          if (eachPlotDataSeries.length != latestSeriesCnt) {
            eachPlotData['series'] = apd50SeriesData;
          }
          return;
        }
      });

      this.apd90Data.forEach((eachPlotData) => {
        let eachPlotDataName = eachPlotData['name'];
        let eachPlotDataSeries = eachPlotData['series'];

        if (eachPlotDataName == metaDataTitle) {
          if (eachPlotDataSeries.length != latestSeriesCnt) {
            eachPlotData['series'] = apd90SeriesData;
          }
          return;
        }
      });

      if (isInitialising) {
        // First time we've seen this (assay/freq combo) simulation data.
        let baseData = {
          groupLevel: metaData['groupLevel'],
          pacingFrequency: metaData['pacingFrequency'],
          name: metaDataTitle,
        };
        // https://stackoverflow.com/questions/37042602/how-to-combine-object-properties-in-typescript
        this.deltaAPD90Data.push( {...baseData, ...{ series: deltaAPD90SeriesData } } );
        this.upstrokeVelocityData.push( {...baseData, ...{ series: upstrokeVelocitySeriesData } } );
        this.peakVmData.push( {...baseData, ...{ series: peakVmSeriesData } } );
        this.apd50Data.push( {...baseData, ...{ series: apd50SeriesData } } );
        this.apd90Data.push( {...baseData, ...{ series: apd90SeriesData } } );
      } else if (isUpdating) {
        this.sortGrpLvlPacFreq(this.deltaAPD90Data);
        this.sortGrpLvlPacFreq(this.upstrokeVelocityData);
        this.sortGrpLvlPacFreq(this.peakVmData);
        this.sortGrpLvlPacFreq(this.apd50Data);
        this.sortGrpLvlPacFreq(this.apd90Data);

        // https://github.com/swimlane/ngx-charts/issues/118
        // Expand array and put it back into another array!
        this.deltaAPD90Data = [...this.deltaAPD90Data];
        this.upstrokeVelocityData = [...this.upstrokeVelocityData];
        this.peakVmData = [...this.peakVmData];
        this.apd50Data = [...this.apd50Data];
        this.apd90Data = [...this.apd90Data];
      }

      //this.contento = JSON.stringify(this.chartData, null, 2);

    } else {
      // No data - looks serious!
      this.vrMessage = null;
      this.errorMessages.push(apPredictOutput.message);
      this.stopTimer(simulationId);
    }
  }

  private setCompleted(simulationId: string): void {
    let simulationResults = this.allSimulationResults[simulationId];
    simulationResults.completed = true;
  }

  private sortGrpLvlPacFreq(arr): void {
    arr.sort(function(a, b) {
      var agl = +a['groupLevel'];
      var bgl = +b['groupLevel'];
      var apf = +a['pacingFrequency'];
      var bpf = +b['pacingFrequency'];
      if (agl < bgl) return -1;
      if (agl > bgl) return 1;
      if (apf < bpf) return -1;
      if (apf > bpf) return 1;
      return 0;
    });
  }
  private stopTimer(simulationId: string): void {
    let simulationResults = this.allSimulationResults[simulationId];
    let timer = simulationResults['timer'];
    let timerRemoved = false;
    if (typeof timer !== 'undefined') {
      // console.log('Removing timer for ' + simulationId);

      timerRemoved = true;

      timer.unsubscribe();
      delete simulationResults['timer'];
    }

    // console.log('Simulation ' + simulationId + (timerRemoved ? ' had timer removed' : ' had no timer to remove'));
  }

  /*
   * Call out to simulation service provider (e.g. app-manager) and pass response to process
   * routine.
   */
  private serviceSubscription(simulationId: string, metaData: object): void {
    this.simulationService.getOutput(simulationId,
                                     DataType.VOLTAGE_RESULTS)
                          .subscribe(apPredictOutput => {
                                       this.processVoltageResults(apPredictOutput, simulationId,
                                                                  metaData);
                                     },
                                     error => {
                                       this.handleError(error, simulationId);
                                     });
    this.simulationService.getOutput(simulationId,
                                     DataType.QNET)
                          .subscribe(apPredictOutput => {
                                      this.processQNet(apPredictOutput, simulationId, metaData);
                                     },
                                     error => {
                                       this.handleError(error, simulationId);
                                     });

    if (this.isCompleted(simulationId)) {
      this.stopTimer(simulationId);
    } else {
      this.simulationService.getOutput(simulationId,
                                       DataType.STOP_INDICATOR)
                            .subscribe(apPredictOutput => {
                                         this.processSI(apPredictOutput, simulationId);
                                       },
                                       error => {
                                         this.handleError(error, simulationId);
                                       });
      if (!this.isCompleted(simulationId)) {
        // Progress stuff!
      }
    }
  }
}