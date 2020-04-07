# Azure Durable Functions on Linux demo (in Docker)

## Handy references

 1. Note: [https://github.com/azure/azure-sdk-for-node](https://github.com/azure/azure-sdk-for-node)
    is legacy, use
    [https://github.com/azure/azure-sdk-for-js](https://github.com/azure/azure-sdk-for-js) instead.
 1. Latest javascript packages [Azure SDK for JavaScript (Latest) | Azure SDKs](https://azure.github.io/azure-sdk/releases/latest/all/js.html)
 1. Reference doco [Azure SDK for JavaScript](https://azure.github.io/azure-sdk-for-js/)
 1. Quickstarts/Tutorials/etc [Azure SDK for JavaScript documentation](https://docs.microsoft.com/en-us/azure/javascript/?view=azure-node-latest) 

## Prerequisite

 1. Azure Storage -- a *real* Azure storage resource.     
    As of Mar. 2020 I couldn't use [Azurite 3](https://github.com/Azure/Azurite#azurite-v3) because
    it doesn't have *Table* storage which durable functions need, and while Azurite 2 does, I
    couldn't get it to work.
 1. Your own `local.settings.json` file containing ...   

```
      {
        "IsEncrypted": false,
        "Values": {
          "FUNCTIONS_WORKER_RUNTIME": "node",
          "FUNCTIONS_V2_COMPATIBILITY_MODE": true,
          "AzureWebJobsStorage": "DefaultEndpointsProtocol=https;AccountName=<your account>;AccountKey=<your account key>;EndpointSuffix=core.windows.net"
      }
```

Note that if the referenced storage account is not available (I'm not sure how, but my Storage
Account suddenly disappeared at one point, maybe they're time-limited!) you'll see something 
unhelpful like the following when you try to start. What I think it's trying and failing to do is 
communicate with a non-existent endpoint `<storage-name>.blob.core.windows.net` :

```
[04/04/2020 10:44:39] Initializing Warmup Extension.
[04/04/2020 10:45:04] A host error has occurred during startup operation 'f996c666-d5bd-4eb0-96cb-53d966bc210e'.
[04/04/2020 10:45:04] Microsoft.WindowsAzure.Storage: No such device or address. System.Net.Http: No such device or address. System.Private.CoreLib: No such device or address.
[04/04/2020 10:45:04] Initializing Warmup Extension.
Value cannot be null.
Parameter name: provider
```

## NPM background

 1. To get the `package-lock.json` and `package.json` updated I had to run
    `npm install @azure/ms-rest-nodeauth` to comply with the availability of the latest
    [azure-sdk-for-js](https://github.com/azure/azure-sdk-for-js) (whereas using the legacy
    [https://github.com/azure/azure-sdk-for-node](https://github.com/azure/azure-sdk-for-node) would
    have needed `npm install azure`).

## To build

 1. `docker build -t azure-durable-functions-appredict:0.0.1 .`

Note that during the build process it does call out to remote resources to download stuff as part
of the installation, but that I've encountered times when such remote resources are offline and the
build pauses, prints "Build failed", but continues to build an image that won't work.

## To start

 1. `docker run -e SUBSCRIPTION_ID=<subscription-id> -e RESOURCE_GROUP_NAME=<resource-group-name> -e AZURE_USER=<username> -e AZURE_PASS=<password> -it -p 7071:7071 --rm azure-durable-functions-appredict:0.0.1`

## To call

 1. `curl -v -H 'Content-type:application/json' -X POST -d @simulationInput.json http://0.0.0.0:7071/ApPredict`