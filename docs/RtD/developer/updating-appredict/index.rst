.. include:: ../../global.rst

Updating ApPredict
==================

This section explains what to do to get changed to ApPredict to trickle through to the (containerised) ApPortal.
The way the containerised portal works, is that ApPredict runs inside the app-manager container. Therefore we do not need to worry about the client or database components.

After a change to ApPredict has been made and pushed to the master branch the steps to use it with the portal are as follows:

- Assign a tag to the ApPredict version as follows `gittag -a <name_of_tag> -m 'some messages for git history'` followed by `git push --tags`
- Checkout the appredict-docker repository (https://github.com/CardiacModelling/)
- Update the tag used for ApPredict at the top of the `Dockerfile` in appredict-no-emulators (to the one assigned earlier).
- Build the new appredict-no-emulators (see also `../building`) e.g. cd into `appredict-no-emulators` and then `docker build . -t cardiacmodelling/appredict-no-emulators:0.0.10` where 0.0.10 is the next available version. See docker hub (https://hub.docker.com/repository/docker/cardiacmodelling/appredict-no-emulators/general)
- Upload the new container to docker hub e.g. `docker push cardiacmodelling/appredict-no-emulators:0.0.10`
- Edit the readme on dockerhub (https://hub.docker.com/repository/docker/cardiacmodelling/appredict-no-emulators/general) with the new version number & change log
- Go to `appredict-with-emulators` and update the `Dockerfile`, updating the version number of `appredict-no-emulators` referenced in the first line.
- Build `appredict-with-emulators`, using the next available version as tag, and also push this to docker hub.
- Edit the readme on dockerhub (https://hub.docker.com/repository/docker/cardiacmodelling/appredict-with-emulators/general) with the new version number & change log
- Commit & push changed to git
- checkout the app manager (https://github.com/CardiacModelling/ap-nimbus-app-manager/tree/master)
- Update the docker file, updating the version of `appredict-with-emulators` referenced to the latest version.
- Build `ap-nimbus-app-manager` again, using the next available version as a tag
- Push to docker hub
- Update the readme on docker hub (https://hub.docker.com/repository/docker/cardiacmodelling/ap-nimbus-app-manager/general)
- List the current running docker images `ducker ps`. There should be an instance of app-manager
- Remove the current running instance of app-manager: e.g. `docker rm -f ap-nimbus-ap-manager`
- Then re-run the latest version of the app-manager, see https://ap-nimbus.readthedocs.io/en/latest/developer/container/index.html#ap-nimbus-app-manager
- Do a simple test simulation on the portal just to check that it works.
- Optionally you can remove the old image with the `rmi` command, use docker image list to see the current images that you have.
- Check out the ap-nimbus repository (https://github.com/CardiacModelling/ap-nimbus)
- Update the changed components:

   - `git submodule update appredict-docker --remote`
   - `git submodule update app-manager --remote`
- Git commit & push