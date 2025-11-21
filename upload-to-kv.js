const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const KV_NAMESPACE_ID = '1a8a89365d0c4f7b876e4ab332fd51c1';
const PUBLIC_DIR = './public';

const files = fs.readdirSync(PUBLIC_DIR);

console.log('Uploading static files to KV namespace...');

files.forEach(file => {
  const filePath = path.join(PUBLIC_DIR, file);
  const stat = fs.statSync(filePath);
  
  if (stat.isFile()) {
    const kvKey = `public/${file}`;
    console.log(`Uploading ${file} to KV as ${kvKey}...`);
    
    try {
      execSync(
        `npx wrangler kv key put "${kvKey}" --path="${filePath}" --namespace-id=${KV_NAMESPACE_ID} --remote`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    }
  }
});

console.log('Upload complete!');
