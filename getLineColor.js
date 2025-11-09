const fs = require('fs');
const frame101 = JSON.parse(fs.readFileSync('frame101.json', 'utf8'));

// Line 4 찾기
function findElement(node, name) {
  if (node.name === name) {
    return node;
  }
  if (node.children) {
    for (let child of node.children) {
      const result = findElement(child, name);
      if (result) return result;
    }
  }
  return null;
}

const line4 = findElement(frame101, 'Line 4');
if (line4) {
  console.log('Line 4 found:');
  console.log('- Type:', line4.type);
  console.log('- Strokes:', line4.strokes);
  if (line4.strokes && line4.strokes[0]) {
    const stroke = line4.strokes[0];
    if (stroke.type === 'SOLID') {
      const r = Math.round(stroke.color.r * 255);
      const g = Math.round(stroke.color.g * 255);
      const b = Math.round(stroke.color.b * 255);
      const a = stroke.color.a !== undefined ? stroke.color.a : 1;
      console.log('- Stroke color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
      console.log('- Stroke weight:', stroke.strokeWeight);
    }
  }
} else {
  console.log('Line 4 not found');
}
