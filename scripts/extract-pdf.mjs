import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const filePath = process.argv[2];

const buf = await import('fs').then(fs => fs.promises.readFile(filePath));
const data = new Uint8Array(buf);
const doc = await pdfjsLib.getDocument({ data }).promise;

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const text = content.items.map(item => item.str).join(' ');
  console.log(text);
  console.log('---PAGE BREAK---');
}
