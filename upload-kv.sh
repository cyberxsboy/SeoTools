#!/bin/bash

KV_NAMESPACE_ID="1a8a89365d0c4f7b876e4ab332fd51c1"

echo "Uploading static files to KV namespace..."

npx wrangler kv:key put --namespace-id=$KV_NAMESPACE_ID "public/index.html" --path="./public/index.html"
npx wrangler kv:key put --namespace-id=$KV_NAMESPACE_ID "public/app.js" --path="./public/app.js"
npx wrangler kv:key put --namespace-id=$KV_NAMESPACE_ID "public/style.css" --path="./public/style.css"

echo "Upload complete!"
