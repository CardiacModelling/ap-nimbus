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

.. warning:: It's important to note that even when using 32 processors it can
             take an hour to build! |br|
             Equally, building appredict-with-emulators uses a lot of RAM as
             |ApPredict| loads files >1Gb into RAM. So better not to use all
             available processors for this step.

::

   user@host:~> mkdir tmp && cd tmp
   user@host:~/tmp> git clone https://github.com/CardiacModelling/ap-nimbus
   user@host:~/tmp> cd ap-nimbus/appredict-no-emulators
   user@host:~/tmp/ap-nimbus/appredict-no-emulators> 

             Edit the Dockerfile to a new appredict_hash (and branch) value

   user@host:~/tmp/ap-nimbus/appredict-no-emulators> docker build --build-arg build_processors=<processors> -t appredict-no-emulators:<new version, e.g. mytest1> .
   user@host:~/tmp/ap-nimbus/appredict-no-emulators> docker run -it --rm appredict-no-emulators:<new version, e.g. mytest1>

   bash-4.4$ cd build/ApPredict
   bash-4.4$ git status
             
             Verify the ApPredict hash value is as earlier specified

   bash-4.4$ git branch
   bash-4.4$ exit

   user@host:~/tmp/ap-nimbus/appredict-no-emulators> cd ../appredict-with-emulators
   user@host:~/tmp/ap-nimbus/appredict-with-emulators>

             Edit the Dockerfile `FROM` clause to appredict-no-emulators:<new version, e.g. mytest1>

   user@host:~/tmp/ap-nimbus/appredict-with-emulators> docker build --build-arg build_processors=<processors> -t appredict-with-emulators:<new version, e.g. mytest1> .

Microservice-related Containers
-------------------------------

TODO
