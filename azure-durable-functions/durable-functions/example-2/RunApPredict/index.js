module.exports = async function(context) {
    console.log('Called RunApPredict');

    const simulationData = context.bindings.simulationData;

    return 'RunApPredict [' + simulationData.ACIData + ']=[' + simulationData.ApPredictInput.pacingFrequency + ']';
};
