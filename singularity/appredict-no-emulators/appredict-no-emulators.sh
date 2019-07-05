su root

apk add --no-cache git libexecinfo-dev nano scons

su appredict

#------------------------------------------------------------------------------#
# 1.1. Download Chaste & ApPredict source                                      #
#------------------------------------------------------------------------------#

cd ${DIR_BUILD} && \
  git clone -b ${CHASTE_BRANCH} https://github.com/Chaste/Chaste.git && \
  cd Chaste && \
  git checkout ${CHASTE_HASH} && \
  cd .. && \
  git clone -b ${APPREDICT_BRANCH} --recursive https://github.com/Chaste/ApPredict.git && \
  cd ApPredict && \
  git checkout ${APPREDICT_HASH} && \
  rm -f src/cellml/cellml/a*.cellml && \
  rm -f src/cellml/cellml/b*.cellml && \
  rm -f src/cellml/cellml/c*.cellml && \
  rm -f src/cellml/cellml/d*.cellml && \
  rm -f src/cellml/cellml/e*.cellml && \
  rm -f src/cellml/cellml/f*.cellml && \
  rm -f src/cellml/cellml/grandi_pasqualini_bers_2010_ss_endo.cellml && \
  rm -f src/cellml/cellml/hilgemann_noble_model_1987.cellml && \
  rm -f src/cellml/cellml/hodgkin_huxley_squid_axon_model_1952_modified.cellml && \
  rm -f src/cellml/cellml/i*.cellml && \
  rm -f src/cellml/cellml/j*.cellml && \
  rm -f src/cellml/cellml/k*.cellml && \
  rm -f src/cellml/cellml/l*.cellml && \
  rm -f src/cellml/cellml/maleckar_model_2009.cellml && \
  rm -f src/cellml/cellml/maltsev_2009.cellml && \
  rm -f src/cellml/cellml/matsuoka_model_2003.cellml && \
  rm -f src/cellml/cellml/mcallister_noble_tsien_1975_b.cellml && \
  rm -f src/cellml/cellml/n*.cellml && \
  rm -f src/cellml/cellml/ohara_rudy_2011_epi.cellml && \
  rm -f src/cellml/cellml/paci_hyttinen_aaltosetala_severi_atrialVersion.cellml && \
  rm -f src/cellml/cellml/pandit_clark_giles_demir_2001_*.cellml && \
  rm -f src/cellml/cellml/pasek_simurda_*.cellml && \
  rm -f src/cellml/cellml/priebe_beuckelmann_1998.cellml && \
  rm -f src/cellml/cellml/r*.cellml && \
  rm -f src/cellml/cellml/sachse_moreno_abildskov_2008_b.cellml && \
  rm -f src/cellml/cellml/sakmann_model_2000_epi.cellml && \
  rm -f src/cellml/cellml/stewart_zhang_model_2008_ss.cellml && \
  rm -f src/cellml/cellml/ten_tusscher_model_2004*.cellml && \
  rm -f src/cellml/cellml/ten_tusscher_model_2006_endo.cellml && \
  rm -f src/cellml/cellml/ten_tusscher_model_2006_M.cellml && \
  rm -f src/cellml/cellml/v*.cellml && \
  rm -f src/cellml/cellml/w*.cellml && \
  rm -f src/cellml/cellml/z*.cellml

#------------------------------------------------------------------------------#
# 1.2. Build ApPredict and deploy                                              #
#------------------------------------------------------------------------------#

cd ${DIR_BUILD} && \
  sed -i -- "s|<chaste-libs-dir>|${DIR_CHASTE_LIBS}/|g" default.py.patch && \
  patch -p0 < default.py.patch && \
  ln -sv ../../ApPredict Chaste/projects/ && \
  export USER=appredict && \
  export CHASTE_LIBS=${DIR_CHASTE_LIBS} && \
  export LD_LIBRARY_PATH=${CHASTE_LIBS}/lib && \
  export PATH=${CHASTE_LIBS}/bin:${PATH} && \
  export PYTHONPATH=${CHASTE_LIBS}/lib/python2.7/site-packages:${CHASTE_LIBS}/lib64/python2.7/site-packages && \
  cd Chaste && \
  scons -j${BUILD_PROCESSORS} cl=1 b=GccOptNative exe=1 projects/ApPredict/apps/src && \
  cd .. && \
  rm default.py.patch

mkdir -vp ${DIR_APPREDICT}/libs

sed -i -- "s|<chaste-libs-dir>|${DIR_CHASTE_LIBS}|g" ${DIR_APPREDICT}/ApPredict.sh && \
  ln -s ${DIR_BUILD}/ApPredict/apps/src/ApPredict ${DIR_APPREDICT}/ && \
  ln -s ${DIR_BUILD}/Chaste/lib/*.so ${DIR_APPREDICT}/libs/ && \
  mkdir -p ${DIR_BUILD}/Chaste/heart/build/optimised_native/dynamic/ && \
  chmod o+rwX ${DIR_BUILD}/Chaste/heart/build/optimised_native/dynamic/ && \
  chmod o+rwX ${DIR_BUILD}/Chaste/heart/dynamic/
