import { TestBed } from '@angular/core/testing';

import { AppredictConfigService } from './appredict-config.service';

describe('AppredictConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppredictConfigService = TestBed.get(AppredictConfigService);
    expect(service).toBeTruthy();
  });
});
