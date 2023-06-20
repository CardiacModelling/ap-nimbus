.. include:: ../../global.rst

Building Options
================

.. seealso:: `docker build <https://docs.docker.com/engine/reference/commandline/build/>`_
             reference documentation |br|
             (Probably a safer choice for information!)

.. _installation-build-local:

ApPredict-related Containers
----------------------------

This section refers to :

 #. `appredict-no-emulators <https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators>`_  
 #. `appredict-with-emulators <https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators>`_  

.. warning:: It's important to note that even when using 32 processors it can
             30+ mins to build! |br|
             Equally, building appredict-with-emulators uses a lot of RAM as
             |ApPredict| loads files >1Gb into RAM. So better not to use all
             available processors for this step.

.. note:: Within the :file:`Dockerfile`\s we have not enforced version-controlling of images or
          dependencies (e.g. by specifying the base image tag with hash, or by using specific
          versions of software, e.g. libhdf5-dev version *X*), as the built container represents
          a unique snapshot in time. See `No version-controlling in appredict-chaste-libs Dockerfile <https://github.com/CardiacModelling/appredict-docker/issues/4>`_.

.. note:: These instructions cover the case for building and testing |ApPredict| containers
          locally, rather than for uploading to DockerHub.

::

   user@host:~> mkdir tmp && cd tmp
   user@host:~/tmp> git clone https://github.com/CardiacModelling/appredict-docker
   user@host:~/tmp> cd appredict-docker/appredict-no-emulators
   user@host:~/tmp/appredict-docker/appredict-no-emulators> 

             Edit the Dockerfile to a new appredict tag value

   user@host:~/tmp/appredict-docker/appredict-no-emulators> docker build --build-arg build_processors=<processors> -t appredict-no-emulators:<new version, e.g. mytest1> .
   user@host:~/tmp/appredict-docker/appredict-no-emulators> docker run -it --rm appredict-no-emulators:<new version, e.g. mytest1>

             Verify below the ApPredict commit value against the commit hashes at https://github.com/Chaste/ApPredict/tags

   bash-4.4$ apps/ApPredict/ApPredict 2> /dev/null | grep 'ApPredict is based on commit'
   bash-4.4$ exit

   user@host:~/tmp/appredict-docker/appredict-no-emulators> cd ../appredict-with-emulators
   user@host:~/tmp/appredict-docker/appredict-with-emulators>

             Edit the Dockerfile `FROM` clause to appredict-no-emulators:<new version, e.g. mytest1>

   user@host:~/tmp/appredict-docker/appredict-with-emulators> docker build --build-arg build_processors=<processors> -t appredict-with-emulators:<new version, e.g. mytest1> .

|ap-nimbus-client-direct| Container
-----------------------------------

This section refers to :

 #. `ap-nimbus-client-direct <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-client-direct>`_  

Perhaps the most important thing to keep in mind when building a local container is to **temporarily**
modify the :file:`docker/Dockerfile` to copy the content of the local dir (which you've probably
just modified a bit for this change), e.g.

::

   user@host:~> mkdir tmp && cd tmp
   user@host:~/tmp> git clone https://github.com/CardiacModelling/ap-nimbus-client
   user@host:~/tmp> cd ap-nimbus-client
   user@host:~/tmp/ap-nimbus-client> 

             Edit the docker/Dockerfile to copy the local content
             e.g. #RUN git clone --recursive --branch master --depth 1 https://github.com/CardiacModelling/ap-nimbus-client.git
                  COPY / /opt/django/ap-nimbus-client

   user@host:~/tmp/ap-nimbus-client> docker build -f docker/Dockerfile -t ap-nimbus-client-direct:<new version, e.g. mytest1> .

Why not use `Chaste/chaste-docker <https://github.com/Chaste/chaste-docker>`_?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

It would be possible to use the "offical" Chaste-endorsed dependency container as a
base image to build |appredict-no-emulators|, etc., on -- and up to around 2021 we'd been
using an `Alpine Linux <https://alpinelinux.org/>`_ distribution base. Now, however, we're
using the preferred Debian container to enable easy install of dependency packages.
