const armContainerInstance = require('@azure/arm-containerinstance');
const msRestNodeAuth = require('@azure/ms-rest-nodeauth');
const uuidv4 = require('uuid/v4');

/**
 * Create the <acronym title="Azure Container Instances">ACI</acronym>s.
 * 
 * @param context
 * @returns
 * @see https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/containerinstance/arm-containerinstance
 */
module.exports = async function(context) {
  console.log("~ACICreate()");

  const simulationCount = context.bindings.simulationCount;

  var createdContainers = msRestNodeAuth.loginWithUsernamePassword(process.env.AZURE_USER,
                                                                   process.env.AZURE_PASS)
                                        .then((credentials) => {
                                           console.log("~ACICreate() : Obtained credentials");
                                           const containerInstanceManagementClient = new armContainerInstance.ContainerInstanceManagementClient(credentials,
                                                                                                                                                process.env.SUBSCRIPTION_ID);

                                           const createdContainers = createContainers(simulationCount,
                                                                                      containerInstanceManagementClient);
                                           console.log("~ACICreate() : createdContainers : " + JSON.stringify(createdContainers));
                                           return createdContainers;
                                         })
                                        .catch((err) => {
                                           console.log("~ACICreate() : Processing fail " + err);
                                           console.log("~ACICreate() : Processing fail " + JSON.stringify(err));
                                           return {};
                                         });
  console.log("~ACICreate() : Returning : " + JSON.stringify(createdContainers));
  return createdContainers;
}

async function createContainers(containerCount, containerInstanceManagementClient) {
  console.log("~createContainers() : Total [" + containerCount + "]");

  const resourceGroupName = process.env.RESOURCE_GROUP_NAME;

  const containerGroupNameBase = "app-manager-" + uuidv4();
  const location = "westeurope";

  var promises = [];

  for (var idx = 0; idx < containerCount; idx++) {
    console.log("~createContainers() : Processing [" + idx + "]");
    const containerGroup = {};

    const nameSuffix = containerGroupNameBase + "-" + idx;

    const nameContainerInstance = "ci-" + nameSuffix
    const nameDNS = "dns-" + nameSuffix;
    const nameGroupName = "gn-" + nameSuffix;

    /*
     * If using ACR and Service Principals - see README.md
     * "image": "appredictregistry1.azurecr.io/ap-nimbus-app-manager:0.0.10",
     */
    containerGroup.containers = [{
                                   "environmentVariables": [],
                                   "name": nameContainerInstance,
                                   "image": "cardiacmodelling/ap-nimbus-app-manager:0.0.10",
                                   "ports": [
                                     {
                                       "protocol": "TCP",
                                       "port": 8080
                                     },
                                   ],
                                   "resources": {
                                     "requests": {
                                       "memoryInGB": 1,
                                       "cpu": 1
                                     }
                                   }
                                 }];
    /*
     * If using ACR and Service Principals - see README.md
     * 
     * containerGroup.imageRegistryCredentials = [{
     *   "server": "<registry_name>.azurecr.io",
     *    "username": "<username>",
     *    "password": "password"
     * }];
     */

    containerGroup.ipAddress = {
      "ports": [
        {
          "protocol": "TCP",
          "port": 8080
        },
      ],
      "type": "Public",
      "dnsNameLabel": nameDNS
    }
    containerGroup.location = location;
    containerGroup.name = nameGroupName;
    containerGroup.osType = "Linux";
    containerGroup.restartPolicy = "Always";

    promises.push(containerInstanceManagementClient.containerGroups
                                                   .createOrUpdate(resourceGroupName,
                                                                   nameGroupName,
                                                                   containerGroup));
  }

  var containerData = [];

  console.log("~createContainers() : Awaiting");
  // Wait for all the arrayed promises to complete
  const results = await Promise.all(promises);
  console.log("~createContainers() : " + JSON.stringify(results));

  results.forEach((result, index) => {
    const fqdn = result.ipAddress.fqdn;
    const containerGroupName = result.name;

    containerData.push({
      "fqdn": fqdn,
      "containerGroupName": containerGroupName
    });
  });

  const toReturn = {
    "containerData": containerData
  };

  console.log("~createContainers() : toReturn : " + JSON.stringify(toReturn));

  return toReturn; 
}