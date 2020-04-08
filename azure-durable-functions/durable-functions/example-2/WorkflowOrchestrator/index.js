const durableFunctions = require("durable-functions");

/**
 * Orchestrate the workflow.
 * 
 * The <code>function*</code> indicates "Generator function" :
 * A generator function is a function that can return multiple values, through intermediate
 * “returns” marked by the keyword yield. The generator function pauses its execution at each of
 * these points until it would eventually reach its final return, using the regular “return”
 * keyword, and the function ends.
 * 
 * 
 * @see https://medium.com/front-end-weekly/modern-javascript-and-asynchronous-programming-generators-yield-vs-async-await-550275cbe433
 */
module.exports = durableFunctions.orchestrator(function*(context) {
  console.log("~WorkflowOrchestrator()");

  const requestBody = context.df.getInput();

  const output = [];

  // Step 1. Create the ACI(s)
  const createdACIs = yield context.df.callActivity("ACICreate", requestBody.length);
  console.log("~WorkflowOrchestrator() : createdACIs : " + JSON.stringify(createdACIs));

  // Step 2. Run ApPredict simulations in ACIs in parallel.
  const parallelTasks = [];

  const containerData = createdACIs.containerData;
  for (let idx = 0; idx < requestBody.length; idx++) {
    const fqdn = containerData[idx].fqdn;
    const apPredictInput = requestBody[idx];

    const simulationData = {
      "ApPredictInput" : apPredictInput,
      "fqdn" : fqdn
    }

    parallelTasks.push(context.df.callActivity("RunApPredict", simulationData));
  }

  const results = yield context.df.Task.all(parallelTasks);

  // Step 3. Delete the ACI(s)
  yield context.df.callActivity("ACIDelete", createdACIs);

  return results;
});
