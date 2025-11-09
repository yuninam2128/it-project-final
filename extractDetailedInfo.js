const fs = require('fs');
const frame101 = JSON.parse(fs.readFileSync('frame101.json', 'utf8'));

function extractDetailedInfo(node, level = 0) {
  const indent = '  '.repeat(level);

  console.log(indent + '• ' + node.name + ' (' + node.type + ')');
  console.log(indent + '  Size: ' + node.absoluteBoundingBox.width + 'x' + node.absoluteBoundingBox.height);

  if (node.type === 'TEXT') {
    console.log(indent + '  Text: "' + (node.characters || '') + '"');
    if (node.style) {
      console.log(indent + '  Font: ' + (node.style.fontFamily || 'unknown') + ' ' +
                  (node.style.fontSize || '') + 'px, weight: ' + (node.style.fontWeight || ''));
    }
    if (node.fills && node.fills[0] && node.fills[0].type === 'SOLID') {
      const r = Math.round(node.fills[0].color.r * 255);
      const g = Math.round(node.fills[0].color.g * 255);
      const b = Math.round(node.fills[0].color.b * 255);
      console.log(indent + '  Color: rgba(' + r + ', ' + g + ', ' + b + ', ' +
                  node.fills[0].color.a + ')');
    }
  } else if (node.type === 'FRAME' || node.type === 'GROUP') {
    if (node.layoutMode) {
      console.log(indent + '  Layout: ' + node.layoutMode + ', spacing: ' + node.itemSpacing);
    }
    if (node.fills && node.fills[0] && node.fills[0].type === 'SOLID') {
      const r = Math.round(node.fills[0].color.r * 255);
      const g = Math.round(node.fills[0].color.g * 255);
      const b = Math.round(node.fills[0].color.b * 255);
      console.log(indent + '  Fill: rgba(' + r + ', ' + g + ', ' + b + ', ' +
                  node.fills[0].color.a + ')');
    }
    if (node.cornerRadius) {
      console.log(indent + '  Radius: ' + node.cornerRadius);
    }
  }

  if (node.children && level < 4) {
    node.children.forEach(child => {
      extractDetailedInfo(child, level + 1);
    });
  }
}

console.log('=== Frame 101 Complete Structure ===\n');
extractDetailedInfo(frame101);
