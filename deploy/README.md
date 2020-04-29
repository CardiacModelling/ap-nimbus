# Running containers.

## Sample instructions

### Individually run containers.

`client-direct` (which `Dockerfile` `EXPOSE`s to container port `4200`):

 1. As an ungrouped (i.e. started individually) container with direct `client-direct` <=>
    `app-manager` comms. (assuming you want to expose the container port 4200 to your port 4200
     using `[-p|--publish] 4200:4200` <sup>1</sup>.   
    `docker run -it -p 4200:4200 --rm cardiacmodelling/ap-nimbus-client-direct:0.0.6`  (docker hub)  
    `podman run --rm -it -p 4200:4200 docker.io/cardiacmodelling/ap-nimbus-client-direct:0.0.6`  (docker hub)  
    `docker run -it -p 4200:4200 --rm client-direct:0.0.6`  (docker-built and tagged locally)

 1. As an ungrouped (i.e. started individually) container with indirect results retrieval from an
    intermediary data store.  
    `docker run -it -p 4200:4200 -e REST_API_URL_APPMGR=http://172.17.0.1:8080/ -e REST_API_URL_DATA=http://172.17.0.1:8118/api/collection/ --rm client-direct:0.0.6`

`app-manager` (which `Dockerfile` `EXPOSE`s to container port `8080`):

 1. Direct `client-direct` <=> `app-manager` comms.  
    `docker run -it -p 8080:8080 --rm app-manager:0.0.10`
 1. Indirect (i.e. via intermediary data repository) comms.  
    `docker run -it -p 8080:8080 -e REST_API_URL_DATA='http://127.0.0.1:8118/' --rm app-manager:0.0.10`

### Docker `compose`d containers:

 1. As a grouped container (`client-direct` and `app-manager` only).  
    See [docker-compose-minimum.yml](docker-compose/docker-compose-minimum.yml).

 1. As a grouped container (`client-direct`, `app-manager`, `datastore` and `mongodb`).  
    See [docker-compose-all.yml](docker-compose/docker-compose-all.yml).

### Full orchestration:

 1. As an orchestrated docker "swarm" deployment.  
    See [docker-compose-swarm.yml](o11n/swarm/docker-compose-swarm.yml).

 1. As an orchestrated kubernetes deployment.  
    See [kubernetes configs](o11n/k8s/).

## General `buildah` commands.

`container=$(buildah from docker.io/cardiacmodelling/ap-nimbus-client-direct:0.0.6)`  
`buildah run $container cat /usr/src/app/src/env.js` # Check content.  
`buildah copy $container env.js /usr/src/app/src/env.js` # Modify running container.  
`buildah commit --format docker $container ap-nimbus-client-direct:0.0.6` # Save modified container.

## General `docker` commands.

`docker image list`  
`docker container list`

`docker logs -f <container id>`

`docker exec -it <container id> ls -al /usr/src/app`

If you want to run `strace` (if installed in image)..  
`docker run --security-opt seccomp:unconfined -it <image id> /bin/bash` 

## Documentation and developer tools.
`npm run compodoc` # See `package.json` for full command  
`ng test --code-coverage`

`compodoc` documentation generation may initially throw up "watch" errors, if so ...  
`echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && sysctl -p`

---

[1] If you want to use a different port for your environment, e.g. `4201`, then use `-p 4201:4200`.  
    (In that case `iptables` will end up including something like the following:  
    '`-A DOCKER ! -i docker0 -p tcp -m tcp --dport 4201 -j DNAT --to-destination 172.17.0.4:4200`')  
