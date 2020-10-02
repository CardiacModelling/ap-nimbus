FROM cardiacmodelling/appredict-no-emulators:0.0.7

################################################################################
# Modifiable (e.g. via command line) args.                                     #
################################################################################

ARG build_processors=1

################################################################################
# Local vars (not for modification!)                                           #
################################################################################

ARG home_dir=/home/appredict
ARG dir_appredict="${home_dir}/apps/ApPredict"

################################################################################
# 1. Download emulators and create binary versions of them.                    #
################################################################################

USER appredict

COPY --chown=appredict:appredict emulators_*.sh ${dir_appredict}/

RUN cd ${dir_appredict} && \
    ./emulators_fetch.sh && \
    ./emulators_bin_gen.sh ${build_processors} ./ApPredict.sh && \
    rm -rf *generator.arch *.tgz emulators_*.sh output

WORKDIR ${home_dir}
