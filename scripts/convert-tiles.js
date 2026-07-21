const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = 'D:\\Downloads\\enhanced-tiles';
const dstDir = path.join(__dirname, '..', 'assets');

fs.mkdirSync(dstDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpg'));

(async () => {
  for (const f of files) {
    const name = path.parse(f).name;
    const webp = name.toLowerCase() + '.webp';
    const src = path.join(srcDir, f);
    const dst = path.join(dstDir, webp);
    await sharp(src).webp({ quality: 80 }).toFile(dst);
    const orig = fs.statSync(src).size;
    const out = fs.statSync(dst).size;
    console.log(name + ': ' + orig + 'B → ' + out + 'B (' + Math.round(out/orig*100) + '%)');
  }
  console.log('Done');
})();
