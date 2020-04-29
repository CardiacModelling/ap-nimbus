ARG alpine_version=3.8
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
# See http://nl.alpinelinux.org/alpine/v3.8/main/x86_64/   <-- Note: v3.8!
RUN apk add --no-cache bash cmake g++ libxslt-dev make python-dev wget
RUN addgroup -g 10101 appredict && \
    adduser -D -u 10101 -s /bin/bash -h /home/appredict -G appredict appredict

ENV USER=appredict
ENV PATH=${dir_chaste_libs}/bin:${PATH}
ENV LD_LIBRARY_PATH=${dir_chaste_libs}/lib
ENV PYTHONPATH=${dir_chaste_libs}/lib/python2.7/site-packages:${dir_chaste_libs}/lib64/python2.7/site-packages

USER appredict

RUN mkdir -p ${dir_downloads} ${dir_chaste_libs} ${dir_build}

#------------------------------------------------------------------------------#
# 1.1. Download dependency packages                                            #
#------------------------------------------------------------------------------#
RUN cd ${dir_downloads} && \
    wget http://ftp.mcs.anl.gov/pub/petsc/release-snapshots/petsc-lite-3.6.2.tar.gz && \
    wget https://www.mpich.org/static/downloads/3.2/mpich-3.2.tar.gz && \
    wget https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.8/hdf5-1.8.16/src/hdf5-1.8.16.tar.bz2 && \
    wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/f2cblaslapack-3.4.1.q.tar.gz && \
    wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/parmetis-4.0.2-p5.tar.gz && \
    wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/metis-5.0.2-p3.tar.gz && \
    wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/sundials-2.5.0.tar.gz && \
    wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/hypre-2.9.1a.tar.gz && \
    wget https://downloads.sourceforge.net/project/boost/boost/1.65.1/boost_1_65_1.tar.gz && \
    wget https://www.codesynthesis.com/download/xsd/4.0/xsd-4.0.0+dep.tar.bz2 && \
    wget https://archive.apache.org/dist/xerces/c/3/sources/xerces-c-3.1.4.tar.gz && \
    wget https://pypi.python.org/packages/source/4/4Suite-XML/4Suite-XML-1.0.2.tar.gz && \
    wget https://pypi.python.org/packages/source/A/Amara/Amara-1.2.0.2.tar.gz && \
    wget https://pypi.python.org/packages/source/h/html5lib/html5lib-0.999.tar.gz && \
    wget https://pypi.python.org/packages/source/i/isodate/isodate-0.5.4.tar.gz && \
    wget https://pypi.python.org/packages/source/l/lxml/lxml-3.4.4.tar.gz && \
    wget https://pypi.python.org/packages/source/r/rdflib/rdflib-4.2.1.tar.gz 

#------------------------------------------------------------------------------#
# 1.2. Build dependencies and place in ${dir_chaste_libs}                      #
#------------------------------------------------------------------------------#
RUN cd ${dir_build} && \
    tar -zxf ${dir_downloads}/petsc-lite-3.6.2.tar.gz && \
    cd petsc-3.6.2 && \
    export PETSC_DIR=`pwd` && \
    export PETSC_ARCH=linux-gnu-opt && \
    ./configure --prefix=${dir_chaste_libs} \
                --with-make-np=${build_processors} \
                --with-cc=gcc \
                --with-cxx=g++ \
                --with-fc=0 \
                --with-x=false \
                --with-ssl=false \
                --download-f2cblaslapack=${dir_downloads}/f2cblaslapack-3.4.1.q.tar.gz \
                --download-mpich=${dir_downloads}/mpich-3.2.tar.gz \
                --download-hdf5=${dir_downloads}/hdf5-1.8.16.tar.bz2 \
                --download-parmetis=${dir_downloads}/parmetis-4.0.2-p5.tar.gz \
                --download-metis=${dir_downloads}/metis-5.0.2-p3.tar.gz \
                --download-sundials=${dir_downloads}/sundials-2.5.0.tar.gz \
                --with-shared-libraries \
                --with-debugging=0 && \
    make all test && \
    make install && \
    cd .. && \
    rm -rf petsc-3.6.2

RUN cd ${dir_build} && \
    tar -zxf ${dir_downloads}/boost_1_65_1.tar.gz && \
    cd boost_1_65_1 && \
    ./bootstrap.sh --prefix=${dir_chaste_libs} \
                   --with-libraries=system,filesystem,serialization,program_options && \
    ./b2 -j${build_processors} install && \
    cd .. && \
    rm -rf boost_1_65_1

RUN cd ${dir_build} && \
    tar -zxf ${dir_downloads}/xerces-c-3.1.4.tar.gz && \
    cd xerces-c-3.1.4/ && \
    export XERCESCROOT=`pwd` && \
    ./configure --prefix=${dir_chaste_libs} && \
    make -j${build_processors} all && \
    make install && \
    cd .. && \
    cp -v ${dir_downloads}/xsd-4.0.0+dep.tar.bz2 . && \
    bzip2 -d xsd-4.0.0+dep.tar.bz2 && \
    tar -xf xsd-4.0.0+dep.tar && \
    cd xsd-4.0.0+dep && \
    make -j${build_processors} CPPFLAGS=-I../xerces-c-3.1.4/src LDFLAGS=-L../xerces-c-3.1.4/src/.libs && \
    cp -v xsd/xsd/xsd ${dir_chaste_libs}/bin/ && \
    cp -vr xsd/libxsd/xsd ${dir_chaste_libs}/include/ && \
    cd .. && \
    rm -rf xerces-c-3.1.4 xsd-4.0.0+dep

RUN mkdir -p ${dir_chaste_libs}/lib/python2.7/site-packages && \
    mkdir -p ${dir_chaste_libs}/lib64/python2.7/site-packages && \
    cd ${dir_build} && \
    tar -zxf ${dir_downloads}/4Suite-XML-1.0.2.tar.gz && \
    cd 4Suite-XML-1.0.2 && \
    python setup.py install --prefix=${dir_chaste_libs} && \
    cd .. && \
    rm -rf 4Suite-XML-1.0.2 && \
    tar -zxf ${dir_downloads}/Amara-1.2.0.2.tar.gz && \
    cd Amara-1.2.0.2 && \
    python setup.py install --prefix=${dir_chaste_libs} && \
    cd .. && \
    rm -rf Amara-1.2.0.2 && \
    tar -zxf ${dir_downloads}/html5lib-0.999.tar.gz && \
    cd html5lib-0.999 && \
    python setup.py install --prefix=${dir_chaste_libs} && \
    cd .. && \
    rm -rf html5lib-0.999 && \
    tar -zxf ${dir_downloads}/lxml-3.4.4.tar.gz && \
    cd lxml-3.4.4 && \
    python setup.py install --prefix=${dir_chaste_libs} && \
    cd .. && \
    rm -rf lxml-3.4.4 && \
    tar -zxf ${dir_downloads}/rdflib-4.2.1.tar.gz && \
    cd rdflib-4.2.1 && \
    python setup.py install --prefix=${dir_chaste_libs} && \
    cd .. && \
    rm -rf rdflib-4.2.1 && \
    tar -zxf ${dir_downloads}/isodate-0.5.4.tar.gz && \
    cd isodate-0.5.4 && \
    python setup.py install --prefix=${dir_chaste_libs} && \
    cd .. && \
    rm -rf isodate-0.5.4

RUN rm -rf ${dir_downloads} ${dir_build}/*
