.. include:: ../../global.rst

|ApPredict| containers
======================

.. note:: Docker containers |appredict-chaste-libs|, |appredict-no-emulators| and |appredict-with-emulators| are derived from
          source code in https://github.com/CardiacModelling/appredict-docker (or via the ``appredict-docker`` submodule of
          https://github.com/CardiacModelling/ap-nimbus).

.. seealso:: :ref:`appredict_containers` for visual representation.

appredict-chaste-libs
---------------------

|appredict-chaste-libs| is a container which contains all of |ApPredict|\ 's library dependencies.

 * Conventionally |appredict-chaste-libs| isn't "installed" as it's just a Debian Docker image with all of
   |ApPredict|\ 's dependency packages installed, and as such just the foundation for
   |appredict-no-emulators| to build on. |br|
 * Historically (before ``cardiacmodelling/appredict-chaste-libs:0.0.5``) this container's contents were mostly
   built from source packages of dependent libraries.
 * There's no "running" of |appredict-chaste-libs|.

appredict-no-emulators
----------------------

|appredict-no-emulators| is a container which has |appredict-chaste-libs| as its
foundation, and it is the minimum necessary to run |ApPredict| simulations via
|CLI|.

 * :ref:`installation-appredict`
 * :ref:`running-appredict`

appredict-with-emulators
------------------------

|appredict-with-emulators| is a container which has |appredict-no-emulators| as its
foundation, with all the Lookup Tables (https://cardiac.nottingham.ac.uk/lookup_tables/appredict_lookup_table_manifest.txt)
available at build time pre-installed to avoid the need to dynamically download them.

 * :ref:`installation-appredict`
 * :ref:`running-appredict`
