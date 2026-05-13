const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runSync() {
  try {
    console.log("Starting manual sync test...");
    
    // Mocking the logic from src/app/api/cron/cast-sync/route.ts
    const now = new Date();
    const forecastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    console.log("Forecast Month:", forecastMonth.toISOString());

    const seedPath = path.join(process.cwd(), "src/data/cast-seed.json");
    if (!fs.existsSync(seedPath)) {
        console.error("Seed file not found at:", seedPath);
        return;
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    console.log(`Loaded ${seedData.length} records from seed file.`);

    let upsertedCount = 0;

    for (const row of seedData) {
      await prisma.conflictForecast.upsert({
        where: {
          countryIso_forecastMonth_violenceType: {
            countryIso: row.countryIso,
            forecastMonth: forecastMonth,
            violenceType: "All Event Types",
          },
        },
        update: {
          bestCase: row.bestCase,
          expectedCase: row.expectedCase,
          worstCase: row.worstCase,
          predictedChange: row.predictedChange,
          historicalAvg: row.expectedCase * 0.9,
          lastSyncedAt: new Date(),
        },
        create: {
          countryIso: row.countryIso,
          countryName: row.countryName,
          forecastMonth: forecastMonth,
          bestCase: row.bestCase,
          expectedCase: row.expectedCase,
          worstCase: row.worstCase,
          predictedChange: row.predictedChange,
          historicalAvg: row.expectedCase * 0.9,
          violenceType: "All Event Types",
        },
      });
      upsertedCount++;
    }

    console.log(`Successfully synced ${upsertedCount} records.`);
    
    // Verify by counting
    const count = await prisma.conflictForecast.count();
    console.log(`Total records in DB: ${count}`);

  } catch (error) {
    console.error("Sync failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runSync();
