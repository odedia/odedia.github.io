---
layout: post
title: Get KUBECONFIG access token in PKS from Jenkins
description: Let developers get an access token for the kubernetes dashboard when kubectl is not allowed
image: assets/images/k8s-logo.png
type: tutorial
comments: true
---

In many enterprises, the idea of letting developers get access to `kubectl` is blasphemy. `kubectl` is a powerful CLI and if you don't have proper RBAC setup, you can do some serious damage. The path many enterprises take is to have pipelines do all the deployment to the kubernetes cluster.

Still, developers do require access to some aspects of the Kubernetes lifecycle, mainly the Kubernetes dashboard. However, that dashboard requires an access token that is found in the KUBECONFIG file.

In PKS, it is possible to get the KUBECONFIG file that includes the access token by using the `pks` cli, but if `kubectl` is off limits, the `pks` cli is **definetly** off limits. 

The solution? Run a script that talks to the UAA backend to get the access token. Pivotal and VMware provide a script under this [community support article](https://community.pivotal.io/s/article/script-to-automate-generation-of-the-kubeconfig-for-the-kubernetes-user).

However, even that can be a challenge for many enterprises. Windows is still king, and running shell scripts is not possible, let alone installation of additional utilities such as `jq`.

The solution? Get the access token from a Jenkins job that developers already have access to in their daily work.

Let's create a new Jenkins Freestyle job:

![]({{page.base_url}}/assets/images/jenkins-access-token/new-project.png)

Check the box to `Discard old builds` and set `Max # of builds to keep` to 0. You don't want to keep a history of the access tokens.

Check `This project is parameterized` and add the following parameters:


![]({{page.base_url}}/assets/images/jenkins-access-token/parameters.png)

Make sure that `PKS_PASSWORD_RAW` is set to type `Password Parameter`.

Under `Build` choose `Execute shell`:

![]({{page.base_url}}/assets/images/jenkins-access-token/shell.png)

Paste the following script. It has been modified from the original so it would not require `jq`:

```
#!/bin/bash -e
# v 0.0.5.1

# get-pks-k8s-config.sh
# gmerlin@vmware.com
# adapted for Jenkins by Oded Shopen (odedia.org)

urlencode() {
    local l=${#1}
    for (( i = 0 ; i < l ; i++ )); do
        local c=${1:i:1}
        case "$c" in
            [a-zA-Z0-9.~_-]) printf "$c" ;;
            ' ') printf + ;;
            *) printf '%%%.2X' "'$c"
        esac
    done
}


PKS_PASSWORD=$(urlencode $PKS_PASSWORD_RAW)

# Collect Tokens from UAA
CURL_CMD="curl 'https://${PKS_API}:8443/oauth/token' -sk -X POST -H 'Accept: application/json' -d \"client_id=pks_cluster_client&client_secret=\"\"&grant_type=password&username=${PKS_USER}&password=\"${PKS_PASSWORD}\"&response_type=id_token\""

TOKENS=$(eval $CURL_CMD | python -c "import sys, json; print json.load(sys.stdin)['id_token']" ) 
echo -e "\n"
echo $TOKENS
echo -e  "\n"
```

Save the job.

While running the job, provide all required parameters:

![]({{page.base_url}}/assets/images/jenkins-access-token/build.png)

The output will present your access token:

![]({{page.base_url}}/assets/images/jenkins-access-token/console.png)

Good luck!






