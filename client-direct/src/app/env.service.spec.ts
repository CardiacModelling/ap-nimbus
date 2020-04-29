import { TestBed } from '@angular/core/testing';

import { EnvService } from './env.service';
import { EnvServiceProvider } from './env.service.provider';

describe('EnvService', () => {
  let envService: EnvService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        EnvService,
        EnvServiceProvider
      ]
    });
    envService = TestBed.get(EnvService);
  });


  it('should be created', () => {
    expect(envService).toBeTruthy();
  });
});
