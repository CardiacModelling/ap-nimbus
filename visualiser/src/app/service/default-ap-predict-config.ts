import { Injectable } from '@angular/core';

import { ApPredictConfigService } from './ap-predict-config.service';

import { Model } from '../class/model';
import { PlasmaIntermediatePointCount } from '../class/plasma-intermediate-point-count';

import appredict from '../../assets/config/appredict.json';

/**
 * Default `ApPredict` simulations default values configuration service.
 */
@Injectable()
export class DefaultApPredictConfigImpl implements ApPredictConfigService {

  models: Model[] = appredict.models;

  pacingFrequencies: number[] = appredict.pacing.frequencies;
  pacingMaxTime: number = appredict.pacing.maxTime;
  plasmaMaximum: number = appredict.compoundConcentrations.range.maximum;
  plasmaMinimum: number = appredict.compoundConcentrations.range.minimum;
  plasmaIntermediatePointCounts: PlasmaIntermediatePointCount[] = appredict.compoundConcentrations.range.intermediatePoints;
  plasmaIntermediatePointLogScale: boolean = appredict.compoundConcentrations.range.intermediatePointLogScale;
  plasmaPoints: number[] = appredict.compoundConcentrations.points;

    /**
   * {@link ApPredictConfigService#retrieveConfig }
   */
  retrieveConfig(): object {
    return { 'models' : this.models,
             'pacingFrequencies' : this.pacingFrequencies,
             'pacingMaxTime' : this.pacingMaxTime,
             'plasmaMaximum' : this.plasmaMaximum,
             'plasmaMinimum' : this.plasmaMinimum,
             'plasmaIntermediatePointCounts' : this.plasmaIntermediatePointCounts,
             'plasmaIntermediatePointLogScale' : this.plasmaIntermediatePointLogScale,
             'plasmaPoints' : this.plasmaPoints };
  }

}