import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { HttpHeaders } from '@angular/common/http';

import { ApPredictInput } from './ap-predict-input';
import { AppredictRestService, GetOp } from './appredict-rest.service';
import { EnvService } from './env.service';

const httpOptionsJSON = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

describe('AppredictRestService', () => {
  let apPredictRestService: AppredictRestService;
  let envService: EnvService;
  let backend: HttpTestingController;
  // Use mock object, not real object.
  let mockApPredictInput: jasmine.SpyObj<ApPredictInput>;
  let mockOpt: jasmine.SpyObj<GetOp>;
  const defaultApiUrl: string = 'http://localhost:8080/';
  const simulationId: string = 'simulationId';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ HttpClientTestingModule ],
      providers: [
        AppredictRestService,
        EnvService
      ]
    });

    apPredictRestService = TestBed.get(AppredictRestService);
    envService = TestBed.get(EnvService);
    backend = TestBed.get(HttpTestingController);
  });

  describe('Configuration tests', () => {
    it ('TODO: FixMe! Spy on EnvService!', () => {
      // Figure out how to spy on properties!!
      // spyOn(envService, 'apiUrl').and.returnValue('http://localhost:8081/');
      expect(apPredictRestService.apPredictRestUrl).toEqual(defaultApiUrl);
      backend.verify();
    });
  });

  describe('Error handling tests', () => {
    // https://stackoverflow.com/questions/46028804/how-to-mock-angular-4-3-httpclient-an-error-response-in-testing
    it ('Throw error', async() => {
      const dummyData = 'Invalid request parameters';
      const dummyErrorResponse = { status: 400,
                                   statusText: 'Bad Request' };
      let response: any;
      let errResponse: any;
      apPredictRestService.invokeApPredict(mockApPredictInput)
                          .subscribe(res => response = res,
                                     err => errResponse = err);
      backend.expectOne(defaultApiUrl).flush(dummyData, dummyErrorResponse);
      backend.verify();
      expect(errResponse).toBe('Something bad happened; please try again later.');
    });
  });

  describe('Response tests', () => {
    it ('invokeApPredict should POST', () => {
      apPredictRestService.invokeApPredict(mockApPredictInput).subscribe();
      const call = backend.expectOne(defaultApiUrl);
      expect(call.request.method).toEqual('POST');
      backend.verify();
    });

    it ('queryApPredict should GET for voltage traces', () => {
      const voltageTracesOpt: GetOp = GetOp.VOLTAGE_TRACES;

      apPredictRestService.queryApPredict(simulationId, voltageTracesOpt).subscribe();
      const call = backend.expectOne(defaultApiUrl + '?id=' + simulationId + '&op=v');
      expect(call.request.method).toEqual('GET');
      backend.verify();
    });

    it ('queryApPredict should GET for stop indicator', () => {
      const voltageTracesOpt: GetOp = GetOp.STOP_INDICATOR;

      apPredictRestService.queryApPredict(simulationId, voltageTracesOpt).subscribe();
      const call = backend.expectOne(defaultApiUrl + '?id=' + simulationId + '&op=s');
      expect(call.request.method).toEqual('GET');
      backend.verify();
    });

    it ('queryApPredict should do nothing for unknown op!', () => {
      const progressOpt: GetOp = GetOp.PROGRESS;

      apPredictRestService.queryApPredict(simulationId, progressOpt).subscribe();
      backend.expectNone(defaultApiUrl);
      backend.verify();
    });
  });
});
