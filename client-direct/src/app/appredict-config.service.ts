import { Injectable } from '@angular/core';
import { Model } from './model';
import { PlasmaIntermediatePointCount } from './plasma-intermediate-point-count';

import appredict from '../assets/config/appredict.json';

/**
 * `ApPredict` simulations default values configuration service.
 */
@Injectable({
  providedIn: 'root'
})

export class AppredictConfigService {

  models: Model[] = appredict.models;

  pacingFrequency: number = appredict.pacing.frequency;
  pacingMaxTime: number = appredict.pacing.maxTime;
  plasmaMaximum: number = appredict.compoundConcentrations.range.maximum;
  plasmaMinimum: number = appredict.compoundConcentrations.range.minimum;
  plasmaIntermediatePointCounts: PlasmaIntermediatePointCount[] = appredict.compoundConcentrations.range.intermediatePoints;
  plasmaIntermediatePointLogScale: boolean = appredict.compoundConcentrations.range.intermediatePointLogScale;

  /**
   * Default constructor.
   */
  constructor() {}

}