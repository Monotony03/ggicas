import { NextResponse } from "next/server";
import { queryAll } from "@/lib/db";

export async function GET() {
  try {
    // DISTINCT + strftime for extracting YYYY-MM from forecast months
    const months = queryAll<{ forecastMonth: string }>(`
      SELECT DISTINCT "forecastMonth"
      FROM "ConflictForecast"
      ORDER BY "forecastMonth" DESC
    `);

    const data = months
      .map(m => m.forecastMonth ? new Date(m.forecastMonth).toISOString().split("T")[0].substring(0, 7) : null)
      .filter((m): m is string => m !== null); // "YYYY-MM"

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch forecast months:", error);
    return NextResponse.json({ error: "Failed to fetch forecast months" }, { status: 500 });
  }
}
