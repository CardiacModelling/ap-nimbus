.. include:: ../../global.rst

Building Options
================

The following is a list of currently available containers :

ApPredict-related

 #. `appredict-chaste-libs <https://hub.docker.com/r/cardiacmodelling/appredict-chaste-libs>`_  
 #. `appredict-no-emulators <https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators>`_  
 #. `appredict-with-emulators <https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators>`_  

Microservice-related

 #. `ap-nimbus-client-direct <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-client-direct>`_
 #. `ap-nimbus-app-manager <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager>`_
 #. `ap-nimbus-datastore <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-datastore>`_

ApPredict-related Containers
----------------------------

.. _installation_build_local:

It's important to note that even when using 32 processors it can take an hour to
build!

::

   user@host:~> mkdir tmp && cd tmp
   user@host:~/tmp> git clone https://github.com/CardiacModelling/ap-nimbus
   user@host:~/tmp> cd ap-nimbus/appredict-no-emulators
   user@host:~/tmp/ap-nimbus/appredict-no-emulators> 
             Edit the Dockerfile to a new appredict_hash value
   user@host:~/tmp/ap-nimbus/appredict-no-emulators> docker build --build-arg build_processors=<processors> -t appredict-no-emulators:<new version, e.g. mytest1> .
   user@host:~/tmp/ap-nimbus/appredict-no-emulators> cd ../appredict-with-emulators
   user@host:~/tmp/ap-nimbus/appredict-with-emulators>
             Edit the Dockerfile `FROM` clause to appredict-no-emulators:<new version, e.g. mytest1>
   user@host:~/tmp/ap-nimbus/appredict-with-emulators> docker build --build-arg build_processors=<processors> -t appredict-with-emulators:<new version, e.g. mytest1> .

Microservice-related Containers
-------------------------------

TODO
