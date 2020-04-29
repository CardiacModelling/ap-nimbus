# Docker compose.

## Prerequisites

 1. `docker-compose` - Usually package-installable.  
    See [docker-compose versioning](https://docs.docker.com/compose/compose-file/compose-versioning/)
    for information on which `.yml` config "`version:`" is appropriate.

## Start/Stop

`docker-compose -f docker-compose-minimum.yml {up|down}`

`docker-compose -f docker-compose-all.yml {up|down}`

`<Cntl-C>`

View http://127.0.0.1:4200/ (although see problems below!).

## Problems

Please keep in mind that the browser needs to be refreshed each time a new `docker-compose` is run
so that the browser is using the right version of client-direct.

The `client-direct` `REST_API_URL_APPMGR` and `REST_API_URL_DATA` environment variables is some
situations work with `127.0.0.1` but in others it may be a machine's assigned (e.g. non-localhost)
ip address, e.g. `192.168.1.4`. Not sure why yet - probably iptables!