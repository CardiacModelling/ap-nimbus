/**
 * Input data to supply to `ApPredict` for a simulation run.
 */
export class ApPredictInput {

  created: number;
  simulationId: string;

  modelId: number;

  pacingFrequencies: number[];
  pacingMaxTime: number;

  pIC50IKr: number;
  pIC50INa: number;
  pIC50ICaL: number;
  pIC50IKs: number;
  pIC50IK1: number;
  pIC50Ito: number;

  plasmaMaximum: number;
  plasmaMinimum: number;
  plasmaIntermediatePointCount: number;
  plasmaIntermediatePointLogScale: boolean;

  plasmaPoints: number[];

  /**
   * Default constructor.
   */
  constructor() { }

}