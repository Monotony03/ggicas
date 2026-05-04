import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ACLED Excel Data Ingestion...');
  const dataDir = path.join(__dirname, '../src/data');
  
  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found at ${dataDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));
  console.log(`Found ${files.length} Excel files to process.`);

  for (const file of files) {
    console.log(`\n--- Processing ${file} ---`);
    const filePath = path.join(dataDir, file);
    
    // Read the workbook
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assume data is in first sheet
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    // ACLED data usually has headers.
    const rows = xlsx.utils.sheet_to_json<any>(sheet);
    console.log(`Parsed ${rows.length} rows from sheet.`);

    let importedCount = 0;
    
    // Process in batches to avoid overwhelming the database
    const batchSize = 100; // Small batch size because we are finding/upserting
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        // ACLED standard columns are usually lowercased or capitalized.
        // We'll normalize keys to lowercase to be safe.
        const normalizedRow: any = {};
        for (const key in row) {
          normalizedRow[key.toLowerCase()] = row[key];
        }

        const countryName = normalizedRow['country'];
        // The export has 'week' instead of 'event_date'
        const eventDateStr = normalizedRow['week'];
        const eventType = normalizedRow['event_type'];
        const subType = normalizedRow['sub_event_type'] || '';
        const disorder = normalizedRow['disorder_type'] || '';
        const notes = normalizedRow['fatalities'] 
           ? `Fatalities: ${normalizedRow['fatalities']}. ${subType} (${disorder})` 
           : `${subType} (${disorder})`;

        if (!countryName || !eventDateStr || !eventType) {
            continue; // Skip invalid rows
        }

        // Try to find the country
        let country = await prisma.country.findFirst({
          where: { name: countryName }
        });

        if (!country) {
          try {
            country = await prisma.country.create({
              data: {
                name: countryName,
                isoCode: (countryName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000)).substring(0, 4),
                region: 'ACLED Imported',
              }
            });
          } catch (e) {
             // Fallback if unique constraint fails
             continue;
          }
        }

        const eventDate = new Date(eventDateStr);
        if (isNaN(eventDate.getTime())) continue;

        const conflictName = `ACLED: ${eventType} in ${countryName}`;

        // Find or create conflict
        let conflict = await prisma.conflict.findFirst({
          where: { name: conflictName }
        });

        if (!conflict) {
          conflict = await prisma.conflict.create({
            data: {
              name: conflictName,
              type: eventType,
              cause: notes.substring(0, 500), // Ensure we don't exceed string limits if any
              startDate: eventDate,
              endDate: null,
            }
          });
        }

        // Check if involvement already exists
        const existingInvolvement = await prisma.conflictInvolvement.findFirst({
          where: { conflictId: conflict.id, countryId: country.id }
        });

        if (!existingInvolvement) {
          await prisma.conflictInvolvement.create({
            data: {
              conflictId: conflict.id,
              countryId: country.id,
              role: 'Participant', // ACLED has 'actor1', 'actor2', etc., but we use a generic role here for simplicity
              startDate: eventDate,
            }
          });
          importedCount++;
        }
      }
      process.stdout.write(`\rProcessed ${Math.min(i + batchSize, rows.length)} / ${rows.length} rows...`);
    }
    console.log(`\nImported ${importedCount} new conflict involvements from ${file}.`);
  }

  console.log('\nData ingestion complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding excel data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
