
#!/bin/bash
set -e

# Install secrets
kubectl apply -f dev-secrets.yaml

# Install Postgres 18 using helm
helm install postgresql ./postgresql-18.6.7.tgz -n postgres -f dev-values.yaml