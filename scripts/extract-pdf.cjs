const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node extract-pdf.cjs <path>'); process.exit(1); }

const dataBuffer = fs.readFileSync(filePath);
const parser = new PDFParse(dataBuffer);
parser.then(data => {
  console.log(data.text);
}).catch(err => {
  console.error('Error:', err.message);
});
