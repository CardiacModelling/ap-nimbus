.. include:: ../../global.rst

.. _running-client-direct:

Running |ap-nimbus-client-direct|
=================================

.. seealso:: Offical ``docker run`` `documentation <https://docs.docker.com/engine/reference/commandline/run/>`_.

::

  docker run -d --name ap-nimbus-client --net ap_nimbus_network --restart always -v ap_nimbus_file_upload:/opt/django/media -p 4240:80 --env-file env cardiacmodelling/ap-nimbus-client-direct:<version>

Where ap_nimbus_network is a docker network created,  ap_nimbus_file_upload a created docker volume and env e file with environment variables.
See :ref:`installation-client-direct`.


In Docker parlance, the ``-p`` will "publish" or "expose" the container port 4200 to port
4200 on the host machine by means of fiddling with the firewall (see
:ref:`developer-container-client-direct` for a bit more information).

