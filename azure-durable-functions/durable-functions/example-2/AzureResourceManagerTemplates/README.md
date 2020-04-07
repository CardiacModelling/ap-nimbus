# ARM (Azure Resource Manager) Templates

## Use of Templates

As of Apr. 2020 I'm struggling to find a way of combining
[Azure SDK for js](https://github.com/Azure/azure-sdk-for-js/)
and [ARM template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/)s so
going to focus on creating multiple Container Instances programmatically.

## Information Sources

 1. [https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/)
 1. [https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/copy-resources](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/copy-resources)
 1. [https://github.com/aaronmsft/aaronmsft-com/tree/master/azure-container-instances-arm](https://github.com/aaronmsft/aaronmsft-com/tree/master/azure-container-instances-arm)

## Limitations

Based on [Quotas and limits for Azure Container Instances](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-quotas) :

Resource | Limit
--- | ---
Number of containers per container group | 60
Number of volumes per container group | 20
Ports per IP | 5
Container instance log size - running instance | 4 MB
Container instance log size - stopped instance | 16 KB or 1,000 lines
Container creates per hour | 300
Container creates per 5 minutes | 100
Container deletes per hour | 300
Container deletes per 5 minutes | 100

## Sample commands

```
az container create --resource-group <resource-group> --name ap-nimbus-app-manager --dns-name-label app-manager --image cardiacmodelling/ap-nimbus-app-manager:0.0.10 --ports 8080 --protocol TCP --location westeurope --os-type Linux --memory 1 --cpu 1

az group deployment create -g <resource-group> --mode Complete --template-file arm.json
az group deployment create -g <resource-group> --mode Complete --template-file arm.json --parameters containerCount=3
az container list --resource-group <resource-group> --output table

az group deployment create -g <resource-group> --mode Complete --template-file empty.json

```