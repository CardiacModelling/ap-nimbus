.. include:: ../../global.rst

.. _illegal-instruction:

Illegal Instruction
===================

When running |ap-nimbus-app-manager|, |appredict-with-emulators| or
|appredict-no-emulators| there is a rare possibility that |ApPredict|
will fail to run with the message indicating "illegal instruction".

This was encountered in early builds (i.e. builds before May 2020, or more specifically,
since `commit e560e78 <https://bitbucket.org/gef_work/ap_nimbus/commits/e560e783e5a966cfac7823f6e4ed69857dcc761b>`_),
due to the use of the |ApPredict| build flag ``b=GccOptNative``, rather than ``b=GccOpt``.
The outcome of which was that when the container (and therefore |ApPredict|) was being
built, at compile time it was picking up the server's native cpu flags but in some cases
these were unlikely to be found in the container's deployment environment (e.g. ``sse4_1``
and ``sse4_2`` -- use ``cat /proc/cpuinfo`` for examples).
