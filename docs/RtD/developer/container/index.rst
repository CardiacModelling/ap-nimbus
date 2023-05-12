.. include:: ../../global.rst

Developing with Containers
==========================

.. _developer-container-app-manager:

|ap-nimbus-app-manager|
-----------------------

.. seealso:: :ref:`running-app-manager`

Developing in container
^^^^^^^^^^^^^^^^^^^^^^^

If you start a container as follows:

::

   docker run -it --name ap-nimbus-app-manager --net ap_nimbus_network --restart always cardiacmodelling/ap-nimbus-app-manager:<version> bash

You will get a command bash shell inside the container. You can make changes and manually start the |app-manager| by running ``/home/appredict/apps/app-manager/kickoff.sh``. |br|
In order to try out changes, you can stop the |app-manager| by stopping :file:`kick_off.sh` and killing :file:`convert.sh` and manually restart it after changes have been applied. |br|

.. note:: If you ``exit`` the container it will stop and it will lose the changes made. Instead of exiting the container you can detach
          with ``CTRL+P+Q`` and re-attach with ``docker attach <ap-nimbus-app-manager container name>`` (you may eventually need a 
          ``docker container stop <ap-nimbus-app-manager container name>``).

.. _developer-container-client-direct:

|ap-nimbus-client-direct|
-------------------------

.. seealso:: :ref:`running-client-direct`

The instruction is to "publish" or "expose" the container ports (see `Publish or expose port (-p, --expose) <https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose>`_
for more information). |br|
What this does on an ``iptables``-based system is adjust the firewall such as :

::

  user@host:~> iptables -L -n --line-numbers -t nat

  :

  Chain POSTROUTING (policy ACCEPT)
  num  target     prot opt source               destination         
  1    MASQUERADE  all  --  172.19.0.0/16       0.0.0.0/0           
  :
  4    MASQUERADE  tcp  --  172.19.0.3          172.19.0.3          tcp dpt:80

  Chain DOCKER (2 references)
  num  target     prot opt source               destination         
  1    RETURN     all  --  0.0.0.0/0            0.0.0.0/0           
  2    DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:4240 to:172.19.0.3:80

  :

Developing in container
^^^^^^^^^^^^^^^^^^^^^^^

If you start a container using the ``docker run -d --name ap-nimbus-client ....`` you can access the running container using, for example :

::

   docker exec -it $(docker inspect --format="{{.Id}}" ap-nimbus-client) /bin/bash

Therein you can access whichever parts of the application the user ``appredict`` has been granted access to (which would likely be
determined by whatever has been assigned in the container's :file:`/etc/sudoers`, as determined by the container
`Dockerfile <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus-client/master/docker/Dockerfile>`_).

Fine-tuning Nginx logging
^^^^^^^^^^^^^^^^^^^^^^^^^

It is possible to do some small fine-tuning of Nginx logging configuration when building your own
|client-direct|, by deploying a file :file:`docker/fragments/nginx/logexcludeaddr_nginx.conf` and
then building and deploying a new container into a local repo, e.g. 

::

   pushd ~/git/ap-nimbus-client
   cat docker/fragments/nginx/logexcludeaddr_nginx.conf 
        # Don't log requests arriving from remote IP addr starting "192.168." or "172."
        ~^192\.168\..*$ 0;
        ~^172\..*$ 0;
   docker build -f docker/Dockerfile -t ap-nimbus-client-direct:<ver> .
   docker tag ap-nimbus-client-direct:<ver> localhost:5000/ap-nimbus-client-direct:<ver>
   docker push localhost:5000/ap-nimbus-client-direct:<ver>
   popd

