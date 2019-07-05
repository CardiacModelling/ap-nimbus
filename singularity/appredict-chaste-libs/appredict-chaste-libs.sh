su root

apk add --no-cache bash cmake g++ libxslt-dev make python-dev wget
addgroup -g 10101 appredict && \
  adduser -D -u 10101 -s /bin/bash -h ${HOME_DIR} -G appredict appredict

su appredict

mkdir -vp ${DIR_DOWNLOADS} ${DIR_CHASTE_LIBS} ${DIR_BUILD}

#------------------------------------------------------------------------------#
# 1.1. Download dependency packages                                            #
#------------------------------------------------------------------------------#

cd ${DIR_DOWNLOADS} && \
  wget http://ftp.mcs.anl.gov/pub/petsc/release-snapshots/petsc-lite-3.6.2.tar.gz && \
  wget https://www.mpich.org/static/downloads/3.2/mpich-3.2.tar.gz && \
  wget https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.8/hdf5-1.8.16/src/hdf5-1.8.16.tar.bz2 && \
  wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/f2cblaslapack-3.4.1.q.tar.gz && \
  wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/parmetis-4.0.2-p5.tar.gz && \
  wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/metis-5.0.2-p3.tar.gz && \
  wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/sundials-2.5.0.tar.gz && \
  wget http://ftp.mcs.anl.gov/pub/petsc/externalpackages/hypre-2.9.1a.tar.gz && \
  wget http://downloads.sourceforge.net/project/boost/boost/1.58.0/boost_1_58_0.tar.gz && \
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

cd ${DIR_BUILD} && \
  tar -zxf ${DIR_DOWNLOADS}/petsc-lite-3.6.2.tar.gz && \
  cd petsc-3.6.2 && \
  export PETSC_DIR=`pwd` && \
  export PETSC_ARCH=linux-gnu-opt && \
  ./configure --prefix=${DIR_CHASTE_LIBS} \
              --with-make-np=${BUILD_PROCESSORS} \
              --with-cc=gcc \
              --with-cxx=g++ \
              --with-fc=0 \
              --with-x=false \
              --with-ssl=false \
              --download-f2cblaslapack=${DIR_DOWNLOADS}/f2cblaslapack-3.4.1.q.tar.gz \
              --download-mpich=${DIR_DOWNLOADS}/mpich-3.2.tar.gz \
              --download-hdf5=${DIR_DOWNLOADS}/hdf5-1.8.16.tar.bz2 \
              --download-parmetis=${DIR_DOWNLOADS}/parmetis-4.0.2-p5.tar.gz \
              --download-metis=${DIR_DOWNLOADS}/metis-5.0.2-p3.tar.gz \
              --download-sundials=${DIR_DOWNLOADS}/sundials-2.5.0.tar.gz \
              --with-shared-libraries \
              --with-debugging=0 && \
  make all && \
  make install && \
  cd .. && \
  rm -rf petsc-3.6.2

cd ${DIR_BUILD} && \
  tar -zxf ${DIR_DOWNLOADS}/boost_1_58_0.tar.gz && \
  cd boost_1_58_0 && \
  ./bootstrap.sh --prefix=${DIR_CHASTE_LIBS} \
                 --with-libraries=system,filesystem,serialization,program_options && \
  ./b2 -j${BUILD_PROCESSORS} install && \
  cd .. && \
  rm -rf boost_1_58_0

cd ${DIR_BUILD} && \
  tar -zxf ${DIR_DOWNLOADS}/xerces-c-3.1.4.tar.gz && \
  cd xerces-c-3.1.4/ && \
  export XERCESCROOT=`pwd` && \
  ./configure --prefix=${DIR_CHASTE_LIBS} && \
  make -j${BUILD_PROCESSORS} all && \
  make install && \
  cd .. && \
  cp -v ${DIR_DOWNLOADS}/xsd-4.0.0+dep.tar.bz2 . && \
  bzip2 -d xsd-4.0.0+dep.tar.bz2 && \
  tar -xf xsd-4.0.0+dep.tar && \
  cd xsd-4.0.0+dep && \
  make -j${BUILD_PROCESSORS} CPPFLAGS=-I../xerces-c-3.1.4/src LDFLAGS=-L../xerces-c-3.1.4/src/.libs && \
  cp -v xsd/xsd/xsd ${DIR_CHASTE_LIBS}/bin/ && \
  cp -vr xsd/libxsd/xsd ${DIR_CHASTE_LIBS}/include/ && \
  cd .. && \
  rm -rf xerces-c-3.1.4 xsd-4.0.0+dep

mkdir -p ${DIR_CHASTE_LIBS}/lib/python2.7/site-packages && \
  mkdir -p ${DIR_CHASTE_LIBS}/lib64/python2.7/site-packages && \
  cd ${DIR_BUILD} && \
  tar -zxf ${DIR_DOWNLOADS}/4Suite-XML-1.0.2.tar.gz && \
  cd 4Suite-XML-1.0.2 && \
  python setup.py install --prefix=${DIR_CHASTE_LIBS} && \
  cd .. && \
  rm -rf 4Suite-XML-1.0.2 && \
  tar -zxf ${DIR_DOWNLOADS}/Amara-1.2.0.2.tar.gz && \
  cd Amara-1.2.0.2 && \
  python setup.py install --prefix=${DIR_CHASTE_LIBS} && \
  cd .. && \
  rm -rf Amara-1.2.0.2 && \
  tar -zxf ${DIR_DOWNLOADS}/html5lib-0.999.tar.gz && \
  cd html5lib-0.999 && \
  python setup.py install --prefix=${DIR_CHASTE_LIBS} && \
  cd .. && \
  rm -rf html5lib-0.999 && \
  tar -zxf ${DIR_DOWNLOADS}/lxml-3.4.4.tar.gz && \
  cd lxml-3.4.4 && \
  python setup.py install --prefix=${DIR_CHASTE_LIBS} && \
  cd .. && \
  rm -rf lxml-3.4.4 && \
  tar -zxf ${DIR_DOWNLOADS}/rdflib-4.2.1.tar.gz && \
  cd rdflib-4.2.1 && \
  python setup.py install --prefix=${DIR_CHASTE_LIBS} && \
  cd .. && \
  rm -rf rdflib-4.2.1 && \
  tar -zxf ${DIR_DOWNLOADS}/isodate-0.5.4.tar.gz && \
  cd isodate-0.5.4 && \
  python setup.py install --prefix=${DIR_CHASTE_LIBS} && \
  cd .. && \
  rm -rf isodate-0.5.4

rm -rf ${DIR_DOWNLOADS} ${DIR_BUILD}/*
