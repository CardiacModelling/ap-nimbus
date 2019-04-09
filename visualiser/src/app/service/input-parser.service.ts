/**
 * Input data parsing service interface. 
 */
export interface InputParserService {

  /**
   * Parse input data.
   *
   * @param inputData Input data string.
   * @return JSON object.
   */
  parseInput(inputData: string): object;

}