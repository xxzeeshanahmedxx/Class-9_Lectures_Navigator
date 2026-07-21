const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DATA_DIR = path.join(__dirname, '..', 'data');
const THUMBS_DIR = path.join(__dirname, '..', 'thumbs');

fs.mkdirSync(THUMBS_DIR, { recursive: true });

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== 'subjects.json');

const entries = [];
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  for (const ch of (data.chapters || [])) {
    for (const v of (ch.videos || [])) {
      if (v.videoId) entries.push({ file, data, video: v, videoId: v.videoId });
    }
    for (const s of (ch.sections || [])) {
      for (const v of (s.videos || [])) {
        if (v.videoId) entries.push({ file, data, video: v, videoId: v.videoId });
      }
    }
  }
}

console.log(`Found ${entries.length} videos across ${files.length} files`);

let done = 0;
let errors = 0;
const CONCURRENCY = 10;

async function processOne({ video, videoId }) {
  const out = path.join(THUMBS_DIR, `${videoId}.webp`);
  if (fs.existsSync(out)) {
    video.thumb = `thumbs/${videoId}.webp`;
    done++;
    return;
  }
  const url = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    const webp = await sharp(buf).webp({ quality: 30 }).toBuffer();
    fs.writeFileSync(out, webp);
    video.thumb = `thumbs/${videoId}.webp`;
    done++;
    process.stdout.write(`\r${done}/${entries.length} (${errors} errors)`);
  } catch (e) {
    errors++;
    process.stdout.write(`\r${done}/${entries.length} (${errors} errors) FAIL ${videoId}`);
  }
}

async function main() {
  const seen = new Set();
  const unique = entries.filter(e => {
    if (seen.has(e.videoId)) return false;
    seen.add(e.videoId);
    return true;
  });
  console.log(`Unique: ${unique.length}`);

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    await Promise.all(unique.slice(i, i + CONCURRENCY).map(processOne));
  }

  const updatedFiles = new Set(entries.map(e => e.file));
  for (const f of updatedFiles) {
    const match = entries.find(e => e.file === f);
    fs.writeFileSync(path.join(DATA_DIR, f), JSON.stringify(match.data, null, 2));
    console.log(`\nWrote ${f}`);
  }

  console.log(`\nDone: ${done} OK, ${errors} errors`);
}

main().catch(console.error);
