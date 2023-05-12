.. include:: ../../global.rst

.. _troubleshooting-client-direct:

|client-direct|
===============

The |client-direct| architecture (Nginx, uWSGI, Django), is illustrated in :ref:`activity_client_direct_architecture`.

First check the |client-direct| docker container is at least running, and check if there are any
issues appearing in its docker logs as explained in :ref:`troubleshooting-containers`. If the
container has started but Nginx has not (and perhaps you're seeing a "Proxy Error" message), then try :

::

   docker exec -it $(docker inspect --format="{{.Id}}" <container name>) /bin/bash
   appredict@fb5fe70b3b9d:/opt/django/ap-nimbus-client/client$ nginx -t
   # Ignore any Permission denied stuff!

Thereafter, |client-direct| is configured to generate the following log output.

.. list-table:: Log files
   :widths: 10 30 30 30 
   :align: center
   :header-rows: 1

   * - Component
     - Config file
     - (Default) Log file
     - Notes
   * - Django
     - ``client/config/production_settings.py``
     - ``/opt/django/media/django.log``
     - Optional env vars |br| ``LOGGING_FILE_DJANGO``, ``LOGGING_LEVEL_DJANGO``
   * - Nginx
     - ``docker/client_nginx.conf``
     - ``/opt/django/media/nginx_{access|error}.log``
     - Hardcoded
   * - uWSGI
     - ``docker/client_uwsgi.ini``
     - ``/opt/django/media/uwsgi.log``
     - Hardcoded

The Nginx and uWSGI logs are therefore determined at container build time, whereas the Django logs
can be changed at container run time.

.. Note:: If you ``docker run`` |client-direct| with the ``-v ap_nimbus_file_upload:/opt/django/media``
          arg, then the log files will appear in the (perhaps ``root``-owned!) directory
          pointed to by the ``Mountpoint`` of ``docker volume inspect ap_nimbus_file_upload``.
