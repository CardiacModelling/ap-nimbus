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
package uk.ac.nottingham.cardiac.azure.functions.durable.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import uk.ac.nottingham.cardiac.azure.functions.durable.exception.ClientException;
import uk.ac.nottingham.cardiac.azure.functions.durable.model.InitialSubmission;
import uk.ac.nottingham.cardiac.azure.functions.durable.model.InitialResponse;
import uk.ac.nottingham.cardiac.azure.functions.durable.service.DurableFunctions;

/**
 *
 *
 * @author geoff
 */
@Controller
@RequestMapping("/ajax")
public class AjaxController {

  @Autowired
  private DurableFunctions durableFunctions;

  private static final Log log = LogFactory.getLog(AjaxController.class);

  @RequestMapping(method=RequestMethod.POST,
                  produces=MediaType.APPLICATION_JSON_UTF8_VALUE,
                  value="/callout")
  @ResponseStatus(HttpStatus.OK)
  @ResponseBody 
  public InitialResponse postRequest(final @RequestBody
                                           InitialSubmission initialSubmission) {
    log.debug("~postRequest() : Invoked");

    String response = null;
    try { 
      response = durableFunctions.invoke(initialSubmission.getUrl(),
                                         initialSubmission.getInvocationCount());
    } catch (ClientException e) {
      response = e.getMessage();
    }

    final InitialResponse initialResponse = new InitialResponse();
    initialResponse.setResponse(response);
    return initialResponse;
  }

}