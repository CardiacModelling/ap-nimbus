.. include:: ../../global.rst

.. _troubleshooting-containers:

General container problem solving
=================================

If a container appears to be running but the application it's hosting doesn't appear to be
responding.

::
  
  docker container ls
  docker logs <container id>
  docker logs $(docker inspect --format="{{.Id}}" <container name>)

