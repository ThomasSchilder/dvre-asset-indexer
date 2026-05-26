#!/bin/bash
set -e

helm install dvre-asset-indexer ./ -n asset-indexer "$@"
