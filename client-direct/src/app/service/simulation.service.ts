import { Observable } from 'rxjs';

import { ApPredictInput } from '../ap-predict-input';
import { ApPredictOutput, DataType } from '../ap-predict-output';

/**
 * Simulation service.
 */
export interface SimulationService {

  /**
   * Query for simulation results, progress or other data.
   * 
   * @param simulationId Simulation identifier.
   * @param dataType Nature of results data to retrieve, e.g. retrieve voltage traces.
   * @return `ApPredict` invocation/simulation output.
   */
  getOutput(simulationId: string, dataType: DataType): Observable<ApPredictOutput>;

  /**
   * Start an `ApPredict` simulation.
   * 
   * @param apPredictInput `ApPredict` input data.
   * @return `ApPredict` invocation/simulation output.
   */
  invokeApPredict(apPredictInput: ApPredictInput): Observable<ApPredictOutput>;
}