#!/bin/bash
set -e

helm upgrade blockscout blockscout/blockscout-stack -n blockscout -f dev-values.yaml