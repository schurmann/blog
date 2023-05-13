#!/usr/bin/env bash

NAMESPACE=istio-system
helm dependency update istio
kubectl create namespace "$NAMESPACE"
helm upgrade -i istio ./istio -n "$NAMESPACE"
kubectl -n $NAMESPACE wait --timeout=60s --for=condition=available deployment/istiod --timeout=2m
kubectl -n $NAMESPACE rollout restart deployment/gateway
