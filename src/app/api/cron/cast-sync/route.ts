import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    const forecastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

    // For demonstration, since fetching from the protected platform API 
    // requires a valid session/token, we will load our seed data.
    // The tokens can be used here via axios to the real ACLED endpoint if provided.
    console.log("Tokens provided:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
    
    // Load static seed data
    const seedPath = path.join(process.cwd(), "src/data/cast-seed.json");
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

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
          historicalAvg: row.expectedCase * 0.9, // mock avg
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

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${upsertedCount} forecast records for ${forecastMonth.toISOString().substring(0, 7)}.`,
      forecastMonth,
    });
  } catch (error) {
    console.error("Failed to sync CAST data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
