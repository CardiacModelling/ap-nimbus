.. include:: ../../global.rst

Running Uncontainerised
=======================

This section covers running the container's scripts in a non-container environment for
development purposes.

.. _developer-non-container-app-manager:

|ap-nimbus-app-manager|
-----------------------

|TLDR|
^^^^^^

You'll need to have available :

 * ``inotify-tools``
 * ``jq``
 * ``oniguruma`` (maybe!)
 * ``kernel-headers``
 * Node.js, i.e. ``node`` and ``npm``
 * ``/proc/sys/fs/inotify/max_user_watches`` increased to, for example, ``65536``, or ideally, 
   something much greater, e.g. ``524288``.
 * Port 8080, otherwise you'll need to specify an alternative value in the env var 
   ``REST_API_PORT`` (Similarly, if you need to specify a non-default ``REST_API_URL_DATA``
   |datastore| value you'll need to run :file:`kick_off.sh` as
   ``REST_API_URL_DATA=http://127.0.0.1:8118/ ./kick_off.sh``)
 * |ApPredict| installed locally, if you actually want to run a simulation. Sorry!

.. warning:: If you use a port other than 8080 then it will not be possible to use 
             `ap-nimbus-client-direct`_ in non-container mode as it will be expecting
             the default 8080 to be available. |br|
             Note: When in container mode, any port can be used (on assignment of the
             appropriate args and/or env vars).

::

  user@host:~> cd git/ap-nimbus/app-manager
  user@host:~/git/ap-nimbus/app-manager> ./kick_off.sh


The Long Read
^^^^^^^^^^^^^

This is what you'd like to happen ...

::

  user@host:~> cd git/ap-nimbus/app-manager
  user@host:~/git/ap-nimbus/app-manager> ./kick_off.sh
  Setting up watches.  Beware: since -r was given, this may take a while!
  INFO2 : REST_API_URL_DATA not defined in ENV vars. Assuming client-direct querying directly.
  INFO4 : REST_API_PORT not defined in ENV vars. Using default value of 8080.
  INFO3 : app-manager listening at http://0.0.0.0:8080

However, this is probably what will happen initially ...

::

  user@host:~/git/ap-nimbus/app-manager> ./kick_off.sh
  ./kick_off.sh: line 4: node: command not found
  user@host:~/git/ap-nimbus/app-manager> ./convert.sh: line 149: inotifywait: command not found

The reason being that ``kick_off.sh`` is the script that would normally expect to be
running inside a container, not outside a container! We therefore need to install on the
local fs all the scripts and programs that are built into the container using the 
``Dockerfile`` at ``docker build ..`` time.

Glancing in ``Dockerfile`` you'll see that the following packages need to be installed :

 * ``inotify-tools``
 * ``jq``
 * ``oniguruma``
 * ``kernel-headers``

Similarly you'll need to install ``Node.js`` on your platform, so you can do that either
as a package-install or a binary/source download and install.  

Once that's done this will probably happen ...

::

  user@host:~/git/ap-nimbus/app-manager> ./kick_off.sh 
  Setting up watches.  Beware: since -r was given, this may take a while!
  Watches established.
  internal/modules/cjs/loader.js:638
      throw err;
      ^

  Error: Cannot find module 'uuid/v4'
      at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)
      at Function.Module._load (internal/modules/cjs/loader.js:562:25)
      at Module.require (internal/modules/cjs/loader.js:692:17)
      at require (internal/modules/cjs/helpers.js:25:18)
      at Object.<anonymous> (/home/user/git/ap-nimbus/app-manager/server.js:11:16)
      at Module._compile (internal/modules/cjs/loader.js:778:30)
      at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
      at Module.load (internal/modules/cjs/loader.js:653:32)
      at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
      at Function.Module._load (internal/modules/cjs/loader.js:585:3)

Which means that we're almost there! ..

::

  user@host:~/git/ap-nimbus/app-manager> npm install
  
``npm install`` should see what's defined in :file:`package-lock.json` and install
everything therein locally to the :file:`node_modules` directory.

Trying again ..

::

  user@host:~/git/ap-nimbus/app-manager> ./kick_off.sh 
  Setting up watches.  Beware: since -r was given, this may take a while!
  Watches established.
  INFO2 : REST_API_URL_DATA not defined in ENV vars. Assuming client-direct querying directly.
  INFO4 : REST_API_PORT not defined in ENV vars. Using default value of 8080.
  INFO3 : app-manager listening at http://0.0.0.0:8080
  events.js:174
        throw er; // Unhandled 'error' event
        ^

  Error: listen EADDRINUSE: address already in use 0.0.0.0:8080
      at Server.setupListenHandle [as _listen2] (net.js:1280:14)
      at listenInCluster (net.js:1328:12)
      at doListen (net.js:1461:7)
      at process._tickCallback (internal/process/next_tick.js:63:19)
      at Function.Module.runMain (internal/modules/cjs/loader.js:834:11)
      at startup (internal/bootstrap/node.js:283:19)
      at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
  Emitted 'error' event at:
      at emitErrorNT (net.js:1307:8)
      at process._tickCallback (internal/process/next_tick.js:63:19)
      [... lines matching original stack trace ...]
      at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)

Hmm! Looks like there's something already listening on port 8080!

::

  user@host:~/git/ap-nimbus/app-manager> REST_API_PORT=9999 ./kick_off.sh 
  Setting up watches.  Beware: since -r was given, this may take a while!
  Failed to watch run/; upper limit on inotify watches reached!
  Please increase the amount of inotify watches allowed per user via `/proc/sys/fs/inotify/max_user_watches'.
  INFO2 : REST_API_URL_DATA not defined in ENV vars. Assuming client-direct querying directly.
  INFO3 : app-manager listening at http://0.0.0.0:9999

Oh Dear! We need to increase the value of ``/proc/sys/fs/inotify/max_user_watches``

::

  user@host:~/git/ap-nimbus/app-manager> sudo nano /proc/sys/fs/inotify/max_user_watches
  user@host:~/git/ap-nimbus/app-manager> REST_API_PORT=9999 ./kick_off.sh 
  Setting up watches.  Beware: since -r was given, this may take a while!
  INFO2 : REST_API_URL_DATA not defined in ENV vars. Assuming client-direct querying directly.
  INFO3 : app-manager listening at http://0.0.0.0:9999
  
All done.. except for the fact that you need to have a local version of |ApPredict|
installed!?!!  

.. _developer-non-container-client-direct:

|ap-nimbus-client-direct|
-------------------------

|TLDR|
^^^^^^

You'll need to have available :

 * Node.js, i.e. ``node`` and ``npm``
 * Angular 7.0.5 |CLI|, i.e. ``ng``
 * Port 4200 available, otherwise you'll need to specify an alternative on the |CLI|.

::

  user@host:~> cd git/ap-nimbus/client-direct
  user@host:~/git/ap-nimbus/client-direct> ./kick_off.sh

The Long Read
^^^^^^^^^^^^^

This is what you'd like to happen ...

::

  user@host:~> cd git/ap-nimbus/client-direct
  user@host:~/git/ap-nimbus/client-direct> ./kick_off.sh

  WARNING : Angular's 'open your browser on ...' message assumes too much!
            Also try 'http://<your ip>:4200/' or 'http://<docker net ip>:4200/'

  ** Angular Live Development Server is listening on 0.0.0.0:4200, open your browser on http://localhost:4200/ **
   17% building modules 59/69 modules 10 active .../simulations/simulations.component.sassBrowserslist: caniuse-lite is outdated. Please run next command `npm update caniuse-lite browserslist`
                                                                                          
  Date: 2020-07-03T11:32:01.074Z
  Hash: 6e012064684fc30b1345
  Time: 14886ms
  chunk {main} main.js, main.js.map (main) 230 kB [initial] [rendered]
  chunk {polyfills} polyfills.js, polyfills.js.map (polyfills) 223 kB [initial] [rendered]
  chunk {runtime} runtime.js, runtime.js.map (runtime) 6.08 kB [entry] [rendered]
  chunk {styles} styles.js, styles.js.map (styles) 999 kB [initial] [rendered]
  chunk {vendor} vendor.js, vendor.js.map (vendor) 6.64 MB [initial] [rendered]

  WARNING in Circular dependency detected:
  src/app/app-routing.module.ts -> src/app/results/results.component.ts -> src/app/app-routing.module.ts

  WARNING in Circular dependency detected:
  src/app/results/results.component.ts -> src/app/app-routing.module.ts -> src/app/results/results.component.ts

  WARNING in Circular dependency detected:
  src/app/simulations/simulations.component.ts -> src/app/app-routing.module.ts -> src/app/simulations/simulations.component.ts
  ℹ ｢wdm｣: Compiled with warnings.

However, this is probably what will happen initially ...

::

  user@host:~/git/ap-nimbus/client-direct> ./kick_off.sh 

  WARNING : Angular's 'open your browser on ...' message assumes too much!
            Also try 'http://<your ip>:4200/' or 'http://<docker net ip>:4200/'

  ./kick_off.sh: 17: ./kick_off.sh: ng: not found

The reason being that ``kick_off.sh`` is the script that would normally expect to be
running inside a container, not outside a container! We therefore need to install on the
local fs all the scripts and programs that are built into the container using the
``Dockerfile`` at ``docker build ..`` time.

Glancing in ``Dockerfile`` you'll see that the following packages need to be installed :

 * Node.js, i.e. ``node`` and ``npm``

You'll need to install ``Node.js`` on your platform, so you can do that either
as a package-install or a binary/source download (e.g. from 
`nodejs.org <https://nodejs.org/en/blog/release/v10.13.0/>`_) and install.

Once that's done ...

::

  user@host:~/git/ap-nimbus/client-direct> npm install
  user@host:~/git/ap-nimbus/client-direct> PATH=${PATH}:./node_modules/@angular/cli/bin ./kick_off.sh

The first of the above, ``npm install``, seems to install ``ng`` (which
:file:`kick_off.sh` requires) to the :file:`node_modules` directory it creates.

.. warning:: |ap-nimbus-client-direct| in non-container mode expects `ap-nimbus-app-manager`_ to
             be listening on the default port 8080.

Configuration Options
^^^^^^^^^^^^^^^^^^^^^

|ap-nimbus-client-direct| as has some configuration options which can be modified,
although it requires version-controlled files to be changed, so please be aware of
the consequences.

 * Calls to |app-manager| by default are to ``http://127.0.0.1:8080/``, but if that's
   not convenient, modify :file:`src/env.js`, changing the ``__api_url_appmgr`` to
   the desired endpoint URL, e.g. ``http://127.0.0.2:8082/``.
 * By default simulation results are not sent to |datastore|, however if you do with
   that to happen then modify :file:`src/env.js`, changing the ``__api_url_data``
   to the desired endpoing URL, e.g. ``http://127.0.0.2:8118/api/collection/``
 * A quick way to achieve the above two is to run : |br|
   ``user@host:~/git/ap-nimbus/client-direct> REST_API_URL_APPMGR=http://127.0.0.1:8888/ REST_API_URL_DATA=http://127.0.0.1:8118/api/collection/ ./entry_point.sh``
 * In Angular developer mode *I think* it's possible to adjust :file:`src/env.js` during
   runtime and Angular will detect changes and reload.

If you want |ap-nimbus-client-direct| to run non-containerised and listen on non-default
host and port numbers, then try for example :

::

  user@host:~/git/ap-nimbus/client-direct> ./kick_off 127.0.0.2 4201

If you want to adjust the values sent to |app-manager|, such as the CellML model numbers, or
the default compound concentration value, then directly modify the file 
:file:`src/assets/config/appredict.json`.
