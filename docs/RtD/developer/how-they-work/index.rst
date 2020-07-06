.. include:: ../../global.rst

Container Operations
====================

|ap-nimbus-app-manager|
-----------------------

 #. Docker runs :file:`kick_off.sh` when the image is run.  
 #. :file:`kick_off.sh` firstly sets off :file:`convert.sh` watching file
    creation/modification in a ``run`` directory.  

    * If a file creation/modification event of interest takes place (as a result
      of an |ApPredict| invocation) the changed file is read from the :file:`run`
      directory (probably a simulation-specific :file:`ApPredict_output/` directory),
      processed, and written (usually in |JSON| format) to a simulation-specific
      :file:`res` directory.

 #. :file:`kick_off.sh` secondly sets off :file:`server.js` listening on whichever
    host/port (e.g. ``0.0.0.0:8080``).

    * If an intermediary data repository, e.g. |datastore|, is being used (i.e. if the
      ``REST_API_URL_DATA`` environment variable is assigned a value) then
      :file:`server.js` starts watching file creation/modification in a :file:`res`
      directory. If a creation/modification event of interest takes place in this 
      :file:`res` directory then the content is read in and sent (via |HTTP|) to the 
      intermediary data repository.

 #. |app-manager| (or rather :file:`server.js`,) receives a ``POST`` request from |client-direct|
    to run |ApPredict|
 #. :file:`server.js` invokes :file:`run_me.sh`
 #. :file:`run_me.sh` starts |ApPredict| which writes output to the :file:`run` directory.
 #. :file:`convert.sh` sees results appearing in the :file:`run` directory and, on events of
    interest, processes the content and writes it to the :file:`res` directory.
 #. If an intermediary data repository is being used then :file:`server.js` sees
    data files appearing/changing in the :file:`res` directory, reads them, then
    sends them to the intermediary data repository ``REST API URL`` ...  
    ... otherwise :file:`server.js` will be awaiting polling calls from |client-direct|
    requesting the results data and responding with content from files in the
    :file:`res` directory if/when available.

