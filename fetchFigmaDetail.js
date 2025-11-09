require('dotenv').config();

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;

// 10000001 프레임 상세 정보 가져오기
fetch(`https://api.figma.com/v1/files/${fileId}/nodes?ids=284:1504`, {
  headers: { 'X-Figma-Token': token }
})
.then(res => res.json())
.then(data => {
  console.log('=== 10000001 Frame (284:1504) ===');
  console.log(JSON.stringify(data.nodes['284:1504'], null, 2));
})
.catch(err => console.error('Error:', err.message));
