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
microk8s.kubectl config view
echo ""

if [ "${cmd}" == "delete" ]; then
  microk8s.kubectl delete secret ${secret}
  microk8s.kubectl delete clusterrolebinding ${clusterrolebinding}
  microk8s.kubectl delete serviceaccount ${serviceaccount}
  microk8s.kubectl delete namespace ${namespace}
  microk8s.kubectl config use-context microk8s
  microk8s.kubectl config delete-context ${context}
  microk8s.kubectl config delete-cluster ${cluster}
elif [ "${cmd}" == "create" ]; then
  microk8s.kubectl config set-context ${context} --user=${user} --cluster=${cluster}
  microk8s.kubectl config use-context ${context}
  microk8s.kubectl config set-cluster ${cluster} --server=${apiserver} --insecure-skip-tls-verify
  microk8s.kubectl create namespace ${namespace}
  microk8s.kubectl config set-context ${context} --namespace=${namespace} 
  #microk8s.kubectl create -f ./namespace-dev.json
  microk8s.kubectl create serviceaccount ${serviceaccount}
  microk8s.kubectl create clusterrolebinding ${clusterrolebinding} --clusterrole=edit --serviceaccount=default:${serviceaccount}
  microk8s.kubectl create secret generic ${secret} --namespace=${namespace} --from-file=username=./username.txt --from-file=username=./password.txt
fi

echo ""
microk8s.kubectl config view
echo ""
