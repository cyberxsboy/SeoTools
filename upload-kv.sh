#!/bin/bash

export PATH="$(npm bin):$PATH"

echo "Starting KV bulk put..."
wrangler kv:bulk put --binding=__STATIC_CONTENT --namespace-id=1a8a89365d0c4f7b876e4ab332fd51c1 --path=./public
echo "KV bulk put completed."
