#!/bin/bash
set -e

helm install blockscout blockscout/blockscout-stack -n blockscout -f dev-values.yaml