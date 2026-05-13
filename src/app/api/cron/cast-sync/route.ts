import { NextResponse } from "next/server";
import { queryOne, execute, generateId } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    // Basic auth check for cron jobs if needed
    const authHeader = request.headers.get("authorization");
    // In production, verify authHeader against process.env.CRON_SECRET

    const body = await request.json().catch(() => ({}));
    const accessToken = body.accessToken || process.env.ACLED_ACCESS_TOKEN;
    const refreshToken = body.refreshToken || process.env.ACLED_REFRESH_TOKEN;

    // Use current month as the forecast month (rounded to start of month)
    const now = new Date();
    const forecastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString();

    // For demonstration, since fetching from the protected platform API 
    // requires a valid session/token, we will load our seed data.
    console.log("Tokens provided:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
    
    let seedData: any[] = [];

    if (accessToken) {
      console.log("Fetching data from ACLED CAST API...");
      try {
        const response = await fetch("https://acleddata.com/api/cast/read/?limit=10000", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`ACLED API responded with status: ${response.status}`);
        }

        const json = await response.json();
        const apiData = json.data || [];

        // Group by country since CAST data is often admin1 level
        const countryMap = new Map<string, any>();
        
        for (const item of apiData) {
          const country = item.country;
          if (!countryMap.has(country)) {
            countryMap.set(country, {
              countryIso: country.substring(0, 3).toUpperCase(), 
              countryName: country,
              totalForecast: 0
            });
          }
          const existing = countryMap.get(country);
          existing.totalForecast += (item.total_forecast || 0);
        }

        seedData = Array.from(countryMap.values()).map(c => {
          const expectedCase = c.totalForecast;
          return {
            countryIso: c.countryIso,
            countryName: c.countryName,
            expectedCase: expectedCase,
            bestCase: Math.floor(expectedCase * 0.8),
            worstCase: Math.ceil(expectedCase * 1.2),
            predictedChange: "stable"
          };
        });

        console.log(`Aggregated CAST data into ${seedData.length} countries.`);
      } catch (err) {
        console.error("Error fetching from ACLED API, falling back to seed data:", err);
      }
    }

    if (seedData.length === 0) {
      console.log("Using static seed data as fallback.");
      const possiblePaths = [
        path.join(process.cwd(), "src/data/cast-seed.json"),
        path.join(process.cwd(), "data/cast-seed.json"),
        path.join(process.cwd(), "public/data/cast-seed.json"),
        path.join(process.cwd(), "src/lib/data/cast-seed.json"),
        path.join(process.cwd(), "src/app/api/cron/cast-sync/cast-seed.json")
      ];
      
      let seedPath = "";
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          seedPath = p;
          console.log(`Found seed data at: ${p}`);
          break;
        }
      }

      if (!seedPath) {
        console.error("Searched paths:", possiblePaths);
        throw new Error("Could not find cast-seed.json in any expected location.");
      }

      try {
        const rawData = fs.readFileSync(seedPath, "utf-8");
        seedData = JSON.parse(rawData);
      } catch (e: any) {
        throw new Error(`Failed to parse seed data at ${seedPath}: ${e.message}`);
      }
    }

    let upsertedCount = 0;
    const errors: string[] = [];

    for (const row of seedData) {
      try {
        // UPSERT using INSERT OR REPLACE (SQLite's ON CONFLICT clause)
        // First check if record exists
        const existing = queryOne<{ id: string }>(
          `SELECT id FROM "ConflictForecast"
           WHERE "countryIso" = ? AND "forecastMonth" = ? AND "violenceType" = ?`,
          [row.countryIso, forecastMonth, "All Event Types"]
        );

        if (existing) {
          // UPDATE existing record
          execute(
            `UPDATE "ConflictForecast" SET
              "bestCase" = ?, "expectedCase" = ?, "worstCase" = ?,
              "predictedChange" = ?, "historicalAvg" = ?, "lastSyncedAt" = ?,
              "updatedAt" = ?
             WHERE id = ?`,
            [
              Number(row.bestCase), Number(row.expectedCase), Number(row.worstCase),
              row.predictedChange || "stable", Number(row.expectedCase) * 0.9,
              new Date().toISOString(), new Date().toISOString(), existing.id
            ]
          );
        } else {
          // INSERT new record
          const id = generateId();
          execute(
            `INSERT INTO "ConflictForecast"
              (id, "countryIso", "countryName", "forecastMonth", "bestCase", "expectedCase",
               "worstCase", "predictedChange", "historicalAvg", "violenceType", "lastSyncedAt",
               "createdAt", "updatedAt")
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id, row.countryIso, row.countryName, forecastMonth,
              Number(row.bestCase), Number(row.expectedCase), Number(row.worstCase),
              row.predictedChange || "stable", Number(row.expectedCase) * 0.9,
              "All Event Types", new Date().toISOString(),
              new Date().toISOString(), new Date().toISOString()
            ]
          );
        }
        upsertedCount++;
      } catch (e: any) {
        console.error(`Failed to upsert record for ${row.countryName}:`, e.message);
        errors.push(`${row.countryName}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${seedData.length} records. Sync completion: ${upsertedCount}/${seedData.length}.`,
      count: upsertedCount,
      errors: errors.length > 0 ? errors : undefined,
      forecastMonth: forecastMonth,
    });
  } catch (error: any) {
    console.error("Critical failure in CAST sync:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
