#!/bin/bash
#
# Not setting to `-e` above so that any problem with ApPredict invocation or
# runtime will result in the removal of the run directory.
#

# Set run and results directories to unique non-existent directories.
# These directory values do NOT have trailing path separators.
run_dir=$1
res_dir=$2

# ApPredict args
appredict_args="${@:3}"

argCnt=$#

if [ "${argCnt}" -lt 3 ]; then
  echo ""
  echo "ERROR : Incorrect ./run_me.sh invocation from server.js"
  echo "ERROR : Expected at lease 3 args, but ${argCnt} supplied!"
  echo ""
  exit 1
fi

if [ -d ${res_dir} ]; then
  echo "ERROR : Results directory must not exist prior to ApPredict invocation!"
  exit 2
fi

output_dir=${res_dir}/ApPredict_output
mkdir -p ${output_dir}

if [ -d ${run_dir} ]; then
  echo "ERROR : Run directory must not exist prior to ApPredict invocation!" >> ${output_dir}/FAILED
  exit 3
fi
mkdir -p ${run_dir}

pushd ${run_dir}
appredict="/home/appredict/apps/ApPredict/ApPredict.sh"
if [ ! -e "${appredict}" ]; then
  # May end up here if script is not being run in a container!
  echo "ERROR : Failed to find ${appredict}"

  echo "${appredict} not found!" > ${output_dir}/FAILED
  # Provisional "failure to run" mechanism....
  # server.js doesn't react to progress file creation, only modification!
  touch ${output_dir}/progress_status.json
  # Wait a second to allow watching mechanism to acknowledge a separate creation and modification!
  sleep 1
  echo "[ \"** Error! app-manager's run_me.sh could not find ${appredict}! **\" ]" > ${output_dir}/progress_status.json
  # Delay to try to capture above progress in UI before UI stops polling.
  sleep 9
else
  CHASTE_TEST_OUTPUT=${run_dir} ${appredict} ${appredict_args}

  # Keeping the below because when run with Paci (model 9) it crashes at 300uM!
  #CHASTE_TEST_OUTPUT=${run_dir} ${appredict} --model 9 \
  #                                           --pacing-max-time 2.00 \
  #                                           --pic50-herg 4.99 4.91 4.75 4.9 4.77 --hill-herg 1.32 1.42 1.49 1.33 1.86 --saturation-herg 0 0 0 0 0 \
  #                                           --plasma-concs 0.01 0.03 0.1 0.3 1 3 10 30 100 300 --plasma-conc-logscale true

  retVal=$?
  if [ ${retVal} -ne 0 ]; then
    # Could have arrived here prior to first conc or towards end of sim!
    echo "${appredict} run failed!" > ${output_dir}/FAILED
    # TODO: May be overwriting valid content, e.g. if crashed at end of sim.
    echo "[ \"** ${appredict} failed to complete! **\" ]" > ${output_dir}/progress_status.json
    # Delay to try to capture above progress in UI before UI stops polling.
    sleep 10
  fi
fi

popd

# Sure-fire indicator that simulation has finished (to ensure UI stops polling)
echo "" >> ${output_dir}/STOP

rm -rf ${run_dir}
