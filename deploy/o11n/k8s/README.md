# Kubernetes orchestration.

### [cluster](cluster)

Derived from earlier devstack work, this is a Fedora 30 package-install of `kubernetes` using a
VirtualBox VM as a "master" and "minion" and a spare laptop as a second "minion", with CoreDNS
added as a service and MetalLB as load balancing.

** Important: If you're trying Fedora 30 you may need `iptables --policy FORWARD ACCEPT` in
order to achieve inter-node communications! **

Info :

 1. https://kubernetes.io/docs/getting-started-guides/fedora/fedora_manual_config/

Starting ...

```
cd cluster/admin
./run.sh create
cd ../cluster
./run.sh create
```

Stopping ...

```
cd cluster
./run.sh delete
cd admin
./run.sh delete
```

### [azure](azure)

(Successful!) trial of the k8s on Azure.

### ~~[vanilla](vanilla)~~ (Deprecated: Using `cluster` above)

Useful for deriving the first set of `.yaml` files for k8s o11n but without ingress/loadbalancing
options.

Used [kompose](http://kompose.io/) version `1.17.0` to create the "vanilla" `.yaml`s, e.g.
 1. `cd <vanilla>`
 1. `cp <docker-compose-all.yml> docker-compose.yaml`
 1. `kompose convert`


### ~~[devstack](devstack)~~ (Deprecated: Using `cluster` above)

Eventually, after a long struggle, had it working for a while (after a fair bit of hacking) but
an update stuffed it up and time ran out trying to repair/update/reinstall.

All kinds of hardcoding going on in this lot! Currently, to get it working on a Fedora Atomic 27
cluster, I ...

 1. Update `/etc/hosts` on k8s masters and minions to define the correct IP address to use for my
    private, insecure image repo on my `toshiba-gef` server.
 1. Update `/etc/sysconfig/docker` to include `OPTIONS="--insecure-registry toshiba-gef:5000"` and
    then run `systemctl daemon-reload && systemctl restart docker`
 1. Until I get devstack's DNS working ok do the following (in this order)  ...

```
/usr/local/bin/kubectl create -f database-headless-service.yaml
/usr/local/bin/kubectl create -f database-deployment.yaml
/usr/local/bin/kubectl get --all-namespaces pod,rc,rs,deploy,deployments,pv,pvc,sc,rs,sts,svc,endpoints,ingress,node
# retrieve database endpoint (e.g. 10.100.90.7:27017) + adjust datastore-deployment.yaml WAIT_HOSTS
/usr/local/bin/kubectl create -f datastore-deployment.yaml
/usr/local/bin/kubectl create -f datastore-service.yaml
/usr/local/bin/kubectl get --all-namespaces pod,rc,rs,deploy,deployments,pv,pvc,sc,rs,sts,svc,endpoints,ingress,node
# retrieve datastore endpoint (e.g. 10.100.90.8:8118) + adjust appmanager-deployment.yaml REST_API_URL_DATA
/usr/local/bin/kubectl create -f appmanager-deployment.yaml
/usr/local/bin/kubectl create -f appmanager-service.yaml

/usr/local/bin/kubectl create -f default-backend.yml
/usr/local/bin/kubectl create -f nginx-ingress-controller-rbac.yml
/usr/local/bin/kubectl create -f nginx-ingress-controller.yml
/usr/local/bin/kubectl create -f nginx-ingress-controller-service.yml
/usr/local/bin/kubectl create -f ingress.yaml
# retrieve k8s cluster master IP (e.g. 192.168.1.250) + adjust clientdirect-deployment.yaml
/usr/local/bin/kubectl create -f clientdirect-deployment.yaml
/usr/local/bin/kubectl create -f clientdirect-service.yaml
```

Then visit, e.g., http://192.168.1.250:30080/
