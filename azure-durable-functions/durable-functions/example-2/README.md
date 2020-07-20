# Azure Durable Functions on Linux demo (in Docker)

## Handy references

 1. Note: [https://github.com/azure/azure-sdk-for-node](https://github.com/azure/azure-sdk-for-node)
    is legacy, use
    [https://github.com/azure/azure-sdk-for-js](https://github.com/azure/azure-sdk-for-js) instead.
 1. Latest javascript packages [Azure SDK for JavaScript (Latest) | Azure SDKs](https://azure.github.io/azure-sdk/releases/latest/all/js.html)
 1. Reference doco [Azure SDK for JavaScript](https://azure.github.io/azure-sdk-for-js/)
 1. Quickstarts/Tutorials/etc [Azure SDK for JavaScript documentation](https://docs.microsoft.com/en-us/azure/javascript/?view=azure-node-latest) 

## Prerequisite

 1. Azure Storage -- a *real* Azure storage resource, e.g. [General-purpose v1](https://docs.microsoft.com/en-gb/azure/storage/common/storage-account-overview#general-purpose-v1-accounts) with [pricing](https://azure.microsoft.com/en-gb/pricing/details/storage/blobs/).     
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

## Azure Container Registry (ACR) background.

As the [cardiacmodelling/ap-nimbus-app-manager:0.0.10](https://hub.docker.com/layers/cardiacmodelling/ap-nimbus-app-manager/0.0.10/images/sha256-45e742ebd53ac859799c679bb8202a68746079a619105d121647fab615d1410a?context=explore) image is 
approx 1.4Gb it's been taking approx 7 minutes for the containers to be spun up (which isn't much
better than the time it takes to pull the image from dockerhub on my home broadband!). So I thought
it would be quicker to use the ACR... but it wasn't, it still took 8 minutes to pull the image. So
much for Corey Sanders' (Corporate Vice President, Azure) claim of
[An Azure Container Instance is a single container that starts in seconds ...](https://azure.microsoft.com/en-gb/blog/announcing-azure-container-instances/)!

Pricing is as [Container Registry pricing](https://azure.microsoft.com/en-gb/pricing/details/container-registry/)

Beware though, as usual something as fundamental as a read-only, anonymous ACR
[isn't straightforward](https://feedback.azure.com/forums/903958-azure-container-registry/suggestions/32517127-enable-anonymous-access-to-registries)
, so you may need to use [Authenticate with an Azure container registry](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-authentication), e.g. Service Principals, as below.

 1. Created a "Basic" Azure Container Registry in "westeurope" location.
 1. `az acr login --name <registry_name>`
 1. `docker run -it cardiacmodelling/ap-nimbus-app-manager:0.0.10`
 1. `docker tag cardiacmodelling/ap-nimbus-app-manager:0.0.10 <registry_name>.azurecr.io/ap-nimbus-app-manager:0.0.10`
 1. `docker push <registry_name>.azurecr.io/ap-nimbus-app-manager:0.0.10`
 1. [Create a service principal](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal#create-a-service-principal)   
    Edit the `<container-registry-name>` value to `<registry_name>` before running the script.  
    Make a note of the `Service principal ID` (aka "username") and `Service principal password` (aka "password").
 1. Try `docker login <registry-name>.azurecr.io --username <username> --password <password>`.
 1. Based on [Microsoft.ContainerInstance containerGroups template reference](https://docs.microsoft.com/en-us/azure/templates/Microsoft.ContainerInstance/2018-10-01/containerGroups) adapt the ARM in `ACICreate/index.js` to.   

```
                                   }
                                 }];
    containerGroup.imageRegistryCredentials = [{
      "server": "<registry_name>.azurecr.io",
      "username": "<username>",
      "password": "<password>"
    }];
    containerGroup.ipAddress = {
      "ports": [
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
