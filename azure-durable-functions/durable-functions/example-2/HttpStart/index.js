const durableFunctions = require("durable-functions");

/**
 * HTTP trigger (as defined in functions.json bindings).
 * 
 * @param context Always provided by default as first param.
 * @param req HTTP request (param name as defined in function.json)
 */
module.exports = async function(context, req) {

    // https://docs.microsoft.com/en-us/javascript/api/durable-functions/?view=azure-node-latest#getclient-unknown-
    const durableOrchestrationClient = durableFunctions.getClient(context);

    // Start the durable function orchestration (startNew(..) returns a Promise<string>)
    const orchestratorFunctionName = "WorkflowOrchestrator";
    const input = req.body;

    const instanceId = await durableOrchestrationClient.startNew(orchestratorFunctionName,
                                                                 undefined, input);

    context.log(`Started orchestration with ID = '${instanceId}'.`);

    /*
     * Returns IHttpResponse, which returns a JSON collection of URLs that calling clients can use
     * for retrieving the status of the application, how to delete, etc..
     * 
     * https://docs.microsoft.com/en-us/javascript/api/durable-functions/ihttpresponse?view=azure-node-latest
     */ 
    return durableOrchestrationClient.createCheckStatusResponse(context.bindingData.req, instanceId);
};
