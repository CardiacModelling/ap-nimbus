/**
 * Input data processing service interface. 
 */
export interface InputProcessorService {

  /**
   * Process input data.
   *
   * @param inputData Input data object.
   * @return JSON object.
   */
  processInput(inputData: object): object;

}