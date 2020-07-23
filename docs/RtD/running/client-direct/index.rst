.. include:: ../../global.rst

.. _running-client-direct:

Running |ap-nimbus-client-direct|
=================================

.. seealso:: Offical ``docker run`` `documentation <https://docs.docker.com/engine/reference/commandline/run/>`_.

To run |ap-nimbus-client-direct| from |CLI| do :

::

  docker run -it --rm -p 4200:4200 cardiacmodelling/ap-nimbus-client-direct:<version>

In Docker parlance, the ``-p`` will "publish" or "expose" the container port 4200 to port
4200 on the host machine by means of fiddling with the firewall (see
:ref:`developer-container-client-direct` for a bit more information).

