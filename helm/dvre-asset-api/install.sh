#!/bin/bash
set -e

helm upgrade --install dvre-asset-api ./ -n asset-indexer -f dev-values.yaml
