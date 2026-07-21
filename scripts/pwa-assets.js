const sharp = require('sharp');
const fs = require('fs');
const dir = require('path').join(__dirname, '..');

(async () => {
  await sharp('D:\\Downloads\\logo9.png').resize(192, 192).png().toFile(dir + '\\icon-192.png');
  await sharp('D:\\Downloads\\logo9.png').resize(512, 512).png().toFile(dir + '\\icon-512.png');
  const s1 = fs.statSync(dir + '\\icon-192.png').size;
  const s2 = fs.statSync(dir + '\\icon-512.png').size;
  console.log('icon-192.png: ' + s1 + 'B');
  console.log('icon-512.png: ' + s2 + 'B');
  console.log('Done');
})();
