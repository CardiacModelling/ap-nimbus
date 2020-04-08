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
 *
 *
 * @author geoff
 */
public class StatusResponseVO {

  private static final String keyName = "name";
  private static final String keyInstanceId = "instanceId";
  private static final String keyRuntimeStatus = "runtimeStatus";
  private static final String keyInput = "input";
  private static final String keyCustomStatus = "customStatus";
  private static final String keyOutput = "output";
  private static final String keyCreatedTime = "createdTime";
  private static final String keyLastUpdatedTime = "lastUpdatedTime";

  private static final String statusCompleted = "Completed";

  private final String name;
  private final String instanceId;
  private final String runtimeStatus;
  private final String input;
  private final String customStatus;
  private final String output;
  private final String createdTime;
  private final String lastUpdatedTime;

  private static final Log log = LogFactory.getLog(StatusResponseVO.class);

  public StatusResponseVO(final String response) throws ClientException {
    log.debug("~StatusResponseVO() : Response : " + response);
    try {
     final JSONObject jsonObject = new JSONObject(response);
     this.name = jsonObject.getString(keyName);
     this.instanceId = jsonObject.getString(keyInstanceId);
     this.runtimeStatus = jsonObject.getString(keyRuntimeStatus);
     this.input = jsonObject.isNull(keyInput) ? null
                                              : jsonObject.get(keyInput).toString() ;
     this.customStatus = jsonObject.isNull(keyCustomStatus) ? null
                                                            : jsonObject.getString(keyCustomStatus);
     this.output = jsonObject.get(keyOutput).toString();
     this.createdTime = jsonObject.getString(keyCreatedTime);
     this.lastUpdatedTime = jsonObject.getString(keyLastUpdatedTime);
   } catch (JSONException e) {
     final String errorMessage = "Error parsing status response from Durable Trigger : " + e.getMessage();
     log.error("~StatusResponseVO() : ".concat(errorMessage));
     throw new ClientException(errorMessage);
   }
  }

  /* (non-Javadoc)
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    return "StatusResponseVO [name=" + name + ", instanceId=" + instanceId
        + ", runtimeStatus=" + runtimeStatus + ", input=" + input
        + ", customStatus=" + customStatus + ", output=" + output
        + ", createdTime=" + createdTime + ", lastUpdatedTime="
        + lastUpdatedTime + "]";
  }

  /**
   * Indicator of status's "completed" state.
   * 
   * @return {@code true} if status indicates completed, otherwise {@code false}.
   */
  public boolean hasStatusCompleted() {
    return statusCompleted.equals(getRuntimeStatus());
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @return the instanceId
   */
  public String getInstanceId() {
    return instanceId;
  }

  /**
   * @return the runtimeStatus
   */
  public String getRuntimeStatus() {
    return runtimeStatus;
  }

  /**
   * @return the input
   */
  public String getInput() {
    return input;
  }

  /**
   * @return the customStatus
   */
  public String getCustomStatus() {
    return customStatus;
  }

  /**
   * @return the output
   */
  public String getOutput() {
    return output;
  }

  /**
   * @return the createdTime
   */
  public String getCreatedTime() {
    return createdTime;
  }

  /**
   * @return the lastUpdatedTime
   */
  public String getLastUpdatedTime() {
    return lastUpdatedTime;
  }

}