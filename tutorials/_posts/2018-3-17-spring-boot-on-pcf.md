---
layout: post
title: Deploy Spring Boot application to Pivotal Cloud Foundry
description: Is this tutorial even required?
image: assets/images/spring-boot.png
source: https://medium.com/@odedia/deploy-spring-boot-application-to-pivotal-cloud-foundry-8bab62e7fbaf
type: tutorial #or post, random
---
* * *

In this tutorial, I will guide you through setting up a working instance of a Spring Boot application on Pivotal Cloud Foundry. It was inspired by a tutorial I read, explaining how to [deploy a Spring Boot app on OpenShift 3](https://medium.com/@pablo127/deploy-spring-boot-application-to-openshift-3-next-gen-2b311f55f0c5). While the article is well written, I couldn’t get over the fact that it requires a lot of boilerplate steps and configuration just to get a hello world up and running, so I thought I’ll clarify how simple it is on the other side of the fence.

#### Prepare a Spring Boot app

To deploy a Spring Boot application you need to have a compiled jarfile.

As an example we can clone [spring-boot-docker sample project](https://github.com/spring-guides/gs-spring-boot-docker). In the “complete” folder, you can build the project:

```
cd complete
./mvnw clean package
```


> Make sure you have setup a free trial account with Pivotal Web Services at run.pivotal.io. You have a 2gb ram limit and your application will not be shut down during the trial

1.  login to your PCF Cluster:

```
iMac5k:~ demo$ cf login -a api.run.pivotal.io
```

2\. Run the cf push command:

```
iMac5k:target demo$ cf push spring-boot-docker-0.1.0 -p gs-spring-boot-docker-0.1.0.jar
```

You can check the app is running by going to [https://spring-boot-docker-010.cfapps.io](https://spring-boot-docker-010.cfapps.io). Notice the application is protected by SSL/TLS by default:

![](https://cdn-images-1.medium.com/max/1600/1*XfrKsoe35xkBbhAXtfwxjg.png)

That’s it, we’re done! If you want to learn about viewing your application in PWS apps manager, [click here]({% post_url /tutorials/2018-3-18-explore-apps-manager %}).

In this tutorial, I explained how to deploy a Spring boot application to Pivotal Cloud Foundry. I hope you found it useful, educating, and (hopefully…) amusing ;)

Good luck, and happy coding!

_Oded Shopen_
