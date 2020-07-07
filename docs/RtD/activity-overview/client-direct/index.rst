.. include:: ../../global.rst

|client-direct|
===============

|client-direct| is an `Angular 7.0.5 <https://angular.io/>`_ component of |AP-Nimbus| developed using
`Node.js <https://nodejs.org/>`_ v10.13.0.

 * Conventionally |ap-nimbus-client-direct| isn't installed/run except via 
   :ref:`install-orchestration` as it generally serves no purpose to install
   only the |UI|. |br|
   Developers may be interested to read non-container documentation of
   :ref:`developer-non-container-client-direct`.

Currently simulations and their results use `browser memory <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API>`_
as the storage, and therefore this data should be considered insecure, and in many respects,
`volatile <https://en.wikipedia.org/wiki/Volatile_memory>`_.
