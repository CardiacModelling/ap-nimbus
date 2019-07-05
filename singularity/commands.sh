#!/bin/bash -e

pushd appredict-chaste-libs
sudo singularity build appredict-chaste-libs.img Singularity
popd
pushd appredict-no-emulators
sudo singularity build appredict-no-emulators.img Singularity
popd
pushd appredict-with-emulators
sudo singularity build appredict-with-emulators.img Singularity
popd
