.. include:: ../../global.rst

.. _running-client-direct:

Running |ap-nimbus-client-direct|
=================================

.. seealso:: Offical ``docker run`` `documentation <https://docs.docker.com/engine/reference/commandline/run/>`_.

.. note:: |client-direct| requires a number of configuration property values / `Environment Variables`_ to be assigned
          (e.g. for database connectivity) before it will start. |br| |br|
          See later `Prerequisites`_ section for a more detailed running explanation.

::

  docker run -d --name ap-nimbus-client --net ap_nimbus_network --restart always -v ap_nimbus_file_upload:/opt/django/media -p 4240:80 --env-file env cardiacmodelling/ap-nimbus-client-direct:<version>

Where:

  #. ``ap_nimbus_network`` is a docker network.
  #. ``ap_nimbus_file_upload`` is a docker volume.
  #. :file:`env` A file, e.g. `docker/env <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus-client/master/docker/env>`_, containing
     `Environment Variables`_ (which could also be passed as command line switches).
  #. ``<version>`` is a valid dockerhub tag (as available at https://hub.docker.com/r/cardiacmodelling/ap-nimbus-client-direct).

.. note:: If you want to run |ap-nimbus-client-direct| in "developer" mode (e.g. using `client/config/develop_settings.py <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus-client/master/client/config/develop_settings.py>`_)
          then add the ``-d DJANGO_SETTINGS_MODULE=config.develop_settings`` to the ``docker run`` command.

In Docker parlance, the ``-p 4240:80`` will "publish" or "expose" the container port 80 to port
4240 on the host machine by means of fiddling with the firewall (see
:ref:`developer-container-client-direct` for a bit more information).

.. _running-client-direct-envvars:

Environment Variables
---------------------

The environment variables used by the docker components for |AP-Nimbus| are listed below. They are listed as ``VAR=VALUE`` pairs (without any spaces).

.. note:: A template environment var file is provided in the repository, e.g. `docker/env <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus-client/master/docker/env>`_.

::

  DJANGO_SECRET_KEY=

.. pull-quote::

  Please pick a secret key. A long random string is ideal.

::

  DJANGO_SUPERUSER_EMAIL=
  DJANGO_SUPERUSER_FULLNAME=
  DJANGO_SUPERUSER_PASSWORD=
  DJANGO_SUPERUSER_INSTITUTION=

.. pull-quote::

  Please assign the email, full name, password and institution of the user who will be the Django 
  superuser on application initialisation. |br|
  After initialisation, if you wish to change the identity of the Django superuser, you have the
  choice to either : |br|
  1. Create a new user (i.e. someone whose email does not already exist in the application), by
  specifying a completely new email, full name, password and institution in the above env vars,
  or, |br|
  2. Use the identity of an existing user (identified by email, case sensitive), who will have
  their existing full name, password and institution overwritten with the values specified in the
  above env vars. |br|
  (In both cases, you will need to restart |ap-nimbus-client-direct| for the changes to become effective.)

.. warning:: On system restart, a Django superuser will exist as defined by whatever data is
             specified in the ``SUPERUSER`` environment vars. See `create_admin.py <https://github.com/CardiacModelling/ap-nimbus-client/blob/master/client/accounts/management/commands/create_admin.py>`_,
             which gets run on each restart. |br|
             If the Django superuser (as defined by ``DJANGO_SUPERUSER_EMAIL``) needs to update
             their email address, they must do so first via the |UI| "Account" option, and then
             via a corresponding update to ``DJANGO_SUPERUSER_EMAIL`` (any other details to update
             must be done through ``SUPERUSER`` environment vars **ONLY**), and then restart
             |ap-nimbus-client-direct|.

::

  subfolder=

.. pull-quote::

  This is intended for situations where the client is running behind a proxy, e.g. Apache, and a URL 
  path is used to direct proxying requests, e.g. the ``ActionPotentialPortal`` in https://cardiac.nottingham.ac.uk/ActionPotentialPortal. |br|
  This variable will ensure the urls used will correctly contain the relevant path.

::

  ALLOWED_HOSTS=

.. pull-quote::

  Allowed hosts Django should be allowed to serve web pages for (comma separated). |br|
  In production this should probably be set to the public facing hostname of your webpage to prevent security issues such as web cache poisoning. |br|
  If left empty any host will be allowed (``'*'``)

::

  smtp_server=

.. pull-quote::
  
  Set the |SMTP| server used to send emails from.

::

  django_email_from_addr=

.. pull-quote::

  This email address is used as the ``From:`` address in any emails sent by the client.

::

  #PYTHONUNBUFFERED=1
  POSTGRES_PASSWORD=
  PGPASSWORD=
  PGDATABASE=django_ap_nimbus_client
  PGPORT=5432
  PGHOST=ap-nimbus-postgres
  PGUSER=postgres

.. pull-quote::

  Database variables. |br|
  Values above assume you are running a postgres container with name ``ap-nimbus-postgres`` in the docker network. |br|
  ``PGPASSWORD`` is used by Django whereas ``POSTGRES_PASSWORD`` is used by the Postgres database, so these should have the same value.

::

  AP_PREDICT_ENDPOINT=http://ap-nimbus-app-manager:8080

.. pull-quote::

  Location of the AP predict endpoint. |br|
  Value above assumes you are running an app-manager container with the name ``ap-nimbus-app-manager``
  in the docker network, but it could be set to be elsewhere.

::

  HOSTING_INFO=

.. pull-quote::
  
  Supply a brief sentence about where this instance is hosted.

::

  PRIVACY_NOTICE=""

.. pull-quote::

  A brief statement that will be shown at the start of the privacy notice

::

  CONTACT_MAILTO=mailto:

.. pull-quote::

  Mailto link for contacting maintiners

::

  CONTACT_TEXT=""

.. pull-quote::

  Contact text for contacting maintiners

::

  AP_PREDICT_STATUS_TIMEOUT=1000

.. pull-quote::

  Status timeout (in ms). After this time the portal assumes something has gone wrong and stops trying to get a status update.


.. _running-client-direct-prerequisites:

Prerequisites
-------------

In order for the |ap-nimbus-client-direct| to call |app-manager| and display simulation results you at least need:

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

    The following starts a postgres 14.1 database using the official debian-bullseye postgres docker image.

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
      Link the docker volume ``ap_nimbus_data`` to the path inside the container where the database data is stored.

    ``--env-file env`` |br|
      Use the `Environment Variables`_ in the :file:`env` file.
