#!/usr/bin/env bash

# This script loads environment variables from a .env file,
# such that we can test our code locally

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "File not found: $ENV_FILE"
  exit 1
fi

while IFS= read -r line || [ -n "$line" ]; do
  # Ignore empty lines
  [ -z "$line" ] && continue

  # Ignore comments
  [[ "$line" =~ ^[[:space:]]*# ]] && continue

  # Export key=value
  export "$line"
done < "$ENV_FILE"

echo "Loaded environment from $ENV_FILE"