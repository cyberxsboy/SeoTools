#!/bin/bash

export PATH="$(pwd)/node_modules/.bin:$PATH"

echo "Starting KV bulk put..."
./node_modules/.bin/wrangler kv:bulk put --binding=__STATIC_CONTENT --namespace-id=1a8a89365d0c4f7b876e4ab332fd51c1 --path=./public --prefix=public/
echo "KV bulk put completed."

echo "Listing KV keys for debugging:"
./node_modules/.bin/wrangler kv:key list --binding=__STATIC_CONTENT --namespace-id=1a8a89365d0c4f7b876e4ab332fd51c1
echo "KV key list completed."
