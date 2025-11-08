require('dotenv').config();

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;
const nodeId = '282:1155';

fetch(`https://api.figma.com/v1/files/${fileId}/nodes?ids=${nodeId}`, {
  headers: { 'X-Figma-Token': token }
})
.then(res => res.json())
.then(data => {
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error('Error:', err.message));
