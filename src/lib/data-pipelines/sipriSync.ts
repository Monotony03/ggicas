import prisma from '../prisma';

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

      // Find countries
      const exporter = await prisma.country.findFirst({ where: { name: exporterName } });
      const importer = await prisma.country.findFirst({ where: { name: importerName } });

      if (!exporter || !importer) {
        // In a real pipeline, we might maintain an alias mapping for country names
        continue;
      }

      // Upsert the arms transfer
      // @ts-ignore — armsTransfer model not yet in schema
      const existing = await prisma.armsTransfer.findFirst({
        where: {
          exporterId: exporter.id,
          importerId: importer.id,
          weaponType: weaponType,
          year: year
        }
      });

      if (!existing) {
        // @ts-ignore
        await prisma.armsTransfer.create({
          data: {
            exporterId: exporter.id,
            importerId: importer.id,
            weaponType: weaponType,
            year: year,
            volumeTIV: volumeTIV
          }
        });
        importedCount++;
      }
    }

    return { success: true, message: `Successfully imported ${importedCount} SIPRI arms transfer records.` };
  } catch (error) {
    console.error('SIPRI Sync Error:', error);
    return { success: false, error: 'Failed to process SIPRI CSV' };
  }
}
