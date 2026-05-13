import { queryOne, execute, generateId } from '../db';

// This is a placeholder parser for SIPRI CSV export format.
// Users export the TIV (Trend Indicator Value) table from SIPRI's web interface as CSV.
// Format typically looks like: Exporter,Importer,Weapon Type,Year,TIV
export async function syncSipriData(csvContent: string) {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
    // Skip header
    const dataLines = lines.slice(1);
    
    let importedCount = 0;

    for (const line of dataLines) {
      const parts = line.split(',');
      if (parts.length < 5) continue;

      const exporterName = parts[0].trim();
      const importerName = parts[1].trim();
      const weaponType = parts[2].trim();
      const year = parseInt(parts[3].trim());
      const volumeTIV = parseFloat(parts[4].trim());

      if (isNaN(year) || isNaN(volumeTIV)) continue;

      // Find countries by name
      const exporter = queryOne<{ id: string }>(`SELECT id FROM "Country" WHERE name = ?`, [exporterName]);
      const importer = queryOne<{ id: string }>(`SELECT id FROM "Country" WHERE name = ?`, [importerName]);

      if (!exporter || !importer) {
        // In a real pipeline, we might maintain an alias mapping for country names
        continue;
      }

      // Check if this exact arms transfer already exists (upsert pattern)
      const existing = queryOne(
        `SELECT id FROM "ArmsTransfer"
         WHERE "exporterId" = ? AND "importerId" = ? AND "weaponType" = ? AND year = ?`,
        [exporter.id, importer.id, weaponType, year]
      );

      if (!existing) {
        execute(
          `INSERT INTO "ArmsTransfer" (id, "exporterId", "importerId", "weaponType", year, "volumeTIV")
           VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId(), exporter.id, importer.id, weaponType, year, volumeTIV]
        );
        importedCount++;
      }
    }

    return { success: true, message: `Successfully imported ${importedCount} SIPRI arms transfer records.` };
  } catch (error) {
    console.error('SIPRI Sync Error:', error);
    return { success: false, error: 'Failed to process SIPRI CSV' };
  }
}
