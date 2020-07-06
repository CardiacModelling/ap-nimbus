.. include:: ../../global.rst

Tagging Containers
==================

.. seealso:: `docker tag <https://docs.docker.com/engine/reference/commandline/tag/>`_ 
             reference documentation |br|
             (Probably a safer choice for information!)

Tagging During Build
--------------------

The ``-t`` below is the build arg to tag the built container as ``app-manager:0.0.x``.

::

  cd <app-manager dir>
  docker build --build-arg build_processors=8 -t app-manager:0.0.x .

Tagging After Build
-------------------

If you want to tag a container as another name then :

::

  docker tag app-manager:0.0.x 127.0.0.1:5000/app-manager:0.0.x

The above will tag the container with a new name, with, in this case, the target repository being
specified as ``127.0.0.1:5000`` (an `insecure <https://docs.docker.com/registry/insecure/>`_ 
`local registry server <https://docs.docker.com/registry/deploying/>`_), but it could have been
``cardiacmodelling``, if the built container was to be ``docker push``\ ed to DockerHub's
`cardiacmodelling <https://hub.docker.com/u/cardiacmodelling/>`_ repository.
