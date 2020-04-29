# Action Potential prediction -- Intermediary datastore.

This is the code for running the `AP-Nimbus` `datastore` REST API front-end to a database.  
It's used to (very nearly <sup>1</sup>) avoid direct `client-direct` <==> `app-manager`
communication. The idea being that it allows each component to scale independently of the others.

This code is influenced/derived from the following sources (amongst others, no doubt) :

 1. [Build a CRUD API with MongoDB, Express, and Docker](https://hackernoon.com/build-a-crud-api-with-mongodb-express-and-docker-70510c6f706b)
 1. [CRUD API built with MongoDB and Express](https://github.com/torchhound/mongo-crud)

`datastore` is a [node.js](https://nodejs.org/) (v10.12.0) front-end to a separate
[MongoDB](https://www.mongodb.com/) persistence layer. See `docker/Dockerfile`.

## Prerequisites.

This component will only run containerised.

 1. A separate MongoDB database image.
 1. `docker` or similar e.g. `Podman`/`CRI-O`.

## User Documentation.

 1. ---

## Initial configuration.

 1. Copy `example.env` to `.env` if building locally.  
    By default though it listens on `8118` and expects the database to be listening on
    `<db container name, e.g. database, swarm_database, etc>:27017`.

## Technical Documentation.

 1. --

## TODO.

 1. --

## Useful commands.

### Building (and tagging) image.

 1. `cd <datastore dir>`
 1. `cp example.env .env`
 1. `docker-compose -f docker/docker-compose.yml build`

### Tagging + pushing image (to private, insecure repo).

 1. `docker tag datastore:latest 127.0.0.1:5000/datastore:0.0.x`
 1. `docker push 127.0.0.1:5000/datastore:0.0.x`

### Starting (containerised).

To run containerised please see `deploy` instructions.

---

[1] The only communication between `client-direct` and `app-manager` is when `client-direct` sends
    an instruction to `app-manager` to run a simulation, and `app-manager` responds with an
    identifier. Thereafter all communication is via data being sent to and retrieved from
    the `datastore` using the identifier.
