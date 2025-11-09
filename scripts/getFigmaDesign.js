#!/usr/bin/env node

require('dotenv').config();
const https = require('https');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_ID = process.env.FIGMA_FILE_ID;
const NODE_ID = process.env.FIGMA_NODE_ID || '554-160';

function fetchFigmaData() {
  const options = {
    hostname: 'api.figma.com',
    path: `/v1/files/${FILE_ID}/nodes?ids=${NODE_ID}`,
    method: 'GET',
    headers: {
      'X-FIGMA-TOKEN': FIGMA_TOKEN
    }
  };

  return new Promise((resolve, reject) => {
    https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).end();
  });
}

async function main() {
  try {
    console.log('Fetching Figma design data...\n');
    const data = await fetchFigmaData();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
