#!/bin/bash

if [ $# -ne 1 ]; then
  echo ""
  echo "  One of {create,delete}"
  echo ""

  exit 1
fi

cmd=$1

if [[ "${cmd}" != "create" ]] && [[ "${cmd}" != "delete" ]]; then
  echo ""
  echo "  One of {create,delete}"
  echo ""

  exit 1
fi

#kubectl ${cmd} -f coredns/coredns.yaml
for yaml in `ls *\.y*ml`; do
  kubectl ${cmd} -f ${yaml}
done

