module.exports = async function(context) {
    console.log('Called ACICreate');

    const simulationCount = context.bindings.simulationCount;

    const aciInstances = new Array(simulationCount);
    for (var idx = 0; idx < simulationCount; idx++) {
      aciInstances[idx] = 'ACI ' + idx;
    }

    return aciInstances;
};