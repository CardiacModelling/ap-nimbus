import { DefaultApPredictConfigServiceImpl } from '../app/service/default-ap-predict-config';
import { DefaultInputParserServiceImpl } from '../app/service/default-input-parser';
import { DefaultInputProcessorServiceImpl } from '../app/service/default-input-processor';
import { DefaultSimulationsServiceImpl } from '../app/service/default-simulations';
import { SimulationRestApiImpl } from '../app/service/simulation-rest-api-impl';

export const environment = {
  production: true,
  apPredictConfigServiceImpl: DefaultApPredictConfigServiceImpl,
  inputParserServiceImpl: DefaultInputParserServiceImpl,
  inputProcessorServiceImpl: DefaultInputProcessorServiceImpl,
  simulationServiceImpl: SimulationRestApiImpl,
  simulationsServiceImpl: DefaultSimulationsServiceImpl
};
