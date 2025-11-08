const fs = require('fs');
const frame101 = JSON.parse(fs.readFileSync('frame101.json', 'utf8'));

// 색상 추출 함수
function extractColor(node, path = '') {
  const colors = [];

  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID' && fill.color) {
        const r = Math.round(fill.color.r * 255);
        const g = Math.round(fill.color.g * 255);
        const b = Math.round(fill.color.b * 255);
        const a = fill.color.a !== undefined ? fill.color.a : 1;
        colors.push({
          element: path + '/' + node.name,
          type: 'fill',
          color: 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')',
          rgb: { r, g, b, a }
        });
      }
    });
  }

  if (node.children) {
    node.children.forEach(child => {
      colors.push(...extractColor(child, path + '/' + node.name));
    });
  }

  return colors;
}

const colors = extractColor(frame101);
console.log('=== Frame 101 Colors ===');
colors.slice(0, 20).forEach(c => {
  console.log(c.element + ' (' + c.type + '): ' + c.color);
});
