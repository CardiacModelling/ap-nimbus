.. include:: ../../global.rst

.. _running-app-manager:

Running |ap-nimbus-app-manager|
===============================

.. seealso:: Offical ``docker run`` `documentation <https://docs.docker.com/engine/reference/commandline/run/>`_.

You have two options for running |ap-nimbus-app-manager|, either :

  #. As a standalone container to call using a |CLI|, e.g. ``curl`` (see later `Start a Simulation`_ and `Query a Simulation`_ sections).

     ``docker run -it --rm -p 8080:8080 cardiacmodelling/ap-nimbus-app-manager:<version>`` |br|
     (``Cntl-C`` to exit)

  #. As part of |AP-Nimbus| (see also :ref:`running-client-direct`)

     ``docker run -d --name name-app-manager --net ap-nimbus-network --restart always cardiacmodelling/ap-nimbus-app-manager:<version>``

     .. note:: * You could also define a volume here, e.g. ``-v volume-app-manager:/home/appredict/apps/app-manager`` if you wanted to
                 see how simulations were being run and results stored ephemerally in the ``run`` and ``res`` folders at runtime.

               * The value specified in ``--name`` can be used as the hostname in the |client-direct| :ref:`running-client-direct-envvars` settings. |br|
                 **Please note**: DO NOT use underscores in these names as underscores in hostnames is not universally supported.

In Docker parlance, the ``-p`` will "publish" or "expose" the container port 8080 to port
8080 on the host machine by means of fiddling with the firewall (see 
:ref:`developer-container-app-manager` for a bit more information).

.. seealso:: For supplementary developer information see :ref:`developer-htw-app-manager`.

Start a Simulation 
------------------

::

  curl --header "expect: " --header "Content-Type:application/json" -X POST -d @request.json http://<host>:8080/

In the response will be a simulation identifier for subsequent querying of simulation status and
results.

Example :file:`request.json` for |ap-nimbus-app-manager|:0.0.10+
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

::

  {
    "modelId":8,
    "credibleIntervalPctiles":[38,68,86,95],
    "pacingFrequency":1,
    "pacingMaxTime":5,
    "IKr":{
      "associatedData":[{"pIC50":"4.01","hill":"1.01","saturation":"0.01"}],
      "spreads":{"c50Spread":"0.18"}},
    "INa":{
      "associatedData":[{"pIC50":"4.02","hill":"1.02","saturation":"0.02"}],
      "spreads":{"c50Spread":"0.2"}},
    "ICaL":{
      "associatedData":[{"pIC50":"4.03","hill":"1.03","saturation":"0.03"}],
      "spreads":{"c50Spread":"0.15"}},
    "IKs":{
      "associatedData":[{"pIC50":"4.04","hill":"1.04","saturation":"0.04"}],
      "spreads":{"c50Spread":"0.17"}},
    "IK1":{
      "associatedData":[{"pIC50":"4.05","hill":"1.05","saturation":"0.05"}]},
    "Ito":{
      "associatedData":[{"pIC50":"4.06","hill":"1.06","saturation":"0.06"}]},
    "INaL":{
      "associatedData":[{"pIC50":"4.07","hill":"1.07","saturation":"0.07"}]},
    "plasmaMaximum":300,
    "plasmaMinimum":0,
    "plasmaIntermediatePointCount":10,
    "plasmaIntermediatePointLogScale":true
  }

Example :file:`request.json` for |ap-nimbus-app-manager|:0.0.6-0.0.9
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

::

  {
    "modelId":8,
    "pacingFrequency":1,
    "pacingMaxTime":5,
    "IKr":{
      "associatedData":[{"pIC50":"4.01","hill":"1.01","saturation":"0.01"}],
      "spreads":{"c50Spread":"0.18"}},
    "INa":{
      "associatedData":[{"pIC50":"4.02","hill":"1.02","saturation":"0.02"}],
      "spreads":{"c50Spread":"0.2"}},
    "ICaL":{
      "associatedData":[{"pIC50":"4.03","hill":"1.03","saturation":"0.03"}],
      "spreads":{"c50Spread":"0.15"}},
    "IKs":{
      "associatedData":[{"pIC50":"4.04","hill":"1.04","saturation":"0.04"}],
      "spreads":{"c50Spread":"0.17"}},
    "IK1":{
      "associatedData":[{"pIC50":"4.05","hill":"1.05","saturation":"0.05"}]},
    "Ito":{
      "associatedData":[{"pIC50":"4.06","hill":"1.06","saturation":"0.06"}]},
    "INaL":{
       "associatedData":[{"pIC50":"4.07","hill":"1.07","saturation":"0.07"}]},
    "plasmaMaximum":300,
    "plasmaMinimum":0,
    "plasmaIntermediatePointCount":10,
    "plasmaIntermediatePointLogScale":true
  }


Example :file:`request.json` for |ap-nimbus-app-manager|:0.0.5 and earlier
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

::

  {
    "created":1576587107451,
    "modelId":3,
    "pacingFrequency":1,
    "pacingMaxTime":5,
    "pIC50IKr":"4",
    "pIC50INa":"",
    "pIC50ICaL":"",
    "pIC50IKs":"4",
    "pIC50IK1":"",
    "pIC50Ito":"",
    "plasmaMaximum":100,
    "plasmaMinimum":0,
    "plasmaIntermediatePointCount":4,
    "plasmaIntermediatePointLogScale":true
  }

Query a Simulation
------------------

Generally, if you have a valid simulation identifier available from a prior ``POST`` request, you
will see the query "help" by submitting :

::

  user@host:~> curl http://0.0.0.0:8080/api/collection/8c0b04cc-6e2f-4307-ae17-605cf81e0707/
  {"error":"Valid data query options are: \"STOP\", \"voltage_traces\", \"voltage_results\", \"progress_status\", \"q_net\" and \"messages\""}

To retrieve voltage results data :

::

  curl http://<host>:8080/api/collection/<simulation_id>/voltage_results

