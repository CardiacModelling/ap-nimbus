module.exports = async function(context) {
    console.log('Called ACIDelete');

    const createdAci = context.bindings.createdAci;

    return 'ACIDelete ' + createdAci;
};