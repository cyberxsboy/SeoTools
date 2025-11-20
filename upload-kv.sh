#!/bin/bash

export PATH="$(pwd)/node_modules/.bin:$PATH"

echo "Starting KV bulk put..."
wrangler kv:bulk put --binding=__STATIC_CONTENT --namespace-id=__seowebsite-workers_sites_assets --path=./public
echo "KV bulk put completed."
