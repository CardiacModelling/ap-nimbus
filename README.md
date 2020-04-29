# Action Potential prediction (`ApPredict`) _in containers_ - `AP-Nimbus`!

[`ApPredict`](https://github.com/Chaste/ApPredict) performs simulations of drug-induced changes to the cardiac action potential to support the [CiPA initiative](http://cipaproject.org/).

This activity is a continuation of the [ap_predict_online](https://bitbucket.org/gef_work/ap_predict_online/src/)
work -- the aim being to containerise the `AP-Portal`.

## Repository content :

### `app-manager` application-invoking "REST" API

node.js application which invokes the simulation software, `ApPredict`, monitors
its progress, and returns the results to the calling client (usually
`client-direct`).

See: https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager

### `appredict-chaste-libs` `ApPredict`'s dependencies.

`ApPredict`'s prerequisite libraries (e.g. Boost, MPICH, PETSc, SCons, etc.).
The foundation upon which `ApPredict` can be built and run.

See: https://hub.docker.com/r/cardiacmodelling/appredict-chaste-libs

### `appredict-no-emulators` C++ Cardiac modelling software (without emulators).

`ApPredict` without [uncertainty](https://doi.org/10.1016/j.vascn.2013.04.007)
emulators, i.e. they'll be downloaded (using `wget`) in real-time if required.

See: https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators

### `appredict-with-emulators` C++ Cardiac modelling software with emulators.

`ApPredict` with [uncertainty](https://doi.org/10.1016/j.vascn.2013.04.007)
emulators preinstalled. Helpful if using the container behind a corporate proxy.

See: https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators

### `azure-durable-functions` 

Test application for Azure durable function invocation of `ApPredict`.

### `client-direct` web interface

Angular UI.

See: https://hub.docker.com/r/cardiacmodelling/ap-nimbus-client-direct

### `datastore` Data store.

Mongo-based microservice database (for use with `app-manager` and
`client-direct`).

See: https://hub.docker.com/r/cardiacmodelling/ap-nimbus-datastore



