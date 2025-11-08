const fs = require('fs');
const frame101 = JSON.parse(fs.readFileSync('frame101.json', 'utf8'));

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

const inputBox = findByName(frame101, '입력박스');
if (inputBox) {
  console.log('=== Input Box (입력박스) ===');
  console.log('Size:', inputBox.absoluteBoundingBox.width + 'x' + inputBox.absoluteBoundingBox.height);
  console.log('CornerRadius:', inputBox.cornerRadius);
  
  if (inputBox.fills && inputBox.fills[0]) {
    const fill = inputBox.fills[0];
    if (fill.type === 'SOLID') {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      console.log('Background: rgba(' + r + ', ' + g + ', ' + b + ', ' + fill.color.a + ')');
    }
  }

  if (inputBox.layoutMode) {
    console.log('Layout: ' + inputBox.layoutMode);
    console.log('ItemSpacing:', inputBox.itemSpacing);
  }

  console.log('\nChildren:');
  inputBox.children.forEach((child, idx) => {
    console.log('[' + idx + '] ' + child.name + ' (' + child.type + ')');
    console.log('    Size: ' + child.absoluteBoundingBox.width + 'x' + child.absoluteBoundingBox.height);
    
    if (child.type === 'TEXT') {
      console.log('    Text: "' + (child.characters || '') + '"');
      console.log('    Font: ' + (child.style.fontSize || '') + 'px, ' + (child.style.fontWeight || ''));
      if (child.fills && child.fills[0] && child.fills[0].type === 'SOLID') {
        const r = Math.round(child.fills[0].color.r * 255);
        const g = Math.round(child.fills[0].color.g * 255);
        const b = Math.round(child.fills[0].color.b * 255);
        console.log('    Color: rgba(' + r + ', ' + g + ', ' + b + ', ' + child.fills[0].color.a + ')');
      }
    } else if (child.type === 'FRAME') {
      if (child.fills && child.fills[0] && child.fills[0].type === 'SOLID') {
        const r = Math.round(child.fills[0].color.r * 255);
        const g = Math.round(child.fills[0].color.g * 255);
        const b = Math.round(child.fills[0].color.b * 255);
        console.log('    Fill: rgba(' + r + ', ' + g + ', ' + b + ', ' + child.fills[0].color.a + ')');
      }
      if (child.cornerRadius) {
        console.log('    CornerRadius: ' + child.cornerRadius);
      }
    }
  });
}
