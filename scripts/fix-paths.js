const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'data');
const files = ['chemistry','computer','math','physics','urdu'];
for (const f of files) {
  const fp = path.join(dir, f + '.json');
  let text = fs.readFileSync(fp, 'utf8');
  text = text.replace(/"thumb"(\s*:\s*)"thumbs\//g, (m, ws) => m.replace('thumbs/', '/thumbs/'));
  fs.writeFileSync(fp, text);
  const count = (text.match(/"\/thumbs\//g) || []).length;
  console.log(f + ': ' + count + ' thumbs fixed');
}
console.log('Done');
