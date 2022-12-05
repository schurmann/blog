#!/usr/bin/env bash

NAMESPACE=spring-demo
kubectl create namespace "$NAMESPACE"
kubectl label namespace "$NAMESPACE" istio-injection=enabled
helm upgrade -i spring-demo ./spring-demo/helm -n "$NAMESPACE"
