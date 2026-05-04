const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));

if (files.length > 0) {
  const filePath = path.join(dataDir, files[0]);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // get rows as arrays
  console.log('Headers:', rows[0]);
} else {
  console.log('No files found');
}
