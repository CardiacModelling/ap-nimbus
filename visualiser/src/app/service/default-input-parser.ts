import { Injectable } from '@angular/core';

import { InputParserService } from './input-parser.service';

@Injectable()
export class DefaultInputParserServiceImpl implements InputParserService {

  /**
   * {@link InputParserService#parseInput }
   */
  parseInput(inputData: string): object {
    try {
      return JSON.parse(inputData);
    } catch (error) {}

    return null;
  }

}