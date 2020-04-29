# Docker "swarm" orchestration.

## Note.

Little difference to `../../docker-compose/docker-compose-all.yml`, except in naming of swarm
`services`.

## Start/Stop

__May only start to work on second attempt at starting!__

`docker stack deploy --compose-file docker-compose-swarm.yml swarm`

`docker stack rm swarm`

View at http://172.17.0.1:4200/ (Note: 172.17.0.1 is my `docker0` interface!).

## Other commands.

`docker swarm init`

`docker swarm leave --force`

`docker service inspect --format '{{json .Endpoint.VirtualIPs}}' swarm_appmanager | jq '.'`

`docker service ps --format 'table {{.ID}}\t{{.Name}}\t{{.Node}}\t{{.CurrentState}}' swarm_appmanager`

`docker service list`

`docker service logs -f <service id>`