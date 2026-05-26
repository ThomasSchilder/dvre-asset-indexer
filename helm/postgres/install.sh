
#!/bin/bash
set -e

helm install postgresql bitnami/postgresql -n postgres -f dev-values.yaml