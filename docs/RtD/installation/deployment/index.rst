.. include:: ../../global.rst

Deployment Options
==================

::

                 +----------------------------+
                 | Do you intend to have only |
                 | a "REST" API to ApPredict? |
                 +----------------------------+
                  |                          |
                 Yes                         No
                  |                          |
    +-------------------------------+  +----------------------+
    | Install ap-nimbus-app-manager |  | Do you intend to run |
    +-------------------------------+  | ApPredict from the   |
                                       | command-line?        |
                                       +----------------------+
                                        |                    |
                                       Yes                   No
                                        |                    |
                  +--------------------------------+  +-----------------------------+
                  | Install appredict-no-emulators |  | Do you intend to run the    |
                  | or appredict-with-emulators    |  | complete microservice       |
                  +--------------------------------+  | environment, e.g.           |
                                                      | client-direct (UI) +        |
                                                      | app-manager(s) + datastore? |
                                                      +-----------------------------+
                                                       |                           |
                                                      Yes                          No
                                                       |                           |
                                 +---------------------------------+      +--------------------+
                                 | Install containers using the    |      | Do you intend to   |
                                 | 'deploy' orchestration template |      | run just a single  |
                                 | as appropriate, e.g. docker     |      | client-direct (UI) |
                                 | swarm, docker compose, k8s      |      | and app-manager? ) |
                                 +---------------------------------+      +--------------------+
                                                                           |                  |
                                                                          Yes                 No
                                                                           |                  |
                                                           +--------------------------+  +----------------+
                                                           | Install containers using |  | Get in touch!? |
                                                           | a reduced 'deploy'       |  +----------------+
                                                           | orchestration template   |
                                                           +--------------------------+
     
Install
-------

.. seealso:: For instructions on how to run containers, see the more detailed section on
             :ref:`running`.

Containers generally, when attempting to run them for the first time, will be installed
locally by being auto-downloaded from `DockerHub <https://hub.docker.com/>`_ and deployed
to the local image collection by the container runtime.

.. _installation-app-manager:

Install |ap-nimbus-app-manager|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

 #. Install on a local filesystem : |br|
    ``docker run -d --name ap-nimbus-ap-manager --hostname ap-nimbus-ap-manager --net ap_nimbus_network --restart always cardiacmodelling/ap-nimbus-app-manager:<version>`` |br|
    (See `ap-nimbus-app-manager tags <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager/tags>`_
    for available version numbers.) |br| |br|
    This command will automatically download the container from the ``cardiacmodelling``
    `DockerHub <https://hub.docker.com/u/cardiacmodelling>`_ repository
    if it is not already available in the local |docker| image collection, and by default will
    listen on ``http://0.0.0.0:8080/`` (``Cntl-C`` to exit). |br|
    For further instructions on running, see the section on :ref:`running-app-manager`.

 #. Install remotely : |br|
    Depending on the remote container management/orchestration system you're using (e.g.
    |kubernetes|, |docker_swarm|, |docker_compose|, |DCOS|), you will need to adapt the
    necessary config file, e.g. `docker-compose <https://github.com/CardiacModelling/ap-nimbus/blob/master/deploy/docker-compose/docker-compose-minimum.yml>`_,
    or specify the |ap-nimbus-app-manager| container and version, and deploy as per your 
    environment's instructions.

.. _installation-appredict:

Install |appredict-no-emulators| or |appredict-with-emulators|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

 #. Install on a local filesystem : |br|
    ``docker run -it --rm cardiacmodelling/appredict-no-emulators:<version> apps/ApPredict/ApPredict.sh`` |br|
    (See `appredict-no-emulators tags <https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators/tags>`_
    or `appredict-with-emulators tags <https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators/tags>`_
    for available version numbers.) |br| |br|
    This command will automatically download the container from the ``cardiacmodelling``
    `DockerHub <https://hub.docker.com/u/cardiacmodelling>`_ repository
    if it is not already available in the local |docker| image collection, and by default will
    run |ApPredict| with no args (and therefore display the 'help' information). |br|
    For further instructions on running, see the section on :ref:`running-appredict`.

 #. Install remotely : |br|
    It does not make sense to install these containers remotely as |appredict-no-emulators|
    and |appredict-with-emulators| are not remotely accessible, i.e. they only respond
    to command-line invocation.

.. _installation-client-direct:

Install |ap-nimbus-client-direct|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

     In order for the client-direct to work you at least need:
     * the app-manager  (see above)
     * the client direct
     * a postgres database
     
 #. Communication: networking
     These components need to be able to communicate. There are two main ways of achieving this: you can refer to components by their docker IP address. To find this it needs to be started first, so you will have to start the database and app-manager first and find ther IPs to use in the client-direct configuration.
     An easier way is to create a docker network and add the database, app-manager and client-direct components to it and give each component a name **please note** DO NOT use underscores in these names as underscores in hostnames is not universally supported. You can then use that name as hostname in the client-direct settings.

     to create a docker network called ap_nimbus_network the command is as follows: `docker network create ap_nimbus_network`
     
 #. Data persistence
     By default data does not persist. This means that if you restart the client-direct any uploaded files (cellml models and PK data files) will be gone and if you restart the database all data will be gone, i.e. all accounts, simulations, cellml models etc. Data volumes can be used to make sure data persists
     
     the following command creates a docker data volume called ap_nimbus_data `docker volume create ap_nimbus_data`
     the following command creates a docker data volume called ap_nimbus_file_upload `docker volume create ap_nimbus_file_upload`
     
     the following command lists information about the ap_nimbus_file_upload volume, including the mount point (the actual location where the data is stored). This mountpoint can be backed up if desired. `docker volume inspect ap_nimbus_file_upload`

 #. Database
     The following starts a postgres 14.1 database using the official debian-bullsey postgres docker image.
     ``docker run -d --name ap-nimbus-postgres --net ap_nimbus_network --restart always --user postgres -v ap_nimbus_data:/var/lib/postgresql/data --env-file env postgres:14.1-bullseye``
     The parameters are as follows:
     * -d detached mode. You could start with -it if you want to see output. However don't forget to leave the component running (detach rather than close).
     * --name ap-nimbus-postgres this is the name given to the component, it can be seen when doing `docker ps` and is the hostname we use in settings for client-direct
     * --net ap_nimbus_network make sure the component is part of our docker network
     * --restart always should the component stop for whatever reason we want it to try and restart
     * -v ap_nimbus_data:/var/lib/postgresql/data link the data volume created above to the path inside the container where the database data is stored
     * --env-file env use the environment variable in env **please note** a template env file is provided in the repository
     
 #. App manager
     to start the app manager with additional name and network parameters locally:
     ``docker run -d --name ap-nimbus-ap-manager --hostname ap-nimbus-ap-manager --net ap_nimbus_network --restart always cardiacmodelling/ap-nimbus-app-manager:<version>``
     If this is run on cardiac.nottingham.ac.uk, we need to make that hostname available, otherwise it wpould resolve incorrectly so add `--add-host=cardiac.nottingham.ac.uk=cardiac.nottingham.ac.uk:128.243.44.16`
     
 #. client-direct
     ``docker run -d --name ap-nimbus-client --net ap_nimbus_network --restart always -v ap_nimbus_file_upload:/opt/django/media -p 4240:80 --env-file env cardiacmodelling/ap-nimbus-client-direct:<version>``   
    (See `ap-nimbus-client-direct tags <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-client-direct/tags>`_
    for available version numbers.) |br| |br|
    This command will automatically download the container from the ``cardiacmodelling``
    `DockerHub <https://hub.docker.com/u/cardiacmodelling>`_ repository
    if it is not already available in the local |docker| image collection, and by default will
    listen on ``http://0.0.0.0:4200/`` and expect to call |ap-nimbus-app-manager| on
    ``http://127.0.0.1:8080``. |br|
    (``Cntl-C`` to exit). |br|
    For further instructions on running, see the section on :ref:`running-client-direct`.

.. _install-orchestration:

Install using an orchestration template
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

 #. Depending on the container management/orchestration system you're using (e.g.
    |kubernetes|, |docker_swarm|, |docker_compose|, |DCOS|), you will need to adapt the necessary config
    file(s), e.g. `deploy to Kubernetes cluster <https://github.com/CardiacModelling/ap-nimbus/tree/master/deploy/o11n/k8s/cluster>`_,
    or `deploy to Docker Swarm <https://github.com/CardiacModelling/ap-nimbus/tree/master/deploy/o11n/swarm>`_.
    **Please note:** kubernetis or docker swarm orchestration has not been updated to or tested with the latest client-direct.
