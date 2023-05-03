.. include:: ../../global.rst

Backup
======

The |client-direct| component stores user log-ins and stores simulations users have run, CellML files and |PKPD| data files users
have uploaded. In order to make sure that this data is not lost if the docker component needs to be restarted, make sure you
use docker volumes for both the database used (if it's running as a docker component) and the |client-direct|. See :ref:`installation-client-direct`.

It is generally also a good idea to back-up this data in order to be able to recover from any issues with the host system, or
that cannot be solved with a simple restart of the docker component. |br|
In terms of backing up, we suggest using docker to dump the database to a file, and to compress the local path the data volumes
refer to a file as well, both on a regular schedule. In order to find out where the data is stores use the command
``docker inspect ap_nimbus_data`` where ``ap_nimbus_data`` is the name of the data volume and look for the path specified as
`Mountpoint`.

An example of a backup set-up can be found at https://github.com/CardiacModelling/ap-nimbus-client/tree/master/backup, but this
should be adjusted for your specific system.
