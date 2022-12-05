---
layout: "../../layouts/BlogPost.astro"
title: "Scaling JVM deployments on Kubernetes"
description: "Use Istio for scaling JVM deployments with HPA"
pubDate: "3 December 2022"
heroImage: "/placeholder-hero.jpg"
---

This post is about the complexity with scaling JVM apps on K8S.

A good scaling strategy is crucial when the traffic increases at your services it's not straightforward to
implement. At the very basic level you can have a HorizontalAutoScaler (HPA) scale up the deployment with more
replicas based on resource utilization. In this post I will bring up how to scale a Spring Boot app that where we want
to minimize latency spikes.

I choose Spring Boot in particular because it's running on the JVM and therefore inhibits some special properties:

* Requires lots of CPU at cold start
* The JVM requires a warm-up period before being able to respond to requests with optimal performance

### How to define CPU requests/limits to handle cold start?

There are three options for defining CPU resources:

1. Set `requests.cpu` to less than cpu.limits

```yaml
requests:
  cpu: 200m
limits:
  cpu: 1000m
```

2. Set only `requests.cpu` and skip `cpu.limits`

```yaml
requests:
  cpu: 200m
```

3. Set requests.cpu to the same as limits.cpu

```yaml
requests:
  cpu: 200m
limits:
  cpu: 200m
```

The reasoning for option #1 is that requests.cpu is set to a baseline where the app will function well under normal
load and allow it to use more CPU up to the limit during start and under high load. A limit is set to avoid being the
noisy neighbour and leave some CPU to other processes on the node.

From the application developers perspective, option #2 is a great alternative since it allows the app to use any excess
CPU available without being limited. Excess CPU resources are distributed relative based on the amount of CPU
requested. [^qos-keep]
However, the platform operator might not be comfortable with containers running without limits since they might not be
well-behaved.

Both option #1 and #2 suffer from a hidden problem that will occur when the node is under high load. The app might not
be able to claim more CPU when needed if the underlying node doesn't have any excess CPU. There will also be a problem
with scaling based on CPU limits since the app will never reach X% of the limits.

If we can find a number to use for both `requests.cpu` and `limits.cpu` that satisfies our duration requirements on the
cold
start it is a viable middle-ground. The behaviour will be much more predictable since the app will operate under the
same conditions at all time.

### Quality of Service

Another aspect that I haven't talked about is Quality of Service (QoS). There are three QoS classes in k8s[^qos-k8s]:

* Guaranteed
  > Pods are considered top-priority and are guaranteed to not be killed until they exceed their limits. [^qos-medium]
* Burstable
  > Pods have some form of minimal resource guarantee, but can use more resources when available. Under system memory
  pressure, these containers are more likely to be killed once they exceed their requests and no Best-Effort pods
  exist. [^qos-medium]
* BestEffort
  > Pods will be treated as lowest priority. Processes in these pods are the first to get killed if the system runs out
  of memory. These containers can use any amount of free memory in the node though. [^qos-medium]

Both option #1 and #2 will have a QoS of Burstable, while option #3 will be Guaranteed.

### What metrics to use for scaling?

### Links

https://jaanhio.me/blog/kubernetes-cpu-requests-limits/

https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#cpu-units

https://developers.redhat.com/articles/2022/04/19/java-17-whats-new-openjdks-container-awareness

https://blog.cloudowski.com/articles/three-qos-classes-in-kubernetes

[^qos-medium]: https://medium.com/google-cloud/quality-of-service-class-qos-in-kubernetes-bb76a89eb2c6

[^qos-k8s]: https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/

[^qos-keep]: https://github.com/kubernetes/design-proposals-archive/blob/8da1442ea29adccea40693357d04727127e045ed/node/resource-qos.md#compressible-resource-guarantees