import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

import { ApPredictInput } from '../ap-predict-input';
import { ApPredictOutput, DataType } from '../ap-predict-output';
import { EnvService } from '../env.service';
import { SimulationService } from './simulation.service';

/**
 * JSON content type HTTP header.
 */
const httpHeadersJSON = {
  headers: new HttpHeaders({
    'Accept': 'application/json; charset=utf-8',
    'Content-Type': 'application/json; charset=utf-8'
  })
};

/**
 * text/plain content type HTTP header.
 *
 * TODO : Wanted to try ",  responseType: 'text'" but ...
 * @see https://github.com/angular/angular/issues/21017
 * @see https://github.com/angular/angular/issues/18586
 */
const httpHeadersText = {
  headers: new HttpHeaders({
    'Accept': 'text/plain; charset=utf-8',
    'Content-Type': 'text/plain; charset=utf-8'
  }),
  responseType: 'text' as 'text'
};

// These values reflect the content of src/env.js
const placeholderApiUrlAppManager: string = '__api_url_appmgr';
const placeholderApiUrlData: string = '__api_url_data';

/**
 * Simulation service operations - retrieval from REST API implementation.
 */
@Injectable()
export class SimulationRestApiImpl implements SimulationService {

  /* Default config is direct comms between client-direct and app-manager. */
  appManagerUrl: string = 'http://127.0.0.1:8080/';
  /* This may be app-manager (the default), or it may be an intermediary data
     store. */
  simulationDataURL: string = 'http://127.0.0.1:8080/api/collection/';

  /**
   * Initialising constructor.
   *
   * Overwrites some defaults if any values are encountered in environment var.
   *
   * @param envService Environment variable service.
   * @param httpClient HTTP client.
   */
  constructor(private envService: EnvService,
              private httpClient: HttpClient) {
    /*
     * Environment vars are passed via a combination of :
     *   1. entry_point.sh
     *   2. src/env.js
     *   3. src/app/env.service.ts
     */
    let envApiUrlAppMgr: string = envService.apiUrlAppMgr;
    let envApiUrlData: string = envService.apiUrlData;

    // If an AppManager URL env var declared REST_API_URL_APPMGR), use it!
    if (envApiUrlAppMgr != '' && envApiUrlAppMgr != placeholderApiUrlAppManager) {
      // AppManager URL env var declared.
      if (envApiUrlAppMgr.toLowerCase().startsWith('http')) {
        // Absolute URL - use it.
        this.appManagerUrl = envApiUrlAppMgr;
      } else {
        // Relative URL - append it to the current window location.
        this.appManagerUrl = window.location.origin + '/' + envApiUrlAppMgr;
      }
      console.log('INFO: REST_API_URL_APPMGR has value : ' + envApiUrlAppMgr);
    } else {
      console.log('INFO: No REST_API_URL_APPMGR value encountered');
    }
    console.log('INFO: App Manager URL will be ' + this.appManagerUrl);

    if (envApiUrlData != '' && envApiUrlData != placeholderApiUrlData) {
      if (envApiUrlData.toLowerCase().startsWith('http')) {
        this.simulationDataURL = envApiUrlData;
      } else {
        this.simulationDataURL = window.location.origin + '/' + envApiUrlData;
      }
      console.log('INFO: REST_API_URL_DATA has value : ' + envApiUrlData);
    } else {
      console.log('INFO: No REST_API_URL_DATA value encountered');
    }
    console.log('INFO: Simulation data URL will be ' + this.simulationDataURL);
  }

  /**
   * {@link SimulationService}
   */
  getOutput(simulationId: string, dataType: DataType): Observable<ApPredictOutput> {
    let queryURL: string = this.simulationDataURL + simulationId + '/';

    let apPredictOutput: ApPredictOutput = new ApPredictOutput(simulationId);
    let append: string = '';
    switch (dataType) {
      case DataType.STDERR:
      case DataType.STDOUT:
        queryURL += DataType[dataType];
        return this.httpClient.get(queryURL, httpHeadersText)
                              .pipe(map(response => {
                                          let progressObj = this.tryParseJSON(response);
                                          if (!progressObj) {
                                            // Fail! Cause is non-JSON format.
                                            let errorMsg = 'stop indicator : ' + response;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                            return apPredictOutput;
                                          }

                                          let stdPresent = (typeof progressObj.success !== 'undefined' &&
                                                            progressObj.success == true);
                                          if (stdPresent) {
                                            switch (dataType) {
                                              case DataType.STDERR:
                                                apPredictOutput.setStdErr(progressObj.content);
                                              case DataType.STDOUT:
                                                apPredictOutput.setStdOut(progressObj.content);
                                              default:
                                            }
                                          }
                                          return apPredictOutput;
                                        },catchError(this.handleError) ));
      case DataType.PROGRESS:
        queryURL += 'progress_status';
        // Sending and receiving text format.
        return this.httpClient.get(queryURL, httpHeadersText)
                              .pipe(map(response => {
                                          let progressObj = this.tryParseJSON(response);
                                          if (!progressObj) {
                                            // Fail! Cause is non-JSON format.
                                            let errorMsg = 'Non-JSON format progress data : ' + response;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                            return apPredictOutput;
                                          }

                                          let successObj = progressObj.success;
                                          if (typeof successObj !== 'undefined') {
                                            // Success! Data available.
                                            apPredictOutput.setProgress(JSON.stringify(successObj));
                                            return apPredictOutput;
                                          }

                                          if (apPredictOutput.isPlaceholderData(response)) {
                                            // Success! Although awaiting data.
                                            apPredictOutput.setWaitingForDataMessage();
                                          } else {
                                            // Fail! Cause is JSON content.
                                            let errSpecifics = (typeof progressObj.error !== 'undefined') ?
                                                               progressObj.error : response;
                                            let errorMsg = 'Cannot interpret the progress data : ' + errSpecifics;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                          }

                                          return apPredictOutput;

                                        },catchError(this.handleError) ));
      case DataType.STOP_INDICATOR:
        queryURL += 'STOP';
        return this.httpClient.get(queryURL, httpHeadersText)
                              .pipe(map(response => {
                                          let progressObj = this.tryParseJSON(response);
                                          if (!progressObj) {
                                            // Fail! Cause is non-JSON format.
                                            let errorMsg = 'stop indicator : ' + response;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                            return apPredictOutput;
                                          }

                                          let stopped = (typeof progressObj.success !== 'undefined' &&
                                                         progressObj.success == true);
                                          if (stopped) {
                                            apPredictOutput.setCompleted();
                                          }

                                          return apPredictOutput;

                                        },catchError(this.handleError) ));
      case DataType.VOLTAGE_RESULTS:
        queryURL += 'voltage_results';
        return this.httpClient.get(queryURL, httpHeadersText)
                              .pipe(map(response => {
                                          let vrObj = this.tryParseJSON(response);
                                          if (!vrObj) {
                                            // Fail! Cause is non-JSON format.
                                            let errorMsg = 'Non-JSON format voltage results data : ' + response;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                            return apPredictOutput;
                                          }

                                          let successObj = vrObj.success;
                                          if (typeof successObj !== 'undefined') {
                                            // Success! Data available.
                                            apPredictOutput.setVoltageResults(JSON.stringify(successObj));
                                            return apPredictOutput;
                                          }

                                          if (apPredictOutput.isPlaceholderData(response)) {
                                            // Success! Although awaiting data.
                                            apPredictOutput.setWaitingForDataMessage();
                                          } else {
                                            // Fail! Cause is JSON content.
                                            let errSpecifics = (typeof vrObj.error !== 'undefined') ? vrObj.error :
                                                                                                      response;
                                            let errorMsg = 'Cannot interpret the voltage results data : ' + errSpecifics;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                          }

                                          return apPredictOutput;

                                        },catchError(this.handleError) ));
      case DataType.VOLTAGE_TRACES:
        queryURL += 'voltage_traces';
        return this.httpClient.get(queryURL, httpHeadersText)
                              .pipe(map(response => {
                                          let vtObj = this.tryParseJSON(response);
                                          if (!vtObj) {
                                            // Fail! Cause is non-JSON format.
                                            let errorMsg = 'Non-JSON format voltage traces data : ' + response;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                            return apPredictOutput;
                                          }

                                          let successObj = vtObj.success;
                                          if (typeof successObj !== 'undefined') {
                                            // Success! Data available.
                                            apPredictOutput.setVoltageTraces(JSON.stringify(successObj));
                                            return apPredictOutput;
                                          }

                                          if (apPredictOutput.isPlaceholderData(response)) {
                                            // Success! Although awaiting data.
                                            apPredictOutput.setWaitingForDataMessage();
                                          } else {
                                            // Fail! Cause is JSON content.
                                            let errSpecifics = (typeof vtObj.error !== 'undefined') ? vtObj.error :
                                                                                                      response;
                                            let errorMsg = 'Cannot interpret the voltage traces data : ' + errSpecifics;
                                            console.log('ERROR : ' + errorMsg);

                                            apPredictOutput.setErrorMessage(errorMsg);
                                          }

                                          return apPredictOutput;

                                        },catchError(this.handleError) ));
      default:
        let errorMsg: string = 'Unrecognised data type ' + dataType;
        console.error('ERROR : ' + errorMsg);
        apPredictOutput.setErrorMessage(errorMsg);
        return of(apPredictOutput);
    }
  }

  /**
   * {@link SimulationService}
   */
  invokeApPredict(apPredictInput: ApPredictInput): Observable<ApPredictOutput> {
    console.log('~invokeApPredict() : Calling ' + this.appManagerUrl);
    // Sending and receiving JSON format.
    return this.httpClient.post(this.appManagerUrl, apPredictInput, httpHeadersJSON)
                          .pipe(map(response => {
                                      let apPredictOutput: ApPredictOutput;
                                      let success = response['success'];
                                      if (typeof success !== 'undefined') {
                                        let simulationId: string = success['id'];
                                        let ipAddress: string = success['ip'];

                                        apPredictOutput = new ApPredictOutput(simulationId);
                                        apPredictOutput.ipAddress = ipAddress;
                                      } else {
                                        let errorMsg: string = 'Unexpected response invoking ApPredict : ' + response;
                                        console.error('ERROR : ' + errorMsg);
                                        apPredictOutput = new ApPredictOutput('');
                                        apPredictOutput.setErrorMessage(errorMsg);
                                      }

                                      return apPredictOutput;
                                    },catchError(this.handleError)));
  }

  /**
   * Handle called component errors.
   *
   * @param error Error to handle.
   * @link https://angular.io/guide/http#getting-error-details
   */
  private handleError(error: HttpErrorResponse) {
    console.log('5');
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // Called component returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Called component returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  // https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
  private tryParseJSON (jsonString){
    try {
      var o = JSON.parse(jsonString);

      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object",
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === "object") {
        return o;
      }
    }
    catch (e) { }

    return false;
  };
}
