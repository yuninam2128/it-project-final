require('dotenv').config();

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;

// 101 프레임 상세 정보 가져오기
fetch(`https://api.figma.com/v1/files/${fileId}/nodes?ids=483:11`, {
  headers: { 'X-Figma-Token': token }
})
.then(res => res.json())
.then(data => {
  console.log('=== Frame 101 (483:11) ===');
  const node = data.nodes['483:11'];

  // 레이아웃 정보 추출
  console.log('\n📐 레이아웃 정보:');
  console.log('- Type:', node.document.type);
  console.log('- Name:', node.document.name);
  console.log('- Width:', node.document.absoluteBoundingBox.width);
  console.log('- Height:', node.document.absoluteBoundingBox.height);

  // 자식 요소
  if (node.document.children) {
    console.log('\n🧩 자식 요소들:');
    node.document.children.forEach((child, idx) => {
      console.log(`\n  [${idx}] ${child.name} (ID: ${child.id})`);
      console.log(`      - Type: ${child.type}`);
      console.log(`      - Size: ${child.absoluteBoundingBox.width}x${child.absoluteBoundingBox.height}`);
      if (child.type === 'TEXT') {
        console.log(`      - Text: "${child.characters}"`);
        console.log(`      - FontSize: ${child.style.fontSize}`);
        console.log(`      - FontWeight: ${child.style.fontWeight}`);
      }

      if (child.children && child.children.length > 0) {
        console.log(`      - Children: ${child.children.length} items`);
      }
    });
  }
})
.catch(err => console.error('Error:', err.message));
