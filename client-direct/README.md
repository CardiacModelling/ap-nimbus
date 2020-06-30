# Action Potential prediction -- Web Interface Client Direct

This is the code for running the `AP-Nimbus` `client-direct` web interface, i.e. the part that
deals with browser presentation.

`client-direct` is an [Angular 7.0.5](https://angular.io/) component of `AP-Nimbus` developed using
[node.js](https://nodejs.org/) v10.13.0 in a Docker `18.03.1-ce` environment.

## Prerequisites.

 1. If you want to run non-containerised: Install the [Angular CLI](https://angular.io/guide/setup-local)
    to give you access to `ng serve`.  
    For me this involved the following ...  
   1. Install `node` to provide `npm` (e.g. download from [nodejs.org](https://nodejs.org/en/blog/release/v10.13.0/))
   1. `npm install -g @angular/cli@7.0.5 ng`  
      This installs `ng` somewhere (could be alongside the `npm` binary!)  
      `-g` means "install globally", rather than in local dir.
   1. `cd <this client-direct dir> && npm install`  
      This should use `package-lock.json` to create a local git-ignored `node_modules` subdir
      with all the required packages therein.

 1. If you want to run containerised: Install `docker` or similar, e.g. `Podman`/`CRI-O`  
    (No need to install Angular CLI as it's within the `client-direct` docker container).


 1. Optional: `AP-Nimbus` `app-manager`
    ([docker container here](https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager)).  
    `app-manager` is not essential - it's just that without it you won't be able to run any
    simulations.


 1. Optional: `AP-Nimbus` `datastore`
    ([docker container here](https://hub.docker.com/r/cardiacmodelling/ap-nimbus-datastore)).  
    `datastore` is not essential - it's used when you seek indirect transfer (i.e. via a data store)
    of simulation results from `app-manager` to `client-direct` (to allow the two to scale
    independently).

## User Documentation.

 1. See the started application's "about" page, which refers to the legacy `AP-Portal` implementation.
 1. Simulations and simulation results are stored in browser memory based on current session, so it
    all disappears when the browser (or the browser tab) closes.

## Initial configuration.

 1. Calls to `app-manager` by default are to `http://127.0.0.1:8080/`, but if that's
    not convenient, modify [env.js](./src/env.js) either before (manually or via `kick_off.sh`)
    or after deployment (see `buildah` commands below for container deploy guidance on the latter).
 1. Simulation configuration settings are in [appredict.json](./src/assets/config/appredict.json) -
    it's very important that the cell model identifiers correspond exactly with those use by
    `ApPredict` (see `app-manager` README).

## Technical Documentation.

 1. ~~When run~~ Don't run!, `compodoc` is [here](./documentation/index.html).
 1. ~~When run~~ Don't run!, code coverage is [here](./coverage/index.html).

## TODO.

 1. Switch to react.js or something other than Angular!

## Useful commands.

### Building (and tagging) image.

 1. `cd <client-direct dir>`
 1. `docker build --build-arg build_processors=8 -t client-direct:0.0.x .`  
    Note the trailing '.'!  
    `build_processors`: Used in `Dockerfile` to run parallel build.  
    `-t`: Tags the built image as `client-direct` version `0.0.4`. 

### Tagging + pushing image (to private, insecure repo).

 1. `docker tag client-direct:0.0.x 127.0.0.1:5000/client-direct:0.0.x`
 1. `docker push 127.0.0.1:5000/client-direct:0.0.x`

### Starting (non-containerised from source code).

Perhaps take a look at the "Prerequisites" above before trying these commands!

 1. `cd <client-direct dir>`  
 1. By default `app-manager` and the optional intermediary data store URLs default to
    `http://127.0.0.1:8080/` and `http://127.0.0.1:8080/api/collection/` respectively. If you
    are not using these locations ...  
    `REST_API_URL_APPMGR=<app-manager url> REST_API_URL_DATA=<data store url> ./entry_point.sh`  
    e.g. `REST_API_URL_APPMGR=http://127.0.0.1:8888/ REST_API_URL_DATA=http://127.0.0.1:8118/api/collection/ ./entry_point.sh`  
    ** Caution **: Running `./entry_point.sh` modifies `./src/env.js` which is git-managed! If you
    wish to revert a change to `env.js` then run `git checkout src/env.js` (although keep in mind
    that when using `ng serve`, files are watched for modification and modified values will be
    used immediately!).
 1. `./kick_off.sh [<client-direct host>] [<client-direct port>]`  
    `kick_off.sh` without args defaults to host `0.0.0.0` and port `4200`.

### Starting (containerised).

To run containerised please see `deploy` instructions.
