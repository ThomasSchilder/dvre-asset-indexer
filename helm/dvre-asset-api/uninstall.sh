#!/bin/bash
set -e

helm uninstall dvre-asset-api -n asset-indexer "$@"
