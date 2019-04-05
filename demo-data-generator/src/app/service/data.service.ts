/**
 * Compound data retrieval service.
 */
export interface DataService {

  /**
   * Retrieve compound data.
   * 
   * @param compoundIdentifier Identifier of compound.
   * @return Compound data.
   */
  retrieveCompoundData(compoundIdentifier: string): string;

}