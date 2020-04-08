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
package uk.ac.nottingham.cardiac.azure.functions.durable.value;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;

import uk.ac.nottingham.cardiac.azure.functions.durable.exception.ClientException;

/**
 * Response value object.
 *
 * @author geoff
 */
public class FunctionResponseVO {

  private static final String keyId = "id";
  private static final String keyStatusQueryGetUri = "statusQueryGetUri";
  private static final String keySendEventPostUri = "sendEventPostUri";
  private static final String keyTerminatePostUri = "terminatePostUri";
  private static final String keyRewindPostUri = "rewindPostUri";
  private static final String keyPurgeHistoryDeleteUri = "purgeHistoryDeleteUri";

  // e.g. bd66aa11d8904a74bfc8a982ff5d06c1
  private final String id;
  // e.g. http://0.0.0.0:7071/runtime/webhooks/durabletask/instances/bd66aa11d8904a74bfc8a982ff5d06c1?taskHub=SampleHubJs&connection=Storage&code=OeBzKjHaccsvy9ygXILmd4JofNl9zuFZahHTZBf/Woir3KAWTMyz0Q==
  private final String statusQueryGetUri;
  // e.g. http://0.0.0.0:7071/runtime/webhooks/durabletask/instances/bd66aa11d8904a74bfc8a982ff5d06c1/raiseEvent/{eventName}?taskHub=SampleHubJs&connection=Storage&code=OeBzKjHaccsvy9ygXILmd4JofNl9zuFZahHTZBf/Woir3KAWTMyz0Q==
  private final String sendEventPostUri;
  // e.g. http://0.0.0.0:7071/runtime/webhooks/durabletask/instances/bd66aa11d8904a74bfc8a982ff5d06c1/terminate?reason={text}&taskHub=SampleHubJs&connection=Storage&code=OeBzKjHaccsvy9ygXILmd4JofNl9zuFZahHTZBf/Woir3KAWTMyz0Q==
  private final String terminatePostUri;
  // e.g. http://0.0.0.0:7071/runtime/webhooks/durabletask/instances/bd66aa11d8904a74bfc8a982ff5d06c1/rewind?reason={text}&taskHub=SampleHubJs&connection=Storage&code=OeBzKjHaccsvy9ygXILmd4JofNl9zuFZahHTZBf/Woir3KAWTMyz0Q==
  private final String rewindPostUri;
  // e.g. http://0.0.0.0:7071/runtime/webhooks/durabletask/instances/bd66aa11d8904a74bfc8a982ff5d06c1?taskHub=SampleHubJs&connection=Storage&code=OeBzKjHaccsvy9ygXILmd4JofNl9zuFZahHTZBf/Woir3KAWTMyz0Q==
  private final String purgeHistoryDeleteUri;

  private static final Log log = LogFactory.getLog(FunctionResponseVO.class);

  /**
   * Initialising constructor, passing what should be the standard response JSON
   * format string from the call to the Durable Function Trigger.
   * 
   * @param response Durable Function response.
   * @see <a href="https://docs.microsoft.com/en-gb/azure/azure-functions/durable/durable-functions-http-api">HTTP API reference</a>
   * @throws ClientException If problem encountered during processing.
   */
  public FunctionResponseVO(final String response) throws ClientException {
    try {
      final JSONObject jsonObject = new JSONObject(response);
      this.id = jsonObject.getString(keyId);
      this.statusQueryGetUri = jsonObject.getString(keyStatusQueryGetUri);
      this.sendEventPostUri = jsonObject.getString(keySendEventPostUri);
      this.terminatePostUri = jsonObject.getString(keyTerminatePostUri);
      this.rewindPostUri = jsonObject.getString(keyRewindPostUri);
      this.purgeHistoryDeleteUri = jsonObject.getString(keyPurgeHistoryDeleteUri);
    } catch (JSONException e) {
      final String errorMessage = "Error parsing response from Durable Function Trigger : " + e.getMessage();
      log.error("~FunctionResponseVO() : ".concat(errorMessage));
      throw new ClientException(errorMessage);
    }
  }

  /* (non-Javadoc)
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    return "FunctionResponseVO [id=" + id + ", statusQueryGetUri="
        + statusQueryGetUri + ", sendEventPostUri=" + sendEventPostUri
        + ", terminatePostUri=" + terminatePostUri + ", rewindPostUri="
        + rewindPostUri + ", purgeHistoryDeleteUri=" + purgeHistoryDeleteUri
        + "]";
  }

  /**
   * @return the id
   */
  public String getId() {
    return id;
  }

  /**
   * @return the statusQueryGetUri
   */
  public String getStatusQueryGetUri() {
    return statusQueryGetUri;
  }

  /**
   * @return the sendEventPostUri
   */
  public String getSendEventPostUri() {
    return sendEventPostUri;
  }

  /**
   * @return the terminatePostUri
   */
  public String getTerminatePostUri() {
    return terminatePostUri;
  }

  /**
   * @return the rewindPostUri
   */
  public String getRewindPostUri() {
    return rewindPostUri;
  }

  /**
   * @return the purgeHistoryDeleteUri
   */
  public String getPurgeHistoryDeleteUri() {
    return purgeHistoryDeleteUri;
  }
}