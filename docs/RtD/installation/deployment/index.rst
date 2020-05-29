.. include:: ../../global.rst

Deployment/Running Options
==========================

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

The following will auto-download and run dockerhub's cardiacmodelling/appredict-with-emulators:<version>.

If you wish to run a :ref:`locally built container <installation_build_local>`, then
substitute the image name:version combination you specified during the 
``docker build ...``, e.g. "appredict-with-emulators:<new version, e.g. mytest1>".

::

   user@host:~/tmp> mkdir testoutput
   user@host:~/tmp> docker run --rm \
                               -u `id -u`:`id -g` \
                               -v `pwd`/testoutput:/home/appredict/apps/ApPredict/testoutput:Z \
                               -w /home/appredict/apps/ApPredict/ \
                               cardiacmodelling/appredict-with-emulators:<version> /home/appredict/apps/ApPredict/ApPredict.sh --model 1 --plasma-conc-high 100

Microservice-related Containers
-------------------------------

See https://github.com/CardiacModelling/ap-nimbus/tree/master/deploy