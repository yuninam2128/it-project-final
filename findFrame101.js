require('dotenv').config();

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;

fetch(`https://api.figma.com/v1/files/${fileId}`, {
  headers: { 'X-Figma-Token': token }
})
.then(res => res.json())
.then(data => {
  // 모든 프레임과 그룹을 재귀적으로 검색
  function findNodeById(node, targetId, path = '') {
    if (node.id === targetId) {
      return { node, path };
    }
    
    if (node.name && node.name.includes('101')) {
      console.log(`Found "${node.name}" (ID: ${node.id}) at ${path}/${node.name}`);
    }
    
    if (node.children) {
      for (let child of node.children) {
        const result = findNodeById(child, targetId, `${path}/${node.name}`);
        if (result) return result;
      }
    }
    return null;
  }
  
  // 모든 페이지에서 검색
  data.document.children.forEach(page => {
    console.log(`\n=== Searching in page: ${page.name} ===`);
    if (page.children) {
      page.children.forEach(node => {
        // Frame ID가 정확히 101인 것 찾기
        function searchAll(n, depth = 0) {
          const indent = '  '.repeat(depth);
          if (n.id === '101' || (n.name && n.name.includes('101'))) {
            console.log(`${indent}✓ ${n.name} (ID: ${n.id})`);
          }
          if (n.children) {
            n.children.forEach(child => searchAll(child, depth + 1));
          }
        }
        searchAll(node);
      });
    }
  });
})
.catch(err => console.error('Error:', err.message));
