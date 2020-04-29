#!/bin/bash

. common

if [ $# -ne 1 ]; then
  echo ""
  echo "  One of {create,delete}"
  echo ""

  exit 1
fi

cmd=$1

echo ""
#kubectl config view
echo ""

if [ "${cmd}" == "delete" ]; then
  #kubectl delete secret ${secret}
  #kubectl delete clusterrolebinding ${clusterrolebinding}
  #kubectl delete serviceaccount ${serviceaccount}
  kubectl delete namespace ${namespace}
  #kubectl config use-context minikube
  #kubectl config delete-context ${context}
  #kubectl config delete-cluster ${cluster}
elif [ "${cmd}" == "create" ]; then
  #kubectl config set-context ${context} --user=${user} --cluster=${cluster}
  #kubectl config use-context ${context}
  #kubectl config set-cluster ${cluster} --server=${apiserver} --insecure-skip-tls-verify
  kubectl create namespace ${namespace}
  #kubectl config set-context ${context} --namespace=${namespace} 
  ##kubectl create -f ./namespace-dev.json
  #kubectl create serviceaccount ${serviceaccount}
  #kubectl create clusterrolebinding ${clusterrolebinding} --clusterrole=edit --serviceaccount=default:${serviceaccount}
  #kubectl create secret generic ${secret} --namespace=${namespace} --from-file=./username.txt --from-file=./password.txt
fi

echo ""
#kubectl config view
echo ""

