const request = require('request');

module.exports = async function(context) {
  console.log('~RunApPredict()');

  const simulationData = context.bindings.simulationData;

  const fqdn = simulationData.fqdn;
  const apPredictInput = simulationData.ApPredictInput;
  var voltageResults = "voltageResults";

  const url = "http://" + fqdn + ":8080/";

  var postResponseBody = await postRequest(url, apPredictInput);
  console.log("~RunApPredict() : postResponseBody='" + JSON.stringify(postResponseBody) + "'");

  if (typeof postResponseBody !== "undefined" &&
      typeof postResponseBody.success !== "undefined") {
    const id = postResponseBody.success.id;
    const urlPrefix = url + "api/collection/" + id + "/";

    var finished = false;
    while (!finished) {
      finished = await getForStop(urlPrefix + "STOP");
    }

    voltageResults = await getVoltageResults(urlPrefix + "voltage_results");
  }

  return 'RunApPredict [' + simulationData.fqdn + ']=[' + simulationData.ApPredictInput.pacingFrequency + ']=[' + voltageResults + "]";
};

async function postRequest(url, apPredictInput) {
  console.log("~postRequest() : " + url);

  return new Promise(function(resolve, reject) {
    request.post({
      url: url + "keep_alive",
      body: apPredictInput,
      json: true
    }, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

async function getForStop(url) {
  console.log("~getForStop() : " + url);
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      request.get(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          console.log("~getForStop() : " + body);
          var jsonBody = JSON.parse(body);
          resolve(typeof jsonBody.success != "undefined");
        }
      });
    }, 2000);
  });
}

async function getVoltageResults(url) {
  console.log("~getVoltageResults() : " + url);
  return new Promise(function(resolve, reject) {
    request.get(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      };
    });
  });
}