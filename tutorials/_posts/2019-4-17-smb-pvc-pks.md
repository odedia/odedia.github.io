---
layout: post
title: CIFS/SMB FlexVolume driver for PKS
description: Allow your Kubernetes cluster to access a server via the SMB protocol using Kubernetes Persistent Volumes
image: assets/images/smb-pks.png
source: https://github.com/odedia/kubernetes-volume-drivers/tree/master/flexvolume/smb
type: tutorial
---

I've recently had a customer request to access an SMB server from their PKS Kubernetes cluster. SMB is still incredibly popular in Enterprises, often used as part of a "whitelisting" process.

Still, being Kubernetes, it would be nice to treat an SMB share as yet another Persistent Volume and abstract away the protocol being used.

I've found a few solutions for this online, but the only one that seemed valuable and from a well known vendor was the [FlexVolume for Azure by Microsoft](https://github.com/Azure/kubernetes-volume-drivers). This project exposes several Azure services as PersistentVolumes to Kubernetes.

The drawback of this project is that it was developed specifically for Azure and AKS (Azure Kubernetes Service).

The biggest issue was that the installation required you to install specific binaries on the worker nodes, specifically `jq`. While that may be a feasible outcome on AKS, it was not a realistic approach for PKS. In PKS, BOSH manages the Worker nodes, patches them, upgrades then or just repaves (i.e. resets) them to a known state. Therefore, any "snowflake" binary installation on the working nodes would disappear on the next upgrade cycle.

I've been working with my collegue Stuart Charlton ([@svrc](https://twitter.com/svrc?lang=en)) to come up with a solution, and we came up with [this fork](https://github.com/odedia/kubernetes-volume-drivers/tree/master/flexvolume/smb).

It differs from the upstream Azure project in the following ways:

1. `hostPath` settings are set to match their expected location on PKS.
2. `jq` is being installed as part of the DameonSet deployment to Kubernetes, so no prior installation is required. Upon upgrade/resize of the cluster, each new/upgraded node would run the DameonSet again and install `jq` again. Microsoft states that  `cifs-utils` is another required binary but it is included in the PKS distribution so it already exists on the worker nodes.

I tested this on a PKS 1.3 cluster. I was able to resize, repave and upgrade the cluster, and the SMB persistent volume was still there waiting for me.

## Prerequisites
You will need a Kubernetes clusters where `Privileged Containers` are enabled. Under your Plan settings in Ops Manager, check the box for `Enable Privileged Containers - Use with caution` and `Disable DenyEscalatingExec`:

![]({{page.base_url}}/assets/images/privileged-containers.png)

You will need an Egress network policy in your Kubernetes Cluster to allow outbound traffic on port 445 (SMB). If you're running PKS on-premise with NSX-T, it's as easy as applying a Network Policy yaml. For example:

```
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
    name: smb-network-policy
    namespace: default
spec:
    podSelector:
      matchLabels:
        app: nginx-flex-smb
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: <your target IP Block>/32
    ports:
    - protocol: TCP
      port: 445

```

Persistent Volumes also require a default storage class. If you're running PKS on vSphere, you can create the default storage class with the yaml below:

```
  kind: StorageClass
  apiVersion: storage.k8s.io/v1
  metadata:
    name: thin
    annotations:
      storageclass.kubernetes.io/is-default-class: "true"
  provisioner: kubernetes.io/vsphere-volume
  parameters:
      diskformat: thin

```

Apply the Storage Class:

```
kubectl apply -f storage-class-vsphere.yml
```

## How to Install

Create a DaemonSet with the FlexVolume driver. A DaemonSet is a pod that runs on each one of the worker nodes in Kubernetes.

```
kubectl apply -f https://raw.githubusercontent.com/odedia/kubernetes-volume-drivers/master/flexvolume/smb/deployment/smb-flexvol-installer.yaml
```

Check DaemonSet status:

```
watch kubectl describe daemonset smb-flexvol-installer --namespace=kube-system
watch kubectl get po --namespace=kube-system -o wide
```
Once you see your pods in a `Running` state, you can continue.

Create a Kubernetes `secret` to hold your SMB credentials:

```
kubectl create secret generic smbcreds --from-literal username=USERNAME --from-literal password="PASSWORD" --type="microsoft.com/smb"
```
Replace USERNAME and PASSWORD with your credentials.

## Running a pod with direct mount

You can define the SMB access on the pod definition itself, or via a persistent volume claim. For direct configuration, you will need to define the `volumes` section of your `Pod` definition. Here's  a sample Pod you can use for testing:

```
https://raw.githubusercontent.com/odedia/kubernetes-volume-drivers/master/flexvolume/smb/nginx-flex-smb.yaml
```

Edit the yaml contents and replace the `source` line with the address of your SMB server and shared folder.

Once done, apply the yaml:

```
kubectl apply -f nginx-flex-smb.yaml
```

## Running a pod with mount via Persistent Volume Claim

You can setup the SMB share via a Persistent Volume Claim (PVC). 

Download the Persistent Volume (PV) yaml:

```
wget https://raw.githubusercontent.com/odedia/kubernetes-volume-drivers/master/flexvolume/smb/pv-smb-flexvol.yaml
```

Edit the yaml contents and replace the `source` line with the address of your SMB server and shared folder. Apply the changes:

```
kubectl apply -f pv-smb-flexvol.yaml
```

Create a PVC that is bound to the newly created persistent volume:
```
 kubectl apply -f https://raw.githubusercontent.com/odedia/kubernetes-volume-drivers/master/flexvolume/smb/pvc-smb-flexvol.yaml
```

Check the status of the PV and the PVC:

```
kubectl get pv
kubectl get pvc
```

Run a test pod with this PVC:

```
 kubectl apply -f https://raw.githubusercontent.com/odedia/kubernetes-volume-drivers/master/flexvolume/smb/nginx-flex-smb-pvc.yaml
```

## Verify the volume mount

SSH into the pod:

```
kubectl exec -it nginx-flex-smb -- bash
```

Run `df -h`. You should see your SMB share mounted under `/data`:

```
root@nginx-flex-smb:/# df -h
Filesystem                                 Size  Used Avail Use% Mounted on
overlay                                    291G  3.2G  288G   2% /
tmpfs                                      3.4G     0  3.4G   0% /dev
tmpfs                                      3.4G     0  3.4G   0% /sys/fs/cgroup
//myfileserver.com/my-shared-folder   		25G   64K   25G   1% /data
/dev/sda1                                  291G  3.2G  288G   2% /etc/hosts
shm                                         64M     0   64M   0% /dev/shm
tmpfs                                      3.4G   12K  3.4G   1% /run/secrets/kubernetes.io/serviceaccount
tmpfs                                      3.4G     0  3.4G   0% /sys/firmware
```


