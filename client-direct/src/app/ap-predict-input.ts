export class AssociatedData {
  pIC50: string;
  hill: string;
  saturation: string;
}

export class SpreadData {
  c50Spread: string;
  hillSpread: string;
}

/**
 * AssociatedItem is a collection of pIC50s, Hills and saturations, along
 * with an optional pIC50 and Hill spread value.
 */
export class AssociatedItem {
  associatedData: AssociatedData [] = [];
  spreads: SpreadData;
}

/**
 * Input data to supply to `ApPredict` for a simulation run.
 */
export class ApPredictInput {

  created: number;
  simulationId: string;

  modelId: number;

  pacingFrequency: number;
  pacingMaxTime: number;

  // '38 68 86 95' would represent half, 1, 1.5 and 2 standard deviations.
  credibleIntervalPctiles: number [] = [ 38, 68, 86, 95 ];

  IKr: AssociatedItem;
  INa: AssociatedItem;
  ICaL: AssociatedItem;
  IKs: AssociatedItem;
  IK1: AssociatedItem;
  Ito: AssociatedItem;
  INaL: AssociatedItem;

  plasmaMaximum: number;
  plasmaMinimum: number;
  plasmaIntermediatePointCount: number;
  plasmaIntermediatePointLogScale: boolean;

  /**
   * Default constructor.
   */
  constructor() { }

}
