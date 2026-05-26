#!/bin/bash
set -e

helm uninstall dvre-asset-indexer -n asset-indexer "$@"
