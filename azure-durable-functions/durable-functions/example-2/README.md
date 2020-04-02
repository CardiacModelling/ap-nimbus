# Azure Durable Functions on Linux demo (in Docker)

## Based on

[https://github.com/Azure/azure-functions-durable-extension](https://github.com/Azure/azure-functions-durable-extension) (commit #717fca4 I think).

## Prerequisite

 1. Azure Storage (Unfortunately Storage Emulators, e.g. Azurite 2/3, didn't work). 
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

## To build

 1. `docker build -t azure-durable-functions-appredict:0.0.1 .`

## To start

 1. `docker run -it -p 7071:7071 --rm azure-durable-functions-appredict:0.0.1`

## To call

 1. `curl -v -H 'Content-type:application/json' -X POST -d @simulationInput.json http://0.0.0.0:7071/ApPredict`