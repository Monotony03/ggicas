import { NextResponse } from "next/server";
import { queryAll, queryOne } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const violenceType = searchParams.get("type") || "All Event Types";

    // If no month is provided, get the latest month available in the db
    let targetMonth: string;

    if (month) {
      targetMonth = new Date(month).toISOString();
    } else {
      const latest = queryOne<{ forecastMonth: string }>(
        `SELECT "forecastMonth" FROM "ConflictForecast" ORDER BY "forecastMonth" DESC LIMIT 1`
      );
      if (!latest) {
        return NextResponse.json({ data: [] });
      }
      targetMonth = latest.forecastMonth;
    }

    const data = queryAll(
      `SELECT * FROM "ConflictForecast"
       WHERE "forecastMonth" = ? AND "violenceType" = ?
       ORDER BY "expectedCase" DESC`,
      [targetMonth, violenceType]
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch conflict forecasts:", error);
    return NextResponse.json(
      { error: "Failed to fetch conflict forecasts" },
      { status: 500 }
    );
  }
}
