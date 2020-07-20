# Azure Durable Functions on Linux demo (in Docker)

## Based on

[https://github.com/Azure/azure-functions-durable-extension](https://github.com/Azure/azure-functions-durable-extension) (commit #717fca4 I think).

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

## To build

 1. `docker build -t azure-durable-functions:0.0.1 .`

Note that during the build process it does call out to remote resources to download stuff as part
of the installation, but that I've encountered times when such remote resources are offline and the
build pauses, prints "Build failed", but continues to build an image that won't work.

## To start

 1. `docker run -it -p 7071:7071 --rm azure-durable-functions:0.0.1`

## To call

 1. `curl -v -H "Content-Length: 0" -X POST http://0.0.0.0:7071/orchestrators/E1_HelloSequence`
