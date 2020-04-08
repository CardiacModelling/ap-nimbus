/*

  Copyright (c) 2020, University of Nottingham.
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
   * Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.
   * Neither the name of the copyright holders nor the names of their
     contributors may be used to endorse or promote products derived from this
     software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
  HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
  OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */
package uk.ac.nottingham.cardiac.azure.functions.durable.service;

//import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import uk.ac.nottingham.cardiac.azure.functions.durable.exception.ClientException;
import uk.ac.nottingham.cardiac.azure.functions.durable.value.FunctionResponseVO;
import uk.ac.nottingham.cardiac.azure.functions.durable.value.StatusResponseVO;

/**
 * Service layer implementation.
 *
 * @author geoff
 */
@Component
public class DurableFunctionsImpl implements DurableFunctions {

  private static final Log log = LogFactory.getLog(DurableFunctionsImpl.class);

  /* (non-Javadoc)
   * @see uk.ac.nottingham.cardiac.azure.functions.durable.service.DurableFunctions#invoke(java.lang.String, int)
   */
  public String invoke(final String url, final int count)
                       throws ClientException {
    log.debug("~invoke() : Invoked");
    String retVal = null;

    final HttpUrl parsedUrl = HttpUrl.parse(url);
    if (parsedUrl == null) {
      final String errorMessage = "Invalid URL encountered";
      log.error("~invoke() : ".concat(errorMessage));
      throw new ClientException(errorMessage);
    }

    if (count < 1) {
      throw new ClientException("Invocation count must be > 0");
    }

    /* */
    final JSONArray json = new JSONArray();
    try {
      for (int idx = 1; idx <= count; idx++) {
        json.put(new JSONObject(DurableFunctionsImpl.retrieveJson()));
      }
    } catch (JSONException e) {
      throw new ClientException(e.getMessage());
    }

    log.debug("~invoke() : Body : ".concat(json.toString()));
    /* */

    /*
     * Phase 1 : POST to client (e.g. httpTrigger)
     */
    Request request = new Request.Builder()
                                 .header("Content-Type",
                                         "application/json")
                                 .url(url)
                                 .post(RequestBody.create(json.toString(),
                                                          MediaType.get("application/json; charset=utf-8")))
                                 .build();

    final OkHttpClient client = new OkHttpClient();
    FunctionResponseVO functionResponseVO = null;
    try {
      final Response response = client.newCall(request).execute();
      final int statusCode = response.code();
      final String responseBody = response.body().string();
      final HttpStatus httpStatus = HttpStatus.resolve(statusCode);
      switch (httpStatus) {
        case ACCEPTED :
          functionResponseVO = new FunctionResponseVO(responseBody);
          break;
        default :
          retVal = "Initial trigger returned http code " + statusCode;
          break;
      }
    } catch (IOException e) {
      final String errorMessage = "Failed client call to Durable Functions endpoint (phase 1) : " + e.getMessage();
      log.error("~invoke() : ".concat(errorMessage));
      throw new ClientException(errorMessage);
    }

    /*
     * Phase 2 : Await 
     */
    String purgeHistoryDeleteUri = null;
    if (functionResponseVO != null) {
      purgeHistoryDeleteUri = functionResponseVO.getPurgeHistoryDeleteUri();
      final String statusQueryGetUri = functionResponseVO.getStatusQueryGetUri();

      request = new Request.Builder()
                           .url(statusQueryGetUri)
                           .build();

      int tryCount = 0;
      // maxTries * threadSleep = max wait time! 900000 === 15 mins.
      long threadSleep = 5000; // <-- ms
      int maxTries = 180;

      StatusResponseVO statusResponseVO = null;
      boolean isCompleted = false;
      while (!isCompleted && ++tryCount < maxTries) {
        log.debug("~invoke() : Try '" + tryCount + "' of '" + maxTries + "'");
        try {
          final Response response = client.newCall(request).execute();
          final int statusCode = response.code();
          final String responseBody = response.body().string();

          final HttpStatus httpStatus = HttpStatus.resolve(statusCode);
          switch (httpStatus) {
            case OK :
              statusResponseVO = new StatusResponseVO(responseBody);
              isCompleted = statusResponseVO.hasStatusCompleted();
              break;
            default :
              retVal = "Function status returned http code " + statusCode;
              break;
          }
        } catch (IOException e) {
          final String errorMessage = "Failed client call to Durable Functions endpoint (phase 2) : " + e.getMessage();
          log.error("~invoke() : ".concat(errorMessage));
          throw new ClientException(errorMessage);
        }

        try {
          Thread.sleep(threadSleep);
        } catch (InterruptedException e) {
          log.warn("~invoke() : Ignoring interruption exception when waiting : " + e.getMessage());
        }
      }

      if (isCompleted) {
        retVal = statusResponseVO.getOutput();
      }
    }

    if (purgeHistoryDeleteUri != null) {
      request = new Request.Builder()
                           .url(purgeHistoryDeleteUri)
                           .delete()
                           .build();
      try {
        final Response response = client.newCall(request).execute();
        final int statusCode = response.code();
        //final String responseBody = response.body().string();
        final HttpStatus httpStatus = HttpStatus.resolve(statusCode);
        switch (httpStatus) {
          case OK :
            log.debug("~invoke() : DELETE was OK!");
            break;
          default :
            retVal = "Initial trigger returned http code " + statusCode;
            break;
        }

      } catch (IOException e) {
        final String errorMessage = "Failed client call to Durable Functions endpoint (phase 3) : " + e.getMessage();
        log.error("~invoke() : ".concat(errorMessage));
        throw new ClientException(errorMessage);
      }
    }
    return retVal;
  }

  private static String retrieveJson() throws ClientException {
    final String json = 
      "{" +
      "   \"pacingFrequency\": \"0.5\"," +
      "   \"credibleIntervalPctiles\": [ 34, 44, 45 ]," +
      "   \"modelId\": \"8\"," +
      "    \"plasmaPoints\": [" +
      "      0,"+
      "      0.3,"+
      "      1,"+
      "      3,"+
      "      10"+
      "    ],"+
      "    \"plasmaIntermediatePointLogScale\": true," +
      "    \"IKs\": {" +
      "      \"associatedData\": [" +
      "        {"+
      "          \"pIC50\": 4.3," +
      "          \"hill\": 1.0," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 4.3," +
      "          \"hill\": 0.92," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 4.3," +
      "          \"hill\": 0.92," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 4.3," +
      "          \"hill\": 0.92" +
      "        }"+
      "      ],"+
      "      \"spreads\": {" +
      "        \"c50Spread\": 0.17" +
      "      }"+
      "    },"+
      "    \"ICaL\": {" +
      "      \"associatedData\": [" +
      "        {"+
      "          \"pIC50\": 3.6135953011," +
      "          \"hill\": 0.441," +
      "          \"saturation\": 0" +
      "        }"+
      "      ],"+
      "      \"spreads\": {" +
      "        \"c50Spread\": 0.15" +
      "      }"+
      "    },"+
      "    \"INa\": {" +
      "      \"associatedData\": [" +
      "        {"+
      "          \"pIC50\": 4.43," +
      "          \"hill\": 0.93," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 4.2693426277," +
      "          \"hill\": 0.95," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 4.3041942808," +
      "          \"hill\": 0.92," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 4.2803294015," +
      "          \"hill\": 0.94," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 3.0693805212," +
      "          \"hill\": 1," +
      "          \"saturation\": 0" +
      "        },"+
      "        {"+
      "          \"pIC50\": 4," +
      "          \"hill\": 1," +
      "          \"saturation\": 0" +
      "        }"+
      "      ],"+
      "      \"spreads\": {" +
      "        \"c50Spread\": 0.2" +
      "      }"+
      "    },"+
      "    \"IKr\": {" +
      "      \"associatedData\": [" +
      "        {"+
      "          \"pIC50\": 4.3," +
      "          \"hill\": 0.2," +
      "          \"saturation\": 0" +
      "        }"+
      "      ],"+
      "      \"spreads\": {" +
      "        \"c50Spread\": 0.18" +
      "      }"+
      "    }"+
      "  }";
    return json;
  }
}