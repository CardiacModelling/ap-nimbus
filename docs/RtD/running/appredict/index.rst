.. include:: ../../global.rst

.. _running-appredict:

Running |appredict-no-emulators| or |appredict-with-emulators|
==============================================================

::

   user@host:~/tmp> mkdir testoutput
   user@host:~/tmp> docker run --rm \
                               -u `id -u`:`id -g` \
                               -v `pwd`/testoutput:/home/appredict/apps/ApPredict/testoutput:Z \
                               -w /home/appredict/apps/ApPredict/ \
                               cardiacmodelling/appredict-with-emulators:<version> /home/appredict/apps/ApPredict/ApPredict.sh --model 1 --plasma-conc-high 100
