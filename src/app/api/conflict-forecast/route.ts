import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const violenceType = searchParams.get("type") || "All Event Types";

    // If no month is provided, get the latest month available in the db
    let targetMonth: Date;

    if (month) {
      targetMonth = new Date(month);
    } else {
      const latest = await prisma.conflictForecast.findFirst({
        orderBy: { forecastMonth: "desc" },
        select: { forecastMonth: true },
      });
      if (!latest) {
        return NextResponse.json({ data: [] });
      }
      targetMonth = latest.forecastMonth;
    }

    const data = await prisma.conflictForecast.findMany({
      where: {
        forecastMonth: targetMonth,
        violenceType,
      },
      orderBy: {
        expectedCase: "desc",
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch conflict forecasts:", error);
    return NextResponse.json(
      { error: "Failed to fetch conflict forecasts" },
      { status: 500 }
    );
  }
}
