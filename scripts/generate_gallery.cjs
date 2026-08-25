const fs = require('fs');
const path = require('path');

const dir = path.join('c:', 'Users', 'hp elite book', 'Desktop', 'pixel-pantry-polish', 'Petpediaa', 'Petpediaa');
const files = fs.readdirSync(dir);

console.log('Total files in Petpediaa:', files.length);

const jpgFiles = files.filter(f => f.endsWith('.JPG') || f.endsWith('.jpg') || f.endsWith('.png'));
const mp4Files = files.filter(f => f.endsWith('.MP4') || f.endsWith('.mp4'));

console.log('Images:', jpgFiles.length);
console.log('Videos:', mp4Files.length);

// Let's create an HTML file so we can browse or map them easily if needed
let html = `<!DOCTYPE html>
<html>
<head>
<title>Petpediaa Images</title>
<style>
  body { font-family: sans-serif; background: #111; color: #fff; padding: 20px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .card { background: #222; border-radius: 8px; overflow: hidden; padding: 8px; text-align: center; }
  img { width: 100%; height: 180px; object-fit: contain; background: #000; border-radius: 4px; }
  p { font-size: 11px; word-break: break-all; margin: 6px 0 0; color: #aaa; }
</style>
</head>
<body>
<h1>Petpediaa Product Images (${jpgFiles.length})</h1>
<div class="grid">
${jpgFiles.map(f => `  <div class="card">
    <img src="./${f}" loading="lazy" />
    <p>${f}</p>
  </div>`).join('\n')}
</div>
</body>
</html>`;

fs.writeFileSync(path.join(dir, 'gallery.html'), html);
console.log('gallery.html created in Petpediaa/Petpediaa/');
