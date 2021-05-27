pushd && cd /home/appredict/Chaste && scons -j `nproc` cl=1 b=GccOpt exe=1 projects/ApPredict/apps/src && popd
