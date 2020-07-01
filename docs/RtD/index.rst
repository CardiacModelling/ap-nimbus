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

It is equally feasible to ``docker run ..`` a single |ap-nimbus-app-manager| container
and call it with |HTTP| ``POST`` and ``GET`` requests, or ``docker run ..`` either of the
|appredict-with-emulators| or |appredict-no-emulators| containers directly from a |CLI|.

.. figure:: _static/images/apnimbus-container-orchestration.png
   :alt: ApPredict container orchestration.

Installation
------------

.. toctree::
   :maxdepth: 2

   installation/index

.. rubric:: Footnotes

.. [#f1] So long as there's a container runtime, e.g. Docker, running somewhere!
