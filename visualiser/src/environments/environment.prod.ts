import { DefaultApPredictConfigServiceImpl } from '../app/service/default-ap-predict-config';
import { DefaultInputParserServiceImpl } from '../app/service/default-input-parser';
import { DefaultInputProcessorServiceImpl } from '../app/service/default-input-processor';
import { DefaultSimulationsServiceImpl } from '../app/service/default-simulations';

export const environment = {
  production: true,
  apPredictConfigServiceImpl: DefaultApPredictConfigServiceImpl,
  inputParserServiceImpl: DefaultInputParserServiceImpl,
  inputProcessorServiceImpl: DefaultInputProcessorServiceImpl,
  simulationsServiceImpl: DefaultSimulationsServiceImpl
};
