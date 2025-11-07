require('dotenv').config();

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;

fetch(`https://api.figma.com/v1/files/${fileId}`, {
  headers: { 'X-Figma-Token': token }
})
.then(res => res.json())
.then(data => {
  if (data.document && data.document.children) {
    console.log('📋 Pages in file:');
    data.document.children.forEach(page => {
      console.log(`\n📄 ${page.name} (ID: ${page.id})`);
      if (page.children) {
        page.children.slice(0, 15).forEach(frame => {
          console.log(`  └─ ${frame.name} (ID: ${frame.id})`);
          if (frame.children && frame.children.length > 0) {
            frame.children.slice(0, 5).forEach(child => {
              console.log(`    └─ ${child.name} (ID: ${child.id})`);
            });
            if (frame.children.length > 5) {
              console.log(`    ... and ${frame.children.length - 5} more`);
            }
          }
        });
        if (page.children.length > 15) {
          console.log(`  ... and ${page.children.length - 15} more frames`);
        }
      }
    });
  }
})
.catch(err => console.error('Error:', err.message));
