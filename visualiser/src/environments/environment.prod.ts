import { DefaultApPredictConfigImpl } from '../app/service/default-ap-predict-config';
import { DefaultInputParserImpl } from '../app/service/default-input-parser';
import { DefaultInputProcessorImpl } from '../app/service/default-input-processor';

export const environment = {
  production: true,
  apPredictConfigImpl: DefaultApPredictConfigImpl,
  inputParserImpl: DefaultInputParserImpl,
  inputProcessorImpl: DefaultInputProcessorImpl
};
