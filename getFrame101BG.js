const fs = require('fs');
const frame101 = JSON.parse(fs.readFileSync('frame101.json', 'utf8'));

// 메인 프레임의 배경 확인
console.log('Frame 101 Main Properties:');
console.log('- Name:', frame101.name);
console.log('- Type:', frame101.type);
console.log('- Background:', frame101.background);
console.log('- Fills:', frame101.fills);
console.log('- Width:', frame101.absoluteBoundingBox.width);
console.log('- Height:', frame101.absoluteBoundingBox.height);
console.log('- CornerRadius:', frame101.cornerRadius);

// 메인 컨테이너의 배경색
if (frame101.children && frame101.children.length > 0) {
  const children = frame101.children;
  console.log('\nChildren count:', children.length);
  children.forEach((child, idx) => {
    console.log(`\n[${idx}] ${child.name} (${child.type})`);
    if (child.fills && child.fills[0]) {
      const fill = child.fills[0];
      if (fill.type === 'SOLID') {
        const r = Math.round(fill.color.r * 255);
        const g = Math.round(fill.color.g * 255);
        const b = Math.round(fill.color.b * 255);
        console.log('    - Fill: rgba(' + r + ', ' + g + ', ' + b + ', ' + fill.color.a + ')');
      }
    }
  });
}
