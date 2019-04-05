import { Injectable } from '@angular/core';

import { DataService } from './data.service';

import { data } from '../../assets/config/data.json';

@Injectable()
export class DataServiceLocalStoreImpl implements DataService {

  /**
   * {@link DataService#retrieveCompoundData }
   */
  retrieveCompoundData(compoundId: string): string {
    return JSON.stringify(data[compoundId], null, 2);
  }

}