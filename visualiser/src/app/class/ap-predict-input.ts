export class Spreads {
  c50Spread: number;
  hillSpread: number;

  constructor(c50Spread: number, hillSpread: number) {
    this.c50Spread = c50Spread;
    this.hillSpread = hillSpread;
  }
}

export class AssociatedItem {
  pIC50: number;
  hill: number;
  saturation: number;

  constructor(pIC50: number, hill: number, saturation: number) {
    this.pIC50 = pIC50;
    this.hill = hill;
    this.saturation = saturation;
  }
}

export class ChannelData {
  associatedData: AssociatedItem[] = [];
  spreads: Spreads;

  constructor(associatedData: AssociatedItem[]) {
    this.associatedData = associatedData;
  }
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

  IKr: ChannelData;
  INa: ChannelData;
  ICaL: ChannelData;
  IKs: ChannelData;
  IK1: ChannelData;
  Ito: ChannelData;

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