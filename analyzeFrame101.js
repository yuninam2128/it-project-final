const fs = require('fs');
const frame101 = JSON.parse(fs.readFileSync('frame101.json', 'utf8'));

// 섹션별 상세 분석
function analyzeSection(sectionName) {
  function findByName(node, name) {
    if (node.name === name) return node;
    if (node.children) {
      for (let child of node.children) {
        const result = findByName(child, name);
        if (result) return result;
      }
    }
    return null;
  }

  const section = findByName(frame101, sectionName);
  if (!section) {
    console.log('Section not found:', sectionName);
    return;
  }

  console.log('\n=== ' + sectionName + ' ===');
  console.log('Type:', section.type);
  console.log('Size:', section.absoluteBoundingBox.width + 'x' + section.absoluteBoundingBox.height);
  console.log('Position:', 'X=' + section.absoluteBoundingBox.x + ', Y=' + section.absoluteBoundingBox.y);

  if (section.cornerRadius) {
    console.log('CornerRadius:', section.cornerRadius);
  }

  if (section.layoutMode) {
    console.log('LayoutMode:', section.layoutMode);
    console.log('ItemSpacing:', section.itemSpacing);
    console.log('Padding:', 'L=' + section.paddingLeft + ', R=' + section.paddingRight +
                ', T=' + section.paddingTop + ', B=' + section.paddingBottom);
  }

  if (section.fills && section.fills[0]) {
    const fill = section.fills[0];
    if (fill.type === 'SOLID') {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      console.log('Fill: rgba(' + r + ', ' + g + ', ' + b + ', ' + fill.color.a + ')');
    }
  }

  if (section.children && section.children.length > 0) {
    console.log('\nChildren (' + section.children.length + '):');
    section.children.slice(0, 10).forEach((child, idx) => {
      console.log('  [' + idx + '] ' + child.name + ' (' + child.type + ') - ' +
                  child.absoluteBoundingBox.width + 'x' + child.absoluteBoundingBox.height);
    });
  }
}

analyzeSection('detail-todo-title');
analyzeSection('week-select');
analyzeSection('week');
analyzeSection('content');
