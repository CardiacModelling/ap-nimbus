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

Installation
------------

.. toctree::
   :maxdepth: 2

   installation/index


