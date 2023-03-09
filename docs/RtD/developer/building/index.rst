.. include:: ../../global.rst

Building Options
================

.. seealso:: `docker build <https://docs.docker.com/engine/reference/commandline/build/>`_
             reference documentation |br|
             (Probably a safer choice for information!)

ApPredict-related Containers
----------------------------

This section refers to :

 #. `appredict-chaste-libs <https://hub.docker.com/r/cardiacmodelling/appredict-chaste-libs>`_  
 #. `appredict-no-emulators <https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators>`_  
 #. `appredict-with-emulators <https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators>`_  

.. _installation_build_local:

.. warning:: It's important to note that even when using 32 processors it can
             take an hour to build! |br|
             Equally, building appredict-with-emulators uses a lot of RAM as
             |ApPredict| loads files >1Gb into RAM. So better not to use all
             available processors for this step.

::

   user@host:~> mkdir tmp && cd tmp
   user@host:~/tmp> git clone --recursive https://github.com/CardiacModelling/ap-nimbus
   user@host:~/tmp> cd ap-nimbus/appredict-docker/appredict-no-emulators
   user@host:~/tmp/ap-nimbus/appredict-docker/appredict-no-emulators> 

             Edit the Dockerfile to a new appredict_hash (and branch) value

   user@host:~/tmp/ap-nimbus/appredict-docker/appredict-no-emulators> docker build --build-arg build_processors=<processors> -t appredict-no-emulators:<new version, e.g. mytest1> .
   user@host:~/tmp/ap-nimbus/appredict-docker/appredict-no-emulators> docker run -it --rm appredict-no-emulators:<new version, e.g. mytest1>

   bash-4.4$ cd build/ApPredict
   bash-4.4$ git status
             
             Verify the ApPredict hash value is as earlier specified

   bash-4.4$ git branch
   bash-4.4$ exit

   user@host:~/tmp/ap-nimbus/appredict-docker/appredict-no-emulators> cd ../appredict-with-emulators
   user@host:~/tmp/ap-nimbus/appredict-docker/appredict-with-emulators>

             Edit the Dockerfile `FROM` clause to appredict-no-emulators:<new version, e.g. mytest1>

   user@host:~/tmp/ap-nimbus/appredict-docker/appredict-with-emulators> docker build --build-arg build_processors=<processors> -t appredict-with-emulators:<new version, e.g. mytest1> .

Why not use `Chaste/chaste-docker <https://github.com/Chaste/chaste-docker>`_?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

It would be possible to use the "offical" Chaste-endorsed dependency container as a
base image to build |appredict-no-emulators|, etc., on -- and up to around 2021 we'd been
using an `Alpine Linux <https://alpinelinux.org/>`_ distribution base. Now, however, we're
using the preferred Debian container to enable easy install of dependency packages.
