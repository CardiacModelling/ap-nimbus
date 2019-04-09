import { Injectable } from '@angular/core';

import { InputProcessorService } from './input-processor.service';

@Injectable()
export class DefaultInputProcessorImpl implements InputProcessorService {
  /**
   * {@link InputProcessorService#processInput }
   */
  processInput(inputData: object): object {
    var experimentalData = inputData['data'].experimental;

    console.log('Storing ' + JSON.stringify(experimentalData));
    localStorage.setItem('experimental-data', experimentalData);

    return inputData;
  }
}