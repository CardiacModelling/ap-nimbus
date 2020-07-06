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
kubectl ${cmd} -f coredns/coredns.yaml

################################################################################
# MetalLB (standard layer 2 load balancing)                                    #
################################################################################
#kubectl ${cmd} -f metallb/metallb.yaml
#kubectl ${cmd} -f metallb/metallb.configmap.yaml

################################################################################
# Ingress                                                                      #
################################################################################
# configmaps, RBAC rules, deployment manifest
kubectl ${cmd} -f ingress/dep-nginx-ingress-controller.yaml
# load balancer service type
#kubectl ${cmd} -f ingress/svc-ingress.yaml
kubectl ${cmd} -f ingress/svc-ingress-nodeport.yaml

if [[ "${cmd}" == "delete" ]]; then
  kubectl ${cmd} configmap ingress-controller-leader-nginx
fi

################################################################################
# AP-Nimbus components                                                         #
################################################################################
# k8s deployments (kubectl get deploy)
kubectl ${cmd} -f ap-nimbus/deploy-appmanager.yaml
kubectl ${cmd} -f ap-nimbus/deploy-clientdirect.yaml
kubectl ${cmd} -f ap-nimbus/deploy-database.yaml
kubectl ${cmd} -f ap-nimbus/deploy-datastore.yaml

# k8s services (kubectl get svc)
kubectl ${cmd} -f ap-nimbus/svc-appmanager.yaml
kubectl ${cmd} -f ap-nimbus/svc-clientdirect.yaml
kubectl ${cmd} -f ap-nimbus/svc-database-headless.yaml
kubectl ${cmd} -f ap-nimbus/svc-datastore.yaml

# k8s ingress routing config (kubectl get ing)
kubectl ${cmd} -f ap-nimbus/ing-ap-nimbus.yaml

################################################################################
# Test application                                                             #
################################################################################
#kubelct ${cmd} -f test/ing-nginx-app.yaml
#kubectl ${cmd} -f test/svc-nginx-app.yaml
#kubectl ${cmd} -f test/dep-nginx-app.yaml

