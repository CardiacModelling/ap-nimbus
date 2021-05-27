FROM cardiacmodelling/appredict-chaste-libs:0.0.4

################################################################################
# Modifiable (e.g. via command line) args.                                     #
################################################################################

ARG appredict_hash=9599e97929d8b684281771d916699a78e4bb6dca
ARG appredict_branch=master
ARG chaste_hash=682dce06c8274d86cbd3cba0e14afc3824687776
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
RUN apk add --no-cache git libexecinfo-dev nano scons && rm -f /usr/bin/python && ln -s /usr/bin/python3 /usr/bin/python

USER appredict

RUN mkdir -p ${dir_build}

COPY --chown=appredict:appredict default.py.patch ${dir_build}/default.py.patch

#------------------------------------------------------------------------------#
# 1.1. Download Chaste & ApPredict source                                      #
#------------------------------------------------------------------------------#
RUN cd ${dir_build} && \
    git clone -b ${chaste_branch} https://github.com/Chaste/Chaste.git Chaste && \
    cd Chaste && \
    git checkout ${chaste_hash} && \
    git submodule update --init && \
    cd .. && \
    git clone -b ${appredict_branch} --recursive https://github.com/Chaste/ApPredict.git && \
    cd ApPredict && \
    git checkout ${appredict_hash} && \
    cd src/cellml/cellml/ &&
    rm !(shannon_wang_puglisi_weber_bers_2004.cellml|ten_tusscher_model_2006_epi.cellml|mahajan_shiferaw_2008.cellml|hund_rudy_2004.cellml|grandi_pasqualini_bers_2010_ss.cellml|ohara_rudy_2011_endo.cellml|paci_hyttinen_aaltosetala_severi_ventricularVersion.cellml|ohara_rudy_cipa_v1_2017.cellml)

#------------------------------------------------------------------------------#
# 1.2. Download additional models                                              #
#------------------------------------------------------------------------------#

# Bring in your own additional models here.
# Please note: cellml file names must be different from those in section 1.1.
# For example:
# RUN cd ${dir_build}\ApPredict\src\extra_models && wget http://.... (location to your own models)

#------------------------------------------------------------------------------#
# 1.3. Build ApPredict and deploy                                              #
#------------------------------------------------------------------------------#
RUN cd ${dir_build} && \
    sed -i -- "s|<chaste-libs-dir>|${dir_chaste_libs}/|g" default.py.patch && \
    patch -p0 < default.py.patch && \
    ln -sv ../../ApPredict Chaste/projects/ && \
    export USER=appredict && \
    export CHASTE_LIBS=${dir_chaste_libs} && \
    export LD_LIBRARY_PATH=${CHASTE_LIBS}/lib && \
    export PATH=${CHASTE_LIBS}/bin:${PATH} && \
    cd Chaste && \
    scons -j${build_processors} cl=1 b=GccOpt exe=1 projects/ApPredict/apps/src && \
    cd .. && \
    rm default.py.patch

# Make the script directory writable so as to allow ApPredict to potentially
# download a lookup table manifest and table.

RUN mkdir -p ${dir_appredict}/libs && \
    chmod o+rwx ${dir_appredict}

COPY --chown=appredict:appredict ApPredict.sh ${dir_appredict}/ApPredict.sh

RUN sed -i -- "s|<chaste-libs-dir>|${dir_chaste_libs}|g" ${dir_appredict}/ApPredict.sh && \
    ln -s ${dir_build}/ApPredict/apps/src/ApPredict ${dir_appredict}/ && \
    ln -s ${dir_build}/Chaste/lib/*.so ${dir_appredict}/libs/ && \
    mkdir -p ${dir_build}/Chaste/heart/build/optimised/dynamic/ && \
    chmod o+rwX ${dir_build}/Chaste/heart/build/optimised/dynamic/ && \
    chmod o+rwX ${dir_build}/Chaste/heart/dynamic/ 

ENV CHASTE_TEST_OUTPUT=${dir_appredict}/testoutput

WORKDIR ${home_dir}
