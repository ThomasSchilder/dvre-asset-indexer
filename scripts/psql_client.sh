#!/bin/bash
set -e

POSTGRES_PASSWORD=$(kubectl get secret infra-secrets -n postgres -o jsonpath='{.data.postgres-password}' | base64 -d)
POD_NAME="postgresql-client"
NAMESPACE="postgres"


if kubectl get pod "$POD_NAME" -n "$NAMESPACE" &>/dev/null; then
  echo "Pod already exists, attaching..."
  kubectl exec -it "$POD_NAME" -n "$NAMESPACE" -- psql --host postgresql -U postgres -d postgres -p 5432
else
  echo "Creating pod and connecting..."
  kubectl run "$POD_NAME" --rm --tty -i --restart='Never' \
    --namespace "$NAMESPACE" \
    --image registry-1.docker.io/bitnami/postgresql:latest \
    --env="PGPASSWORD=$POSTGRES_PASSWORD" \
    --command -- psql --host postgresql -U postgres -d postgres -p 5432
fi