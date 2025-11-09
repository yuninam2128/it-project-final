const fs = require('fs');
const frame101 = JSON.parse(fs.readFileSync('frame101.json', 'utf8'));

// 배경 그래디언트 추출
if (frame101.fills && frame101.fills[0] && frame101.fills[0].type === 'GRADIENT_LINEAR') {
  const gradient = frame101.fills[0];
  console.log('Frame 101 Gradient:');
  console.log('Stops:');
  gradient.gradientStops.forEach(stop => {
    const r = Math.round(stop.color.r * 255);
    const g = Math.round(stop.color.g * 255);
    const b = Math.round(stop.color.b * 255);
    const a = stop.color.a !== undefined ? stop.color.a : 1;
    console.log('  Position:', stop.position);
    console.log('  Color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  });
  
  console.log('Handle positions:');
  console.log(JSON.stringify(gradient.gradientHandlePositions, null, 2));
}
