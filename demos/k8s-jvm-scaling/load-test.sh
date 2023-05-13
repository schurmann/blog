#!/usr/bin/env bash

IP=$(kubectl -n istio-system get service gateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

hey -host "spring.local" -c 2 -q 10 -z 2m "http://$IP"