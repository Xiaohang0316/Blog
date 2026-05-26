const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname);
const htmlFile = path.join(repoDir, '1-COPY.html');

if (!fs.existsSync(htmlFile)) {
  console.error('HTML file not found:', htmlFile);
  process.exit(1);
}

let html = fs.readFileSync(htmlFile, 'utf8');

// Collect all img src values
const imgRegex = /<img[^>]+src=(?:"|')([^"'>]+)(?:"|')[^>]*>/g;
const srcs = new Set();
let m;
while ((m = imgRegex.exec(html)) !== null) {
  srcs.add(m[1]);
}

if (srcs.size === 0) {
  console.log('No <img> tags found in', htmlFile);
  process.exit(0);
}

const converted = [];
const skipped = [];
const missing = [];

for (const src of srcs) {
  try {
    if (src.startsWith('data:')) { skipped.push(src); continue; }
    if (/^https?:\/\//i.test(src)) { skipped.push(src); continue; }

    // resolve local path
    const imgPath = path.resolve(path.dirname(htmlFile), src);
    if (!fs.existsSync(imgPath)) { missing.push(src); continue; }

    const ext = path.extname(imgPath).toLowerCase();
    const mime = ext === '.png' ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
      : ext === '.svg' ? 'image/svg+xml'
      : ext === '.gif' ? 'image/gif'
      : ext === '.webp' ? 'image/webp'
      : 'application/octet-stream';

    const b64 = fs.readFileSync(imgPath).toString('base64');
    const dataUri = `data:${mime};base64,${b64}`;

    // escape src for regex
    const esc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const srcRegex = new RegExp(`(src=("|'))${esc}(("|'))`, 'g');
    html = html.replace(srcRegex, `$1${dataUri}$3`);
    converted.push(src);
  } catch (err) {
    console.error('Error processing', src, err.message);
  }
}

fs.writeFileSync(htmlFile, html, 'utf8');
console.log('converted:', converted.length);
if (skipped.length) console.log('skipped (already data or remote):', skipped.length);
if (missing.length) console.log('missing:', missing.length, missing.join(', '));
