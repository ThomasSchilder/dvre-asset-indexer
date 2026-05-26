#!/bin/bash
set -e

NAMESPACE="redis"
REDIS_PASSWORD=$(kubectl get secret infra-secrets -n ${NAMESPACE} -o jsonpath='{.data.redis-password}' | base64 -d)

echo "Connecting to Redis with password: $REDIS_PASSWORD"

kubectl run redis-client --rm --tty -i --restart='Never' \
  --namespace ${NAMESPACE} \
  --image registry-1.docker.io/bitnami/redis:latest \
  --command -- redis-cli -h redis-master -a "$REDIS_PASSWORD" ping