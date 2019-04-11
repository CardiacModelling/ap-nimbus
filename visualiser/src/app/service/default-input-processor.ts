import { Injectable } from '@angular/core';

import { InputProcessorService } from './input-processor.service';

@Injectable()
export class DefaultInputProcessorImpl implements InputProcessorService {
  /**
   * {@link InputProcessorService#processInput }
   */
  processInput(inputData: object): object {
    var experimentalData = inputData['data'].experimental;
    var pacingFrequencies = [];
    var concentrations = [];

    if (experimentalData !== 'undefined') {
      pacingFrequencies = Object.keys(experimentalData);

      var allConcentrations = [];
      for (var pacingFrequency in experimentalData) {
        var pacingFrequencyData = experimentalData[pacingFrequency];
        pacingFrequencyData.forEach((perFreqSource) => {
          perFreqSource.values.forEach((perFreqSourceValues) => {
            allConcentrations.push(perFreqSourceValues.experimental_conc);
          });
        });
      }

      // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
      concentrations = allConcentrations.reduce((a, b) => {
        if (a.indexOf(b) < 0 ) a.push(b);
        return a;
      },[]);
    }

    return { "pacingFrequencies": pacingFrequencies,
             "concentrations": concentrations,
             "assay": inputData['data'].assay };
  }
}