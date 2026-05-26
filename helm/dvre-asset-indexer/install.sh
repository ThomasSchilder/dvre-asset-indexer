#!/bin/bash
set -e

helm upgrade --install dvre-asset-indexer ./ -n asset-indexer -f dev-values.yaml
