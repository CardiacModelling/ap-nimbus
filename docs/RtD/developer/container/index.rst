.. include:: ../../global.rst

Running Containerised
=======================

.. _developer-container-app-manager:

|ap-nimbus-app-manager|
-----------------------

If you start |ap-nimbus-app-manager| using the conventional ``docker run`` command, e.g.

:: 

   docker run -d --name ap-nimbus-app-manager --hostname ap-nimbus-app-manager --net ap_nimbus_network --restart always cardiacmodelling/ap-nimbus-app-manager:<version>

the instruction is to "publish" or "expose" the container ports (see 
`Publish or expose port (-p, --expose) <https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose>`_
for more information). |br|
What this does on an ``iptables``-based system is adjust the firewall such as :

::

  user@host:~> iptables -L -n --line-numbers -t nat

  :

  Chain POSTROUTING (policy ACCEPT)
  num  target     prot opt source               destination         
  1    MASQUERADE  all  --  10.254.93.0/24       0.0.0.0/0           
  2    POSTROUTING_direct  all  --  0.0.0.0/0            0.0.0.0/0           
  3    POSTROUTING_ZONES  all  --  0.0.0.0/0            0.0.0.0/0           
  4    MASQUERADE  tcp  --  10.254.93.2          10.254.93.2          tcp dpt:8080

  Chain DOCKER (2 references)
  num  target     prot opt source               destination         
  1    RETURN     all  --  0.0.0.0/0            0.0.0.0/0           
  2    DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:8080 to:10.254.93.2:8080

  :


Developing in container
^^^^^^^^^^^^^^^^^^^^^^^

If you start a container as follows:

::

   docker run -it --name ap-nimbus-app-manager --hostname ap-nimbus-app-manager --net ap_nimbus_network --restart always cardiacmodelling/ap-nimbus-app-manager:<version> bash

You will get a command bash shell inside the container. You can make changes and manually start the |app-manager| by running ``/home/appredict/apps/app-manager/kickoff.sh``. |br|
In order to try out changes, you can stop the |app-manager| by stopping :file:`kick_off.sh` and killing :file:`convert.sh` and manually restart it after changes have been applied. |br|

.. note:: If you quite the container it will stop and it will loose changes made. Instead of exiting the container you can detach
          with ``CTRL+P+Q`` and re-attach with ``docker attach <ap-nimbus-app-manager container name>``.

.. _developer-container-client-direct:

|ap-nimbus-client-direct|
-------------------------

If you start |ap-nimbus-client-direct| using the conventional ``docker run`` command, e.g.

::

   docker run -d --name ap-nimbus-client --net ap_nimbus_network --restart always -v ap_nimbus_file_upload:/opt/django/media -p 4240:80 --env-file env cardiacmodelling/ap-nimbus-client-direct:<version>

The instruction is to "publish" or "expose" the container ports (see `Publish or expose port (-p, --expose) <https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose>`_
for more information). |br|
What this does on an ``iptables``-based system is adjust the firewall such as :

::

  user@host:~> iptables -L -n --line-numbers -t nat

  :

  Chain POSTROUTING (policy ACCEPT)
  num  target     prot opt source               destination         
  1    MASQUERADE  all  --  10.254.93.0/24       0.0.0.0/0           
  2    POSTROUTING_direct  all  --  0.0.0.0/0            0.0.0.0/0           
  3    POSTROUTING_ZONES  all  --  0.0.0.0/0            0.0.0.0/0           
  4    MASQUERADE  tcp  --  10.254.93.2          10.254.93.2          tcp dpt:4200

  Chain DOCKER (2 references)
  num  target     prot opt source               destination         
  1    RETURN     all  --  0.0.0.0/0            0.0.0.0/0           
  2    DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:4200 to:10.254.93.2:4200

  :

Developing in container
^^^^^^^^^^^^^^^^^^^^^^^

If you start a container as follows

::

   docker run -it --name ap-nimbus-client --net ap_nimbus_network --restart always -v ap_nimbus_file_upload:/opt/django/media -p 4240:80 --env-file env cardiacmodelling/ap-nimbus-client-direct:<version> bash

You will get a command bash shell inside the conatiner. You can make changes and manually start the client-direct ``/opt/django/Weblab/weblab/docker/kickoff.sh``. |br|
In order to try out changes, you can stop the :file:`kick-off.sh` script and manually restart it after changed have been applied. |br|

.. note:: If you quite the container it will stop and it will loose changes made. Instead of exiting the container you can detach
          with ``CTRL+P+Q`` and re-attach with ``docker attach <ap-nimbus-client-direct container name>``.
