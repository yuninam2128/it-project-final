require('dotenv').config();

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;
const fs = require('fs');

fetch(`https://api.figma.com/v1/files/${fileId}/nodes?ids=483:11`, {
  headers: { 'X-Figma-Token': token }
})
.then(res => res.json())
.then(data => {
  fs.writeFileSync('frame101.json', JSON.stringify(data.nodes['483:11'].document, null, 2));
  console.log('Frame 101 JSON saved to frame101.json');
})
.catch(err => console.error('Error:', err.message));
