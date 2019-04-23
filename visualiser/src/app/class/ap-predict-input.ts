/**
 * Input data to supply to `ApPredict` for a simulation run.
 */
export class ApPredictInput {

  created: number;
  simulationId: string;

  modelId: number;

  pacingFrequency: number;
  pacingMaxTime: number;

  pIC50sIKr: string;
  pIC50sINa: string;
  pIC50sICaL: string;
  pIC50sIKs: string;
  pIC50sIK1: string;
  pIC50sIto: string;

  plasmaMaximum: number;
  plasmaMinimum: number;
  plasmaIntermediatePointCount: number;
  plasmaIntermediatePointLogScale: boolean;

  plasmaPoints: number[];

  metaData: object = {};

  /**
   * Default constructor.
   */
  constructor() { }

}