import { Injectable } from '@angular/core';

import { SimulationsService } from './simulations.service';

@Injectable()
export class DefaultSimulationsServiceImpl implements SimulationsService {

  /**
   * {@link SimulationsService#runSimulations }
   */
  runSimulations(simulationsInput: any): object {
    console.log(JSON.stringify(simulationsInput));
    return {};
  }

}