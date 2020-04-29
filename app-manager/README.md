# Action Potential prediction -- Application Manager.

This is the code for running an `ApPredict` executable.

`app-manager` is a [node.js](https://nodejs.org/) (v10.13.0) front-end to the `ApPredict` cardiac
simulation engine.

## Prerequisites.

 1. If you want to run non-containerised: Install `node.js`, `ApPredict`, and whatever's
    `apk add`ed in the `Dockerfile`, e.g. `jq`, `inotify-tools`.  
    Check the `run_me.sh` script for guidance regarding expected location of `ApPredict.sh`!


 1. If you want to run containerised: Install `docker` or similar e.g. `Podman`/`CRI-O`.  
    Note that the dockerised `ApPredict` was compiled with certain cpu flags (e.g. `sse4_1`,
    `sse4_2`) which if not present on the container's host cpu (check `flags` in
    '`cat /proc/cpuinfo`'  output) may cause `ApPredict` to fail with a message mentioning something
    like "illegal instruction".

## Initial configuration.

 1. It's imperative that `ApPredict`'s `--model` numbers correspond exactly with those used in any
    calling code (e.g. arriving from `client-direct`).  
    The full list can be browsed by running `ApPredict` with no args, e.g.,  
    `docker run -it <docker image id> /home/appredict/apps/ApPredict/ApPredict.sh`, or ..  
    `docker exec -it <docker container id> /home/appredict/apps/ApPredict/ApPredict.sh`

## Technical documentation.

### Brief overview of process.

 1. Docker runs `kick_off.sh` when the image is run.
 1. `kick_off.sh` firstly sets off `convert.sh` watching file
    creation/modification in a "run" directory.  
    (If a file creation/modification event of interest takes place (as a result
    of an `ApPredict` invocation) the changed file is read from the "run"
    directory (probably a simulation-specific `ApPredict_output/` directory),
    processed, and written (usually in JSON format) to a simulation-specific
    "results" directory.)
 1. `kick_off.sh` secondly sets off `server.js` listening on whichever
    host/port (e.g. `0.0.0.0:8080`).  
    (If an intermediary data repository is being used (i.e. if the `REST_API_URL_DATA`
    environment variable is assigned a value) then `server.js` starts watching
    file creation/modification in a "results" directory.  
    If a creation/modification event of interest takes place in this "results" 
    directory then the content is read in and sent (via http) to the intermediary
    data repository.)
 1. `app-manager` (i.e. `server.js`) receives a POST request from `client-direct`
    to run `ApPredict`
 1. `server.js` invokes `run_me.sh`
 1. `run_me.sh` starts `ApPredict` which writes output to the "run" directory.
 1. `convert.sh` sees results appearing in the "run" directory and, on events of
    interest, processes the content and writes it to the "results" directory.
 1. If an intermediary data repository is being used then `server.js` sees
    data files appearing/changing in the "results" directory, reads them, then
    sends them to the intermediary data repository REST API URL ...  
    ... otherwise `server.js` will be awaiting polling calls from `client-direct`
    requesting the results data and responding with content from files in the
    "results" directory if/when available.

## Useful commands.

### Building (and tagging) image.

 1. `cd <app-manager dir>`
 1. `docker build --build-arg build_processors=8 -t app-manager:0.0.x .`  
    Note the trailing '.'!  
    `build_processors`: Used in `Dockerfile` to run parallel build.  
    `-t`: Tags the built image as `app-manager` version `0.0.x`. 

### Tagging + pushing image (to private, insecure repo).

 1. `docker tag app-manager:0.0.x 127.0.0.1:5000/app-manager:0.0.x`
 1. `docker push 127.0.0.1:5000/app-manager:0.0.x`

### Starting (non-containerised from source code).

 1. `cd <app-manager dir>`
 1. `npm ci` (Optional - if `node_modules` dir. not present!)
 1. `REST_API_URL_DATA=http://127.0.0.1:8118/ ./kick_off.sh`.
 1. By default `app-manager` listens on `http://0.0.0.0:8080/`. It also won't attempt to write
    copy (via `http`) simulation results to an intermediary data store unless the environment
    variable `REST_API_URL_DATA` is assigned, e.g.  
    `REST_API_URL_DATA=http://127.0.0.1:8118/ ./kick_off.sh`

## Starting (containerised).

To run containerised please see `deploy` instructions.
