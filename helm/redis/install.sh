#!/bin/bash
set -e

helm install redis bitnami/redis -n redis -f dev-values.yaml