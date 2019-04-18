import { DefaultApPredictConfigServiceImpl } from '../app/service/default-ap-predict-config';
import { DefaultInputParserServiceImpl } from '../app/service/default-input-parser';
import { DefaultInputProcessorServiceImpl } from '../app/service/default-input-processor';
import { DefaultSimulationsServiceImpl } from '../app/service/default-simulations';
import { SimulationRestApiImpl } from '../app/service/simulation-rest-api-impl';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apPredictConfigServiceImpl: DefaultApPredictConfigServiceImpl,
  inputParserServiceImpl: DefaultInputParserServiceImpl,
  inputProcessorServiceImpl: DefaultInputProcessorServiceImpl,
  simulationServiceImpl: SimulationRestApiImpl,
  simulationsServiceImpl: DefaultSimulationsServiceImpl
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
