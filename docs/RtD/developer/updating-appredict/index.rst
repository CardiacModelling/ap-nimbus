.. include:: ../../global.rst

Updating |ApPredict|
====================

This section explains what to do to get changes to the |ApPredict| *main* branch to trickle through to the
(containerised) |AP-Portal|. The way the containerised portal works, is that |ApPredict| runs inside the
|ap-nimbus-app-manager| container. Therefore we do not need to worry about the client or database components
(unless |ApPredict| input or output formats have changed!).

Prerequisites
-------------

 #. Write access to https://github.com/Chaste/ApPredict |br|
    If you have a GitHub `personal access token <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token>`_,
    you may need to run ``git clone https://<user>:<token>@github.com/repo/project`` or 
    ``git remote set-url origin https://<user>:<token>@github.com/repo/project``
 #. Write access to https://github.com/CardiacModelling/ap-nimbus
 #. Write access to https://github.com/CardiacModelling/ap-nimbus-app-manager
 #. Write access to https://github.com/CardiacModelling/appredict-docker
 #. Write access to https://hub.docker.com/u/cardiacmodelling |br|
    You may need to run ``docker login -u <user> -p <pwd> docker.io`` at the command line to authenticate
 #. (Optional) https://readthedocs.org/ access (to rebuild https://ap-nimbus.readthedocs.io/)
 #. A multicore server with good upload speeds as a build machine!

Steps
-----

.. warning:: :underline:`For brevity only` the cloning, updating and pushing to *master* branch 
             is illustrated - new branches and Pull Requests are recommended. |br| |br|
             It would be better to **not** run the "build" instructions on servers hosting |ap-nimbus| -
             to avoid inadvertently overwriting existing containers. |br| |br|
             If you are concerned about ingesting cached layers, then use the option ``--no-cache`` 
             during docker building. (Alternative techniques are discussed in 
             `Stack Overflow - How to force Docker for a clean build of an image <https://stackoverflow.com/questions/35594987/how-to-force-docker-for-a-clean-build-of-an-image>`_)

- Make changes to the underlying |ApPredict| and assign an annotated tag to the |ApPredict|
  default branch, e.g.

  ::

      user@host:~/git> git clone https://github.com/Chaste/ApPredict
      user@host:~/git> cd ApPredict
      user@host:~/git/ApPredict> git tag -a <new_appredict_tag> -m 'some messages for git history'
      user@host:~/git/ApPredict> git push --tags

- **Optional Step!** : :underline:`Only` if there's been a change in |ApPredict|\'s *chaste-libs* dependencies and
  we need a new |appredict-chaste-libs|.
  
  - Determine the next available |appredict-chaste-libs| container tag value (*"<new_appredict-chaste-libs_tag>"*) |br|
    See https://hub.docker.com/r/cardiacmodelling/appredict-chaste-libs
  - Build and upload to Docker Hub a new |appredict-chaste-libs|.

    ::

       user@host:~/git> git clone https://github.com/CardiacModelling/appredict-docker
       user@host:~/git> cd appredict-docker/appredict-chaste-libs
       user@host:~/git/appredict-docker/appredict-chaste-libs>
       # Edit Dockerfile (and if helpful, README.md)
       user@host:~/git/appredict-docker/appredict-chaste-libs> docker build -t cardiacmodelling/appredict-chaste-libs:<new_appredict-chaste-libs_tag> .     # <-- Note trailing "."
       user@host:~/git/appredict-docker/appredict-chaste-libs> docker push cardiacmodelling/appredict-chaste-libs:<new_appredict-chaste-libs_tag>
       # The git committing, pushing, etc., will occur in a later step.

- Determine the next available container tag values.

  - |appredict-no-emulators| tag value (*"<new_appredict-no-emulators_tag>"*) |br|
    See https://hub.docker.com/r/cardiacmodelling/appredict-no-emulators/tags
  - |appredict-with-emulators| tag value (*"<new_appredict-with-emulators_tag>"*) |br|
    See https://hub.docker.com/r/cardiacmodelling/appredict-with-emulators/tags
  - |ap-nimbus-app-manager| tag value (*"<new_ap-nimbus-app-manager_tag>"*) |br|
    See https://hub.docker.com/r/cardiacmodelling/ap-nimbus-app-manager/tags

- Build and upload to Docker Hub a new |appredict-no-emulators| and |appredict-with-emulators| |br| |br|
  **Note** : If you don't want to be uploading new versions to Docker Hub immediately as per the following
  instructions, see :ref:`installation-build-local` and :ref:`running-appredict` for building/testing
  locally.

  ::

     user@host:~/git> cd appredict-docker/appredict-no-emulators
     user@host:~/git/appredict-docker/appredict-no-emulators>
     # In Dockerfile :
     #   1. Optionally update "FROM cardiacmodelling/appredict-chaste-libs:<new_appredict-chaste-libs_tag>"
     #      if you're using a new version of chaste libs
     #   2. Optionally update "ARG chaste_tag=<Chaste ver>" if you're using a new version of Chaste
     #   3. Update "ARG appredict_tag=<new_appredict_tag>"
     user@host:~/git/appredict-docker/appredict-no-emulators> docker build --build-arg build_processors=<processors> -t cardiacmodelling/appredict-no-emulators:<new_appredict-no-emulators_tag> .   # <-- Note trailing "."
     user@host:~/git/appredict-docker/appredict-no-emulators> docker push cardiacmodelling/appredict-no-emulators:<new_appredict-no-emulators_tag>
     user@host:~/git/appredict-docker/appredict-no-emulators> cd ../appredict-with-emulators
     # In Dockerfile :
     #   1. Update "FROM cardiacmodelling/appredict-no-emulators:<new_appredict-no-emulators_tag>"
     user@host:~/git/appredict-docker/appredict-with-emulators> docker build --build-arg build_processors=<processors> -t cardiacmodelling/appredict-with-emulators:<new_appredict-with-emulators_tag> .  # <-- Note trailing "."
     user@host:~/git/appredict-docker/appredict-with-emulators> docker push cardiacmodelling/appredict-with-emulators:<new_appredict-with-emulators_tag>
     # The git committing, pushing, etc., will occur in a later step.

- Test the newly-uploaded Docker Hub containers.

  See instructions at :ref:`running-appredict`

- Update documentation

  - Docker Hub, with version numbers and change logs, e.g.

    - (Optional) https://hub.docker.com/repository/docker/cardiacmodelling/appredict-chaste-libs/general
    - https://hub.docker.com/repository/docker/cardiacmodelling/appredict-no-emulators/general
    - https://hub.docker.com/repository/docker/cardiacmodelling/appredict-with-emulators/general

  - GitHub/RtD - Make any relevant changes to :

    - https://github.com/CardiacModelling/ap-nimbus/tree/master/docs/RtD

      You may need to install (Ubuntu) ``sphinx``, ``sphinx_rtd_theme`` / (Fedora) ``python3-sphinx``, ``python3-sphinx_rtd_theme``.

      ::

        user@host:~/git> git clone https://github.com/CardiacModelling/ap-nimbus
        user@host:~/git> cd ap-nimbus/docs/RtD
        user@host:~/git/ap-nimbus/docs/RtD>
        # Edit .rst files (see https://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html)
        user@host:~/git/ap-nimbus/docs/RtD> make clean html           # <-- After this, view content of _build/html/index.html in browser to verify!
    
    - :file:`README.md` files anywhere (e.g. ``appredict-docker``, ``ap-nimbus``).

- Commit and push GitHub changes

  ::

     user@host:~/git/appredict-docker> git commit -m "Commit message!"
     user@host:~/git/appredict-docker> git push
     user@host:~/git/appredict-docker> cd ../ap-nimbus
     user@host:~/git/ap-nimbus> git submodule update appredict-docker --remote
     user@host:~/git/ap-nimbus> git commit -m "Commit message!"
     user@host:~/git/ap-nimbus> git push

- (Optional) Update |ap-nimbus-app-manager|

  ::

     user@host:~/git> git clone https://github.com/CardiacModelling/ap-nimbus-app-manager
     user@host:~/git> cd ap-nimbus-app-manager
     user@host:~/git/ap-nimbus-app-manager>
     # In Dockerfile
     #   1. Update "FROM cardiacmodelling/appredict-with-emulators:<new_ap-nimbus-app-manager_tag>"
     user@host:~/git/ap-nimbus-app-manager> docker build --build-arg build_processors=<processors> -t cardiacmodelling/ap-nimbus-app-manager:<new_ap-nimbus-app-manager_tag> .   # <-- Note trailing "."
     user@host:~/git/ap-nimbus-app-manager> docker push cardiacmodelling/ap-nimbus-app-manager:<new_ap-nimbus-app-manager_tag>

  - Test the newly-uploaded Docker Hub containers.

    See instructions at :ref:`running-app-manager`

  - Update documentation

    - Docker Hub, with version numbers and change logs, e.g.

      - https://hub.docker.com/repository/docker/cardiacmodelling/ap-nimbus-app-manager/general

    - GitHub/RtD - Make any relevant changes to :

      - https://github.com/CardiacModelling/ap-nimbus/tree/master/docs/RtD |br|
        (See info above for how to verify changes locally)
      - :file:`README.md` files anywhere.

  - Commit and push GitHub changes

    ::

       user@host:~/git/ap-nimbus-app-manager> git commit -m "Commit message!"
       user@host:~/git/ap-nimbus-app-manager> git push
       user@host:~/git/ap-nimbus-app-manager> cd ../ap-nimbus
       user@host:~/git/ap-nimbus> git submodule update ap-nimbus-app-manager --remote
       user@host:~/git/ap-nimbus> git push

- Updating the test/production servers

  See internal documentation

Updating Git submodules
-----------------------

Easiest is updating all the submodules at once:

::

  git clone --recursive https://github.com/cardiacModelling/ap-nimbus
  cd ap-nimbus
  git submodule update --remote
  git add -A
  git commit –m "Updated submodules"
  git push


If you want to update just 1 submodule then add the path in the update line. E.g.

::

  git submodule update -–remote client-direct
