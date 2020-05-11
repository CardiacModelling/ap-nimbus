FROM cardiacmodelling/appredict-chaste-libs:0.0.3

################################################################################
# Modifiable (e.g. via command line) args.                                     #
################################################################################

ARG appredict_hash=f34b928
ARG appredict_branch=master
ARG chaste_hash=c4f5695
ARG chaste_branch=develop
ARG build_processors=1

################################################################################
# Local vars (not for modification!)                                           #
################################################################################

ARG home_dir=/home/appredict
ARG dir_appredict="${home_dir}/apps/ApPredict"
ARG dir_build="${home_dir}/build"
ARG dir_chaste_libs="${home_dir}/chaste-libs"

################################################################################
# 1. Build ApPredict from source                                               #
################################################################################

USER root
# See http://nl.alpinelinux.org/alpine/v3.8/main/x86_64/   <-- Note: v3.8!
RUN apk add --no-cache git libexecinfo-dev nano scons

USER appredict

RUN mkdir -p ${dir_build}

COPY --chown=appredict:appredict default.py.patch ${dir_build}/default.py.patch

#------------------------------------------------------------------------------#
# 1.1. Download Chaste & ApPredict source                                      #
#------------------------------------------------------------------------------#
RUN cd ${dir_build} && \
    git clone -b ${chaste_branch} https://github.com/Chaste/Chaste.git && \
    cd Chaste && \
    git checkout ${chaste_hash} && \
    git submodule update --init && \
    cd .. && \
    git clone -b ${appredict_branch} --recursive https://github.com/Chaste/ApPredict.git && \
    cd ApPredict && \
    git checkout ${appredict_hash} && \
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
RUN cd ${dir_build} && \
    sed -i -- "s|<chaste-libs-dir>|${dir_chaste_libs}/|g" default.py.patch && \
    patch -p0 < default.py.patch && \
    ln -sv ../../ApPredict Chaste/projects/ && \
    export USER=appredict && \
    export CHASTE_LIBS=${dir_chaste_libs} && \
    export LD_LIBRARY_PATH=${CHASTE_LIBS}/lib && \
    export PATH=${CHASTE_LIBS}/bin:${PATH} && \
    export PYTHONPATH=${CHASTE_LIBS}/lib/python2.7/site-packages:${CHASTE_LIBS}/lib64/python2.7/site-packages && \
    cd Chaste && \
    scons -j${build_processors} cl=1 b=GccOpt exe=1 projects/ApPredict/apps/src && \
    cd .. && \
    rm default.py.patch

RUN mkdir -p ${dir_appredict}/libs

COPY --chown=appredict:appredict ApPredict.sh ${dir_appredict}/ApPredict.sh

RUN sed -i -- "s|<chaste-libs-dir>|${dir_chaste_libs}|g" ${dir_appredict}/ApPredict.sh && \
    ln -s ${dir_build}/ApPredict/apps/src/ApPredict ${dir_appredict}/ && \
    ln -s ${dir_build}/Chaste/lib/*.so ${dir_appredict}/libs/ && \
    mkdir -p ${dir_build}/Chaste/heart/build/optimised/dynamic/ && \
    chmod o+rwX ${dir_build}/Chaste/heart/build/optimised/dynamic/ && \
    chmod o+rwX ${dir_build}/Chaste/heart/dynamic/ 

ENV CHASTE_TEST_OUTPUT=${dir_appredict}/testoutput

WORKDIR ${home_dir}
