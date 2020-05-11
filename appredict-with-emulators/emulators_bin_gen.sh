#!/bin/bash

################################################################################
#                                                                              #
# Generate faster-loading *_generator_BINARY.arch files from .tgz-extracted    #
# *_generator.arch files (downloaded using emulators_fetch.sh)                 #
#                                                                              #
################################################################################

if [ $# -ne 2 ]; then
  echo ""
  echo "  Use is emulators_bin_gen.sh <processor count> <appredict to invoke>"
  echo "    e.g. emulators_bin_gen.sh 8 ./latest/ApPredict.sh"
  echo ""

  exit 1
fi

# Number of processors to use.
processors=$1
# ApPredict command to invoke.
appredict=$2

if [ -z "${processors}" ]; then
  echo ""
  echo "  Please adjust script to specify the max. number of processors to use! E.g. '4'"
  echo ""
  exit 99
fi

if [ -z "${appredict}" ]; then
  echo ""
  echo "  Please adjust script to specify the ApPredict to invoke! E.g. './latest/ApPredict.sh'"
  echo ""
  exit 99
fi

param_cal=" --pic50-cal 4 --pic50-spread-cal 0.1 "
param_herg=" --pic50-herg 4 --pic50-spread-herg 0.1 "
param_ik1=" --pic50-ik1 4 --pic50-spread-ik1 0.1 "
param_iks=" --pic50-iks 4 --pic50-spread-iks 0.1 "
param_ito=" --pic50-ito 4 --pic50-spread-ito 0.1 "
param_na=" --pic50-na 4 --pic50-spread-na 0.1 "
param_nal=" --pic50-nal 4 --pic50-spread-nal 0.1 "

#
# Read in the *_generator.arch files in the local directory and generate
# the command to run which would use it. Place each command in the array.
#
commands=()
for arch_file in `ls *_generator.arch`; do
  model=""
  if [[ "${arch_file}" =~ "shannon_wang_puglisi_weber_bers_2004_model_updated" ]]; then
    model=1
  elif [[ "${arch_file}" =~ "tentusscher_model_2006_epi" ]]; then
    model=2
  elif [[ "${arch_file}" =~ "MahajanShiferaw2008_units" ]]; then
    model=3
  elif [[ "${arch_file}" =~ "HundRudy2004_units" ]]; then
    model=4
  elif [[ "${arch_file}" =~ "grandi_pasqualini_bers_2010" ]]; then
    model=5
  elif [[ "${arch_file}" =~ "ohara_rudy_2011" ]]; then
    model=6
  elif [[ "${arch_file}" =~ "paci_hyttinen_aaltosetala_severi_ventricularVersion" ]]; then
    model=7
  elif [[ "${arch_file}" =~ "ohara_rudy_cipa_v1_2017" ]]; then
    model=8
  fi

  pacing_freq=""
  if [[ "${arch_file}" =~ "_1Hz" ]]; then
    pacing_freq="1"
  elif [[ "${arch_file}" =~ "_0.5Hz" ]]; then
    pacing_freq="0.5"
  fi

  channels=""
  if [[ "${arch_file}" =~ "_ICaL_" ]]; then
    channels+=${param_cal}
  fi
  if [[ "${arch_file}" =~ "_hERG_" ]]; then
    channels+=${param_herg}
  fi
  if [[ "${arch_file}" =~ "_IK1_" ]]; then
    channels+=${param_ik1}
  fi
  if [[ "${arch_file}" =~ "_IKs_" ]]; then
    channels+=${param_iks}
  fi
  if [[ "${arch_file}" =~ "_Ito_" ]]; then
    channels+=${param_ito}
  fi
  if [[ "${arch_file}" =~ "_INa_" ]]; then
    channels+=${param_na}
  fi
  if [[ "${arch_file}" =~ "_INaL_" ]]; then
    channels+=${param_nal}
  fi

  commands+=("${appredict} --model ${model} --plasma-concs 0 ${channels} --pacing-freq ${pacing_freq} --pacing-max-time 1 --credible-intervals")
done

#
# Traverse created commands and run (in parallel if more than one processor
# specified).
#
output_base=`pwd`/output
for ((i = 0; i < ${#commands[@]}; i++)); do
  # Create chaste output directory
  output_dir=${output_base}/${i}
  mkdir -p ${output_dir}
  # Run the ApPredict
  CHASTE_TEST_OUTPUT=${output_dir} ${commands[$i]} &

  idx=$((i + 1));
  if [[ $(($idx % ${processors})) == 0 ]]; then
    wait
    # Tidy up last <however many!>
    rm -rf ${output_base}/*
  fi
done
# Tidy up any dangling
wait
rm -rf ${output_base}/*
