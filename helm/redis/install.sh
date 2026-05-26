#!/bin/bash
set -e

# Install secrets
kubectl apply -f dev-secrets.yaml

# Install Redis using helm
helm install redis bitnami/redis -n redis -f dev-values.yaml