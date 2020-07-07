.. include:: ../../global.rst

.. _running-app-manager:

Running |ap-nimbus-app-manager|
===============================

.. seealso:: Offical ``docker run`` `documentation <https://docs.docker.com/engine/reference/commandline/run/>`_.

To run |ap-nimbus-app-manager| from |CLI| do :

``docker run -it --rm -p 8080:8080 cardiacmodelling/ap-nimbus-app-manager:<version>``

In Docker parlance, the ``-p`` will "publish" or "expose" the container port 8080 to port
8080 on the host machine by means of fiddling with the firewall (see 
:ref:`developer-container-app-manager` for a bit more information).
