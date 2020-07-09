.. include:: ../../global.rst

|datastore|
===========

|datastore| is a `Node.js <https://nodejs.org/>`_ (v10.12.0) "REST" endpoint to a separate
`MongoDB <https://www.mongodb.com/>`_ database.

This container is used to avoid any more than the minimum direct |client-direct| 
<==> |app-manager| communication. The idea being that by closing the |TCP| connection
between the aforementioned two containers after the initial "run simulation" exchange,
there is better opportunity for load balancing [#f1]_.

 * Conventionally |ap-nimbus-datastore| isn't installed/run except via 
   :ref:`install-orchestration` as it generally serves no purpose to install
   only a database. |br|
   Developers may be interested to read further at :ref:`installation-build-datastore` and
   :ref:`further-info-datastore`

.. rubric:: Footnotes

.. [#f1] The only communication between |client-direct| and |app-manager| is when
         |client-direct| sends an instruction to |app-manager| to run a simulation,
         and |app-manager| responds with an identifier. Thereafter all communication
         is via data being sent to and retrieved from the |datastore| using the
         identifier.

