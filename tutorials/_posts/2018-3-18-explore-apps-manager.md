---
layout: post
title: Exploring Pivotal Cloud Foundry’s Apps Manager
description: Pivotal Cloud Foundry's Apps Manager exposes vital information to the Spring Boot developer
image: assets/images/apps-manager-explore.png
source: https://medium.com/@odedia/exploring-pivotal-cloud-foundrys-apps-manager-26d6a9c8ce76
type: tutorial #or post, random
---
* * *

This is a quick followup on “[Deploying Spring Boot App to Pivotal Cloud Foundry](https://medium.com/@odedia/deploy-spring-boot-application-to-pivotal-cloud-foundry-8bab62e7fbaf)”, that is meant to briefly show the available insights you can get from your app inside apps manager.

Apps manager, among other things, lets you obtain deep information about your running application, such its health, the events that occured, metrics etc.

The main page shows you the last events that occurred in the system and the currently running instances. You can also enable autoscaling at the push of a toggle.

![](https://cdn-images-1.medium.com/max/1600/1*m1b3gbR5lu1AZrRqHhfyOw.png)

Autoscaling can be configured based on various attributes, from CPU utilization to network latency.

![](https://cdn-images-1.medium.com/max/1600/1*wAUzYUxnYMWglgDdAB8Jog.png)

The **Trace** tab shows you the recent REST API calls made to your application:

![](https://cdn-images-1.medium.com/max/1600/1*UDLmp-H0pjk0Lkhy6lp-NQ.png)

The **Threads** tab provides visibility into all threads currently running in your JVM. You can also download a heap dump for offline investigation:

![](https://cdn-images-1.medium.com/max/1600/1*DYN9-fCMfBi-1V_qzaF0MA.png)

The **Logs** tab provides an aggregated view of all logs from all instances. You can also change the logging level per class/package at runtime without having to restart:

![](https://cdn-images-1.medium.com/max/1600/1*kDB8U3DtT-oeQmnjK8fdVg.png)

Clicking on **PCF Metrics** takes you to a full-blown monitoring dashboard where you can correlate system events along with the logs that happened at that time. Excellent for troubleshooting.

![](https://cdn-images-1.medium.com/max/1600/1*ssv0_oU0h_Mx8mXdCUXI1g.png)

Good luck, and happy coding!

_Oded Shopen_
