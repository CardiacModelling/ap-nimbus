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
  console.log('~ACICreate()');

  const simulationCount = context.bindings.simulationCount;

  var createdContainers = msRestNodeAuth.loginWithUsernamePassword(process.env.AZURE_USER,
                                                                   process.env.AZURE_PASS)
                                        .then((credentials) => {
                                           console.log('~ACICreate() : Obtained credentials');
                                           const containerInstanceManagementClient = new armContainerInstance.ContainerInstanceManagementClient(credentials,
                                                                                                                                                process.env.SUBSCRIPTION_ID);

                                           return createContainers(containerInstanceManagementClient,
                                                                   simulationCount,
                                                                   credentials)
                                         })
                                        .then((createdContainers) => {
                                           console.log('~ACICreate() : ' + JSON.stringify(createdContainers));
                                           return createdContainers;
                                         })
                                        .catch((err) => {
                                           console.log('~ACICreate() : Processing fail ' + JSON.stringify(err));
                                           return [];
                                         });

  return createdContainers;
}

async function createContainers(containerInstanceManagementClient,
                                containerCount, credentials) {
  console.log('~createContainers() : Total [' + containerCount + ']');

  const resourceGroupName = process.env.RESOURCE_GROUP_NAME;

  const containerGroupNameBase = "app-manager-" + uuidv4();
  const location = "westeurope";

  var promises = [];

  for (var idx = 0; idx < containerCount; idx++) {
    console.log('~createContainers() : Processing [' + idx + ']');
    const containerGroup = {};

    const nameSuffix = containerGroupNameBase + "-" + idx;

    const nameContainerInstance = "ci-" + nameSuffix
    const nameDNS = "dns-" + nameSuffix;
    const nameGroupName = "gn-" + nameSuffix;

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

  var fqdns = [];

  console.log('~createContainers() : Awaiting');
  // Wait for all the arrayed promises to complete
  const results = await Promise.all(promises);
  console.log('~createContainers() : ' + JSON.stringify(results));

  results.forEach((result, index) => {
    console.log('~createContainers() : ' + JSON.stringify(result));
    fqdns.push(result.ipAddress.fqdn);
  });

  return {
    "credentials": credentials,
    "fqdns": fqdns
  }
}