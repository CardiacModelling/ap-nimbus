# Action Potential prediction (`ApPredict`) _in containers_ - `AP-Nimbus`!

[`ApPredict`](https://github.com/Chaste/ApPredict) performs simulations of
drug-induced changes to the cardiac action potential to support the
[CiPA initiative](http://cipaproject.org/).

This activity is a continuation of the [ap_predict_online](https://bitbucket.org/gef_work/ap_predict_online/src/)
work -- the aim being to containerise the `AP-Portal`.

We're working on the documentation side of things at https://ap-nimbus.readthedocs.io/

## Current/Active work :

### `app-manager` application-invoking "REST" API

node.js application which invokes the simulation software, `ApPredict`, monitors
its progress, and returns the results to the calling client (usually
`client-direct`).

See: https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager

### `appredict-docker` ApPredict in containers

#### `appredict-chaste-libs` `ApPredict`'s dependencies.

`ApPredict`'s prerequisite libraries (e.g. Boost, PETSc, HDF5, etc.).
The foundation upon which `ApPredict` can be built and run.

See: https://hub.docker.com/r/cardiacmodelling/appredict-chaste-libs

#### `appredict-no-emulators` C++ Cardiac modelling software (without emulators).

`ApPredict` without [uncertainty](https://doi.org/10.1016/j.vascn.2013.04.007)
emulators, i.e. they'll be downloaded (using `wget`) in real-time if required.

See: https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators

#### `appredict-with-emulators` C++ Cardiac modelling software with emulators.

`ApPredict` with [uncertainty](https://doi.org/10.1016/j.vascn.2013.04.007)
emulators preinstalled. Helpful if using the container behind a corporate proxy.

See: https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators

### `client-direct` web interface

Submodule containing re-developed Django UI

See: https://hub.docker.com/r/cardiacmodelling/ap-nimbus-client-direct

## Discontinued work :

### `ap-nimbus-azure-durable-functions` 

Test application for Azure durable function invocation of `ApPredict`.

### `ap-nimbus-datastore` Data store.

Mongo-based microservice database (for use with `app-manager` and
`client-direct`).

See: https://hub.docker.com/r/cardiacmodelling/ap-nimbus-datastore

### `ap-nimbus-deploy` Container orchestration

Docker `compose`, `swarm` configs and `kubernetes` testing.
