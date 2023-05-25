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

Django static file creation
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Within `ap-nimbus-client/client/static <https://github.com/CardiacModelling/ap-nimbus-client/tree/master/client/static>`_ 
there are the static files which the Django UI references, e.g. images, css, js.

The following commands represent an example of how a new minified :file:`main-min.js` can be generated.

**Note** : You need to have ``npm`` (so you probably need ``node.js`` installed - e.g. ``apt install nodejs npm``).

.. warning:: 1. The commands below also modify the version-controlled file :file:`npm-shrinkwrap.json`, but don't
             commit this change! |br|
             2. They also fill up :file:`node_modules` with almost 100Mb of stuff which you **really**
             don't want to be copied into a container! Better to delete the content of this
             directory before building the container.

::

   user@host:~/git/ap-nimbus-client/client/static> npm install gulp
   user@host:~/git/ap-nimbus-client/client/static> ./node_modules/gulp/bin/gulp.js      # <-- reads gulpfile.js
   user@host:~/git/ap-nimbus-client/client/static> find ./ -mmin -1 -type f
   ./css/style-min.css
   ./build/js/main-min.js

If you're just wanting to create and use an unminified version of :file:`main.js` for local testing, you can
try the following.

::

   user@host:~/git/ap-nimbus-client/client/static> sed -i "s/noSource: true/noSource: true, ignoreFiles: ['main.js']/g" gulpfile.js
   user@host:~/git/ap-nimbus-client/client/static> sed -i "s/main-min/main/g" ../templates/includes/head.html
   user@host:~/git/ap-nimbus-client/client/static> ./node_modules/gulp/bin/gulp.js	# <-- reads gulpfile.js
   user@host:~/git/ap-nimbus-client/client/static> find ./ -mmin -1 -type f
   ./css/style-min.css
   ./build/js/main.js

Developing in container
^^^^^^^^^^^^^^^^^^^^^^^

If you start a container using the ``docker run -d --name ap-nimbus-client ....`` you can access the running container using, for example :

::

   docker exec -it $(docker inspect --format="{{.Id}}" ap-nimbus-client) /bin/bash

Therein you can access whichever parts of the application the user ``appredict`` has been granted access to (which would likely be
determined by whatever has been assigned in the container's :file:`/etc/sudoers`, as determined by the container
`Dockerfile <https://raw.githubusercontent.com/CardiacModelling/ap-nimbus-client/master/docker/Dockerfile>`_).
