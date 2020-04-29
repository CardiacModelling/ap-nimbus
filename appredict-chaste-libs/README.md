# `ApPredict` "chaste-libs" dependencies only.

## Why not use [Chaste/chaste-docker](https://github.com/Chaste/chaste-docker)?

It'd be possible to use the "offical" Chaste-endorsed dependency container as a
base image to build `appredict-no-emulators`, etc., on, however we're trying to
create as lightweight as possible container and so for 
[ap-nimbus](https://github.com/CardiacModelling/ap-nimbus) the
[Alpine Linux](https://alpinelinux.org/) distribution is used as a base image
with only dependencies for `ApPredict` installed herein.
