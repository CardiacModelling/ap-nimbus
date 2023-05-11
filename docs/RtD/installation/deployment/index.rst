.. include:: ../../global.rst

Deployment Options
==================

::

                 +----------------------------+
                 | Do you intend to have only |
                 | an HTTP API to ApPredict?  |
                 +----------------------------+
                  |                          |
                 Yes                         No
                  |                          |
    +-------------------------------+  +----------------------+
    | Install ap-nimbus-app-manager |  | Do you intend to run |
    +-------------------------------+  | ApPredict from the   |
                                       | command-line?        |
                                       +----------------------+
                                        |                    |
                                       Yes                   No
                                        |                    |
                  +--------------------------------+  +-----------------------------+
                  | Install appredict-no-emulators |  | Do you intend to run the    |
                  | or appredict-with-emulators    |  | AP-Nimbus environment using |
                  +--------------------------------+  | e.g. client-direct (UI) +   |
                                                      | app-manager?                |
                                                      +-----------------------------+
                                                       |                           |
                                                      Yes                          No
                                                       |                           |
                                            +--------------------------+  +----------------+
                                            | Follow the Running       |  | Get in touch!? |
                                            | instructions linked to   |  +----------------+
                                            | below                    |
                                            +--------------------------+
     
Install
-------

.. seealso:: For instructions on how to run these containers, e.g. in the context of |AP-Nimbus| environment, see the more
             detailed section on :ref:`running`.

Containers generally, when attempting to run them for the first time, will be installed
locally by being auto-downloaded from `DockerHub <https://hub.docker.com/>`_ and deployed
to the local image collection by the container runtime.

.. _installation-app-manager:

Install |ap-nimbus-app-manager|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``docker run -it --rm -p 8080:8080 cardiacmodelling/ap-nimbus-app-manager:<version>``

(See `ap-nimbus-app-manager tags <https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager/tags>`_
for available version numbers.) |br| |br|
This command will automatically download the container from https://hub.docker.com/u/cardiacmodelling
if it is not already available in the local |docker| image collection, and by default will
listen on ``http://0.0.0.0:8080/`` (``Cntl-C`` to exit). |br|
For further instructions on running, including ``POST``\ ing data to the running endpoint, see the section on :ref:`running-app-manager`.

.. _installation-appredict:

Install |appredict-no-emulators| or |appredict-with-emulators|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``docker run -it --rm cardiacmodelling/appredict-no-emulators:<version> apps/ApPredict/ApPredict.sh``

(See `appredict-no-emulators tags <https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators/tags>`_
or `appredict-with-emulators tags <https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators/tags>`_
for available version numbers.) |br| |br|
This command will automatically download the container from https://hub.docker.com/u/cardiacmodelling
if it is not already available in the local |docker| image collection, and by default will
run |ApPredict| with no args (and therefore display the 'help' information). |br|
For further instructions on running see the section on :ref:`running-appredict`.

.. _installation-client-direct:

Install |ap-nimbus-client-direct|
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

|client-direct| requires a number of configuration property values to be assigned (e.g. for database connectivity) before it
will start, and therefore installation is best explained in the context of the provision of an operational |AP-Nimbus|
environment.

For further instructions on running, see the section on :ref:`running-client-direct`.
