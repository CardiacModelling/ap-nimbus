ARG alpine_version=3.12
FROM "alpine:${alpine_version}"

################################################################################
# Modifiable (e.g. via command line) args.                                     #
################################################################################

ARG build_processors=1

################################################################################
# Local vars (not for modification!)                                           #
################################################################################

ARG home_dir=/home/appredict
ARG dir_build="${home_dir}/build"
ARG dir_chaste_libs="${home_dir}/chaste-libs"
ARG dir_downloads="${home_dir}/downloads"

################################################################################
# 1. Install "chaste-libs" - ApPredict's dependencies                          #
#                                                                              #
# https://chaste.cs.ox.ac.uk/trac/wiki/InstallGuides/DependencyVersions        #
# https://chaste.cs.ox.ac.uk/trac/wiki/InstallGuides/InstallGuide              #
################################################################################

USER root
# See http://nl.alpinelinux.org/alpine/v3.12/main/x86_64/   <-- Note: v3.12!
# Note need to set up /usr/bin/python symlink to point to python3
RUN apk add --no-cache bash cmake g++ libxslt-dev make patch python3-dev wget && rm -f /usr/bin/python && ln -s /usr/bin/python3 /usr/bin/python

RUN addgroup -g 10101 appredict && \
    adduser -D -u 10101 -s /bin/bash -h /home/appredict -G appredict appredict

ENV USER=appredict
ENV PATH=${dir_chaste_libs}/bin:${PATH}
ENV LD_LIBRARY_PATH=${dir_chaste_libs}/lib

USER appredict

RUN mkdir -p ${dir_downloads} ${dir_chaste_libs} ${dir_build}

#------------------------------------------------------------------------------#
# 1.1. Download dependency packages                                            #
#------------------------------------------------------------------------------#

RUN cd ${dir_downloads} && \
    wget https://ftp.mcs.anl.gov/pub/petsc/release-snapshots/petsc-lite-3.12.4.tar.gz && \
    wget https://www.mpich.org/static/downloads/3.2/mpich-3.2.tar.gz && \
    wget https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.8/hdf5-1.8.16/src/hdf5-1.8.16.tar.bz2 && \
    wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/sundials-2.5.0.tar.gz && \
    wget https://downloads.sourceforge.net/project/boost/boost/1.65.1/boost_1_65_1.tar.gz && \
    wget https://www.codesynthesis.com/download/xsd/4.0/xsd-4.0.0+dep.tar.bz2 && \
    wget https://archive.apache.org/dist/xerces/c/3/sources/xerces-c-3.2.0.tar.gz 

#------------------------------------------------------------------------------#
# 1.2. Build dependencies and place in ${dir_chaste_libs}                      #
#------------------------------------------------------------------------------#

RUN cd ${dir_build} && \
    tar -zxf ${dir_downloads}/petsc-lite-3.12.4.tar.gz && \
    cd petsc-3.12.4 && \
    export PETSC_DIR=`pwd` && \
    export PETSC_ARCH=linux-gnu-opt && \
    ./configure --prefix=${dir_chaste_libs} \
                --with-make-np=${build_processors} \
                --with-cc=gcc \
                --with-cxx=g++ \
                --with-fc=0 \
                --with-x=false \
                --with-ssl=false \
                --download-f2cblaslapack=1 \
                --download-mpich=${dir_downloads}/mpich-3.2.tar.gz \
                --download-hdf5=${dir_downloads}/hdf5-1.8.16.tar.bz2 \
                --download-parmetis=1 \
                --download-metis=1 \
                --download-sundials=1 \
                --with-shared-libraries \
                --with-debugging=0 && \
    make all test && \
    make install && \
    cd .. && \
    rm -rf petsc-3.12.4

RUN cd ${dir_build} && \
    tar -zxf ${dir_downloads}/boost_1_65_1.tar.gz && \
    cd boost_1_65_1 && \
    ./bootstrap.sh --prefix=${dir_chaste_libs} \
                   --with-libraries=system,filesystem,serialization,program_options && \
    ./b2 -j${build_processors} install && \
    cd .. && \
    rm -rf boost_1_65_1

RUN cd ${dir_build} && \
    tar -zxf ${dir_downloads}/xerces-c-3.2.0.tar.gz && \
    cd xerces-c-3.2.0/ && \
    export XERCESCROOT=`pwd` && \
    ./configure --prefix=${dir_chaste_libs} && \
    make -j${build_processors} all && \
    make install && \
    cd .. && \
    cp -v ${dir_downloads}/xsd-4.0.0+dep.tar.bz2 . && \
    bzip2 -d xsd-4.0.0+dep.tar.bz2 && \
    tar -xf xsd-4.0.0+dep.tar && \
    cd xsd-4.0.0+dep && \
    make -j${build_processors} CPPFLAGS=-I../xerces-c-3.2.0/src LDFLAGS=-L../xerces-c-3.2.0/src/.libs && \
    cp -v xsd/xsd/xsd ${dir_chaste_libs}/bin/ && \
    cp -vr xsd/libxsd/xsd ${dir_chaste_libs}/include/ && \
    cd .. && \
    rm -rf xerces-c-3.2.0 xsd-4.0.0+dep

RUN rm -rf ${dir_downloads} ${dir_build}/*
