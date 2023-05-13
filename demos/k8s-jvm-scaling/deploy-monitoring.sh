#!/usr/bin/env bash

NS=istio-system
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.17/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.17/samples/addons/grafana.yaml

kubectl -n $NS patch cm prometheus --patch-file ./monitoring/prometheus-patch.yaml
kubectl -n $NS wait --for=condition=Available=True deployment/grafana --timeout=2m
kubectl -n $NS port-forward service/grafana 3001:3000 &
sleep 3

curl -d @monitoring/dashboard-req.json http://localhost:3001/api/dashboards/db -H 'Accept: application/json' -H 'Content-Type: application/json'

kill %1 # Kill first job
