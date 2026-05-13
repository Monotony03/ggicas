import Database from 'better-sqlite3';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'database', 'dev.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function generateId(): string {
  return crypto.randomUUID();
}

function main() {
  console.log('Starting ACLED Excel Data Ingestion...');
  const dataDir = path.join(__dirname, '../src/data');
  
  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found at ${dataDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));
  console.log(`Found ${files.length} Excel files to process.`);

  const findCountry = db.prepare(`SELECT id FROM "Country" WHERE name = ?`);
  const createCountry = db.prepare(`INSERT INTO "Country" (id, name, isoCode, region, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`);
  const findConflict = db.prepare(`SELECT id FROM "Conflict" WHERE name = ?`);
  const createConflict = db.prepare(`INSERT INTO "Conflict" (id, name, type, cause, "startDate", "endDate", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const findInvolvement = db.prepare(`SELECT id FROM "ConflictInvolvement" WHERE "conflictId" = ? AND "countryId" = ?`);
  const createInvolvement = db.prepare(`INSERT INTO "ConflictInvolvement" (id, "conflictId", "countryId", role, "startDate", "endDate") VALUES (?, ?, ?, ?, ?, ?)`);

  for (const file of files) {
    console.log(`\n--- Processing ${file} ---`);
    const filePath = path.join(dataDir, file);
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rows = xlsx.utils.sheet_to_json<any>(sheet);
    console.log(`Parsed ${rows.length} rows from sheet.`);

    let importedCount = 0;
    const now = new Date().toISOString();
    
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      // Wrap each batch in a transaction for performance
      const processBatch = db.transaction(() => {
        for (const row of batch) {
          const normalizedRow: any = {};
          for (const key in row) {
            normalizedRow[key.toLowerCase()] = row[key];
          }

          const countryName = normalizedRow['country'];
          const eventDateStr = normalizedRow['week'];
          const eventType = normalizedRow['event_type'];
          const subType = normalizedRow['sub_event_type'] || '';
          const disorder = normalizedRow['disorder_type'] || '';
          const notes = normalizedRow['fatalities'] 
             ? `Fatalities: ${normalizedRow['fatalities']}. ${subType} (${disorder})` 
             : `${subType} (${disorder})`;

          if (!countryName || !eventDateStr || !eventType) continue;

          // Try to find the country
          let country = findCountry.get(countryName) as { id: string } | undefined;

          if (!country) {
            try {
              const id = generateId();
              const isoCode = (countryName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000)).substring(0, 4);
              createCountry.run(id, countryName, isoCode, 'ACLED Imported', now, now);
              country = { id };
            } catch {
              continue;
            }
          }

          const eventDate = new Date(eventDateStr);
          if (isNaN(eventDate.getTime())) continue;

          const conflictName = `ACLED: ${eventType} in ${countryName}`;

          let conflict = findConflict.get(conflictName) as { id: string } | undefined;

          if (!conflict) {
            const conflictId = generateId();
            createConflict.run(
              conflictId, conflictName, eventType,
              notes.substring(0, 500),
              eventDate.toISOString(), null, now, now
            );
            conflict = { id: conflictId };
          }

          const existingInvolvement = findInvolvement.get(conflict.id, country.id);

          if (!existingInvolvement) {
            createInvolvement.run(
              generateId(), conflict.id, country.id,
              'Participant', eventDate.toISOString(), null
            );
            importedCount++;
          }
        }
      });

      processBatch();
      process.stdout.write(`\rProcessed ${Math.min(i + batchSize, rows.length)} / ${rows.length} rows...`);
    }
    console.log(`\nImported ${importedCount} new conflict involvements from ${file}.`);
  }

  console.log('\nData ingestion complete!');
}

try {
  main();
} catch (e) {
  console.error('Error seeding excel data:', e);
  process.exit(1);
} finally {
  db.close();
}
