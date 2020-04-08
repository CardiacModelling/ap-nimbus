const armContainerInstance = require('@azure/arm-containerinstance');
const msRestNodeAuth = require('@azure/ms-rest-nodeauth');

module.exports = async function(context) {
  console.log("~ACIDelete()");

  const resourceGroupName = process.env.RESOURCE_GROUP_NAME;

  const createdACIs = context.bindings.createdACIs;

  const containerData = createdACIs.containerData;

  msRestNodeAuth.loginWithUsernamePassword(process.env.AZURE_USER,
                                           process.env.AZURE_PASS)
                .then((credentials) => {
                   console.log("~ACIDelete() : Obtained credentials");
                   const containerInstanceManagementClient = new armContainerInstance.ContainerInstanceManagementClient(credentials,
                                                                                                                        process.env.SUBSCRIPTION_ID);
                   for (var idx = 0; idx < containerData.length; idx++) {
                     const eachContainerData = containerData[idx];

                     const containerGroupName = eachContainerData.containerGroupName;

                     console.log("~ACIDelete() : Deleting " + containerGroupName);

                     containerInstanceManagementClient.containerGroups
                                                      .deleteMethod(resourceGroupName,
                                                                    containerGroupName)
                                                      .then((result) => {
                                                        console.log("~ACIDelete() : Deleted " + containerGroupName);
                                                      });
                   }
                 })
                .catch((err) => {
                   console.log("~ACIDelete() : Processing fail " + err);
                   console.log("~ACIDelete() : Processing fail " + JSON.stringify(err));
                });
};