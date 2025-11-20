#!/bin/bash

export PATH="$(pwd)/node_modules/.bin:$PATH"

echo "Starting KV bulk put..."
./node_modules/.bin/wrangler kv:bulk put --binding=__STATIC_CONTENT --namespace-id=1a8a89365d0c4f7b876e4ab332fd51c1 --path=./public
echo "KV bulk put completed."
