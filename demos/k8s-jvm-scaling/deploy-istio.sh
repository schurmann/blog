#!/usr/bin/env bash

NAMESPACE=istio-system
kubectl create namespace "$NAMESPACE"
helm upgrade -i istio ./istio -n "$NAMESPACE"

#kubectl wait --for=condition=Ready deployment/istiod -n "$NAMESPACE"
#kubectl delete "$(kubectl get pods -l istio=istio -o=name -n $NAMESPACE)" -n "$NAMESPACE"
