//const Azure = require('azure');
const MsRest = require('@azure/ms-rest-nodeauth');

module.exports = async function(context) {
    console.log('Called ACICreate');

    console.log(process.env.AZURE_USER + ' ' + process.env.AZURE_PASS);
    MsRest.loginWithUsernamePassword(process.env.AZURE_USER, process.env.AZURE_PASS, (err, credentials) => {
      if (err) {
        console.log(err);
      } else {
        console.log(JSON.stringify(credentials));
      }

      // let storageClient = Azure.createStorageManagementClient(credentials, 'subscription-id');

      // ..use the client instance to manage service resources.
    });

    const simulationCount = context.bindings.simulationCount;

    const aciInstances = new Array(simulationCount);
    for (var idx = 0; idx < simulationCount; idx++) {
      aciInstances[idx] = 'ACI ' + idx;
    }

    return aciInstances;
};