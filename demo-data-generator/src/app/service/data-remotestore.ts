import { Injectable } from '@angular/core';

import { DataService } from './data.service';

@Injectable()
export class DataServiceRemoteStoreImpl implements DataService {

  /**
   * {@link DataService#retrieveCompoundData }
   */
  retrieveCompoundData(compoundIdentifier: string): string {
    console.error('retrieveCompoundData(compoundIdentifier: string) in service/data-remotestore.ts not yet implemented');

    return;
  }

}