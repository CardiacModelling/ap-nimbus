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
             :ref:`Running <running>`.

Containers generally, when attempting to run them for the first time, will be installed
locally by being auto-downloaded from `DockerHub <https://hub.docker.com/>`_ and deployed
to the local image collection by the container runtime.

Install |ap-nimbus-app-manager|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

 #. Install on a local filesystem : |br|
    ``docker run -it --rm cardiacmodelling/ap-nimbus-app-manager:<version>`` |br|
    (See `ap-nimbus-app-manager tags <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager/tags>`_
    for available version numbers.) |br| |br|
    This command will automatically download the container from the ``cardiacmodelling``
    `DockerHub <https://hub.docker.com/u/cardiacmodelling>`_ repository
    if it is not already available in the local docker image collection, and by default will
    listen on ``http://0.0.0.0:8080/`` (``Cntl-C`` to exit). |br|
    For further instructions on running, see the section on :ref:`Running <running>`.

 #. Install remotely : |br|
    Depending on the remote container management/orchestration system you're using (e.g.
    kubernetes, docker swarm, docker-compose, |DCOS|), you will need to adapt the
    necessary config file, e.g. `docker-compose <https://github.com/CardiacModelling/ap-nimbus/blob/master/deploy/docker-compose/docker-compose-minimum.yml>`_,
    or specify the |ap-nimbus-app-manager| container and version, and deploy as per your 
    environment's instructions.

Install |appredict-no-emulators| or |appredict-with-emulators|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

 #. Install on a local filesystem : |br|
    ``docker run -it --rm cardiacmodelling/appredict-no-emulators:<version> apps/ApPredict/ApPredict.sh`` |br|
    (See `appredict-no-emulators tags <https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators/tags>`_
    or `appredict-with-emulators tags <https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators/tags>`_
    for available version numbers.) |br| |br|
    This command will automatically download the container from the ``cardiacmodelling``
    `DockerHub <https://hub.docker.com/u/cardiacmodelling>`_ repository
    if it is not already available in the local docker image collection, and by default will
    run |ApPredict| with no args (and therefore display the 'help' information). |br|
    For further instructions on running, see the section on :ref:`Running <running>`.

 #. Install remotely : |br|
    It does not make sense to install these containers remotely as |appredict-no-emulators|
    and |appredict-with-emulators| are not remotely accessible, i.e. they only respond
    to command-line invocation.

Install using an orchestration template
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

 #. Depending on the container management/orchestration system you're using (e.g.
    kubernetes, docker swarm, docker-compose, |DCOS|), you will need to adapt the necessary config
    file(s), e.g. `deploy to kubernetes cluster <https://github.com/CardiacModelling/ap-nimbus/tree/master/deploy/o11n/k8s/cluster>`_,
    or `deploy to docker swarm <https://github.com/CardiacModelling/ap-nimbus/tree/master/deploy/o11n/swarm>`_.
