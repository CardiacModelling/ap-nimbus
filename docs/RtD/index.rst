.. include:: global.rst

.. figure:: _static/images/banner.png
   :align: left
   :alt: Action Potential Prediction

Welcome to AP-Nimbus's documentation
====================================

:Project Home: https://github.com/CardiacModelling/ap-nimbus
:Documentation: https://ap-nimbus.readthedocs.io/
:Created: |today|
:Version: |release|

IMPORTANT
---------

This activity represents the next step in the development of the original
`AP-Portal <https://apportal.readthedocs.io/en/latest/>`_ work -- towards a
container-based / cloud solution.

|AP-Nimbus| is available at https://github.com/CardiacModelling/ap-nimbus and is
being developed by the `University of Nottingham <https://www.nottingham.ac.uk/>`_\ 's
`School of Mathematical Sciences <https://www.nottingham.ac.uk/mathematics/research/>`_ .

Preamble
--------

 * Unlike `AP-Portal <https://apportal.readthedocs.io/en/latest/>`_, this work
   includes the installation of |ApPredict|, the cardiac simulation software.
 * Also unlike |AP-Portal|, this work, by nature of containerisation, means that
   |AP-Nimbus| work does not embody a single application, it is instead a
   collection of containers where each can operate in isolation, e.g. as a
   standalone (Docker or Singularity) container, or alternatively, orchestrated
   in a microservice architecture (e.g. Kubernetes or docker-compose).

Singularity
-----------

This documentation predominantly covers ``Docker`` container environments, however
it has been relatively straightforward to create `Singularity <https://sylabs.io/>`_
containers (e.g. ``singularity build app-manager.img docker://cardiacmodelling/ap-nimbus-app-manager:0.0.10``)
and use those [#f3]_.

Sample invocation scripts can be found at `ap-predict-online <https://bitbucket.org/gef_work/ap_predict_online>`_\'s
`app-manager --> tools <https://bitbucket.org/gef_work/ap_predict_online/src/master/app-manager/tools/>`_  section.

Diagrammatic Representation
---------------------------

ApPredict
^^^^^^^^^

`ApPredict <https://github.com/Chaste/ApPredict>`_ is the underlying cardiac 
simulation engine.

Building or installing |ApPredict| is a complex and time-consuming
process and by distributing in container form it's possible to have it installed
in a fraction of the time [#f1]_.

.. figure:: _static/images/appredict-in-containers.png
   :width: 700px
   :alt: ApPredict in Containers.

Orchestration
^^^^^^^^^^^^^

The following illustrates a microservice-based solution to potentially running many
|ApPredict|\s concurrently.

.. figure:: _static/images/apnimbus-container-orchestration.png
   :alt: ApPredict container orchestration.

It is equally feasible to :

 #. [**Containerised**] ``docker run ..`` a single |ap-nimbus-app-manager| container and
    call it with |HTTP| ``POST`` and ``GET``  requests, or;
 #. [**Containerised**] ``docker run ..`` either of the |appredict-with-emulators| or
    |appredict-no-emulators| containers directly from a |CLI| to run their internal
    |ApPredict|\s, or;
 #. [**Non-containerised**] Run |ap-nimbus-app-manager| and/or |ap-nimbus-client-direct|
    locally as a non-containerised development environment, e.g. by running their 
    :file:`./kick_off.sh` scripts manually [#f2]_

Installation
------------

.. toctree::
   :maxdepth: 2

   installation/index

Running
-------

.. toctree::
   :maxdepth: 2

   running/index

Developer Section
-----------------

.. toctree::
   :maxdepth: 2

   developer/index

.. rubric:: Footnotes

.. [#f1] So long as there's a container runtime, e.g. Docker, running somewhere!
.. [#f2] Running |ap-nimbus-app-manager| and/or |ap-nimbus-client-direct| in a non-container
         form requires a local installation of |ApPredict| and other software,
         e.g. ``Node.js``, ``inotify``, ``jq``.
.. [#f3] |Singularity| containers (or rather, only |ap-nimbus-app-manager|) have only been
         trialled operating in isolation, not in an orchestrated environment. 
