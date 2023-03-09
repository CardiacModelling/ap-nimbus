.. include:: ../../global.rst

.. _running-client-direct:

Running |ap-nimbus-client-direct|
=================================

.. seealso:: Offical ``docker run`` `documentation <https://docs.docker.com/engine/reference/commandline/run/>`_.

.. warning:: |client-direct| requires a number of configuration property values / `Environment Variables`_ to be assigned
             (e.g. for database connectivity) before it will start. |br| |br|
             See `Prerequisites`_ for a more detailed running explanation.

::

  docker run -d --name ap-nimbus-client --net ap_nimbus_network --restart always -v ap_nimbus_file_upload:/opt/django/media -p 4240:80 --env-file env cardiacmodelling/ap-nimbus-client-direct:<version>

Where:

  #. ``ap_nimbus_network`` is a docker network.
  #. ``ap_nimbus_file_upload`` is a docker volume.
  #. :file:`env` A file, e.g. `docker/env <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus-client/master/docker/env>`_, containing
     `Environment Variables`_ (which could also be passed as command line switches).
  #. ``<version>`` is a valid dockerhub tag (as available at https://hub.docker.com/r/cardiacmodelling/ap-nimbus-client-direct).

Environment Variables
---------------------

The environment variables used by the docker components for AP Nimbus are listed below. They are listed as ``VAR=VALUE`` pairs (without any spaces).

``DJANGO_SECRET_KEY=``

  Please pick a secret key. A long random string is ideal.

``DJANGO_SUPERUSER_EMAIL=``

  Please replace the email by the address of your first superuser, which will be able to long into django in an "admin" capacity.

``DJANGO_SUPERUSER_PASSWORD=``

  Please pick a secure password for the superuser.

``subfolder=``

  This is intended for situations where the client is running behind a proxy and a subfolder is forwarded to it. |br|
  This variable will ensure the urls used will correctly contain the relevant subfolder.

``ALLOWED_HOSTS=``

  Allowed hosts django should be allowed to serve web pages for (comma separated). |br|
  In production this should probably be set to the public facing hostnae of your webpage to prevent security issues wuch as web cache poisoning. |br|
  If left empty any host will be allowed (``'*'``)

``smtp_server=``
  
  Set the |SMTP| server used to send emails from.

``django_email_from_addr=``

  This email address is used as the ``From:`` address in any emails sent by the client.

``DJANGO_PORT=8000``

  Port to run django on.

``#PYTHONUNBUFFERED=1`` |br|
``PGPASSWORD=`` |br|
``PGDATABASE=django_ap_nimbus_client`` |br|
``PGPORT=5432`` |br|
``PGHOST=ap-nimbus-postgres`` |br|
``PGUSER=postgres``

  Database variables. Values above assume you are running a postgres container with name ``ap_nimbus_postgres`` in the docker network.

``AP_PREDICT_ENDPOINT=http://ap-nimbus-network:8080``

  Location of the AP predict endpoint (usually in your docker network, but could be set to be elsewhere).

``HOSTING_INFO=""``
  
  Supply a brief sentence about where this instance is hosted.

In Docker parlance, the ``-p`` will "publish" or "expose" the container port 4200 to port
4200 on the host machine by means of fiddling with the firewall (see
:ref:`developer-container-client-direct` for a bit more information).

.. _running-client-direct-prerequisites:

Prerequisites
-------------

In order for the |ap-nimbus-client-direct| to perform and display simulations you at least need:

 #. The |app-manager| (See :ref:`running-app-manager`).
 #. Communication: networking

    |app-manager| and |client-direct| need to be able to communicate with each other. There are two main ways of achieving this:

    #. You can refer to components by their docker IP address. |br|
       To find this it needs to be started first, so you will have to start the database and |app-manager| first and find
       their IPs to use in the |client-direct| configuration.
    #. An easier way is to create a docker network (e.g. ``docker network create ap_nimbus_network``) and add the database,
       |app-manager| and |client-direct| components to it and give each component a name. |br|

 #. Data persistence

    **Important**: By default data does :underline:`NOT` persist. |br|
    This means that if you restart the |client-direct| any uploaded files (cellml models and PK data files) will be gone and if
    you restart the database all data will be gone, i.e. all accounts, simulations, cellml models etc. Data volumes can be used
    to make sure data persists.

    The following commands create and "inspect" a docker data volume called ``ap_nimbus_data``:

    ``docker volume create ap_nimbus_data`` |br|
    ``docker volume inspect ap_nimbus_data``

    ``inspect`` reveals information including the mount point (the actual location where the data is stored). This mountpoint
    can be backed up if desired.

 #. Database

    The following starts a postgres 14.1 database using the official debian-bullsey postgres docker image.

    ``docker run -d --name ap-nimbus-postgres --net ap_nimbus_network --restart always --user postgres -v ap_nimbus_data:/var/lib/postgresql/data --env-file env postgres:14.1-bullseye``

    :underline:`Parameters`

    ``-d detached mode`` |br|
      You could start with ``-it`` if you want to see output. However don't forget to leave the component running (detach rather than close).

    ``--name ap-nimbus-postgres`` |br|
      This is the name given to the component, it can be seen when doing ``docker ps`` and is the hostname we use in settings for |client-direct|.

    ``--net ap_nimbus_network`` |br|
      Make sure the component is part of our docker network.

    ``--restart always`` |br|
      Should the component stop for whatever reason we want it to try and restart.

    ``-v ap_nimbus_data:/var/lib/postgresql/data`` |br|
      Link the data volume created above to the path inside the container where the database data is stored.

    ``--env-file env`` |br|
      Use the environment variable in :file:`env` |br|
      **Note:** A template environment var file is provided in the repository, e.g. `docker/env <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus-client/master/docker/env>`_.
