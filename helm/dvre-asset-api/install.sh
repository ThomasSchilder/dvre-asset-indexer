#!/bin/bash
set -e

helm install dvre-asset-api ./ -n asset-indexer "$@"
