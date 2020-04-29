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

################################################################################
# CoreDNS - if no cluster DNS yet                                              #
################################################################################
#envsubst < coredns/coredns.yaml | microk8s.kubectl ${cmd} -f -

################################################################################
# MetalLB (standard layer 2 load balancing)                                    #
################################################################################
#kubectl ${cmd} -f metallb/metallb.yaml
#kubectl ${cmd} -f metallb/metallb.configmap.yaml

################################################################################
# Ingress                                                                      #
################################################################################
# configmaps, RBAC rules, deployment manifest
envsubst < ingress/dep-nginx-ingress-controller.yaml | microk8s.kubectl ${cmd} -f -
# load balancer service type
#kubectl ${cmd} -f ingress/svc-ingress.yaml
envsubst < ingress/svc-ingress-nodeport.yaml | microk8s.kubectl ${cmd} -f -

if [[ "${cmd}" == "delete" ]]; then
  microk8s.kubectl ${cmd} configmap ingress-controller-leader-nginx
fi

################################################################################
# AP-Nimbus components                                                         #
################################################################################
# k8s deployments (kubectl get deploy)
envsubst < ap-nimbus/deploy-appmanager.yaml | microk8s.kubectl ${cmd} -f -
envsubst < ap-nimbus/deploy-clientdirect.yaml | microk8s.kubectl ${cmd} -f -
envsubst < ap-nimbus/deploy-database.yaml | microk8s.kubectl ${cmd} -f -
envsubst < ap-nimbus/deploy-datastore.yaml | microk8s.kubectl ${cmd} -f -

# k8s services (kubectl get svc)
envsubst < ap-nimbus/svc-appmanager.yaml | microk8s.kubectl ${cmd} -f -
envsubst < ap-nimbus/svc-clientdirect.yaml | microk8s.kubectl ${cmd} -f -
envsubst < ap-nimbus/svc-database-headless.yaml | microk8s.kubectl ${cmd} -f -
envsubst < ap-nimbus/svc-datastore.yaml | microk8s.kubectl ${cmd} -f -

# k8s ingress routing config (kubectl get ing)
envsubst < ap-nimbus/ing-ap-nimbus.yaml | microk8s.kubectl ${cmd} -f -

################################################################################
# Test application                                                             #
################################################################################
#kubelct ${cmd} -f test/ing-nginx-app.yaml
#kubectl ${cmd} -f test/svc-nginx-app.yaml
#kubectl ${cmd} -f test/dep-nginx-app.yaml

