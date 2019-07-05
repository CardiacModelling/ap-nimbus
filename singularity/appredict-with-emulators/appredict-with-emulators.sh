su appredict

#------------------------------------------------------------------------------#
# 1.1. Download Chaste & ApPredict source                                      #
#------------------------------------------------------------------------------#

cd ${DIR_APPREDICT} && \
  ./emulators_fetch.sh && \
  ./emulators_bin_gen.sh ${BUILD_PROCESSORS} ./ApPredict.sh && \
  rm -rf *generator.arch *.tgz emulators_*.sh output
