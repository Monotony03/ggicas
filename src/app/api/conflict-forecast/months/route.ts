import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const months = await prisma.conflictForecast.groupBy({
      by: ["forecastMonth"],
      _count: true,
      orderBy: { forecastMonth: "desc" },
    });

    const data = months.map(m => m.forecastMonth.toISOString().split("T")[0].substring(0, 7)); // "YYYY-MM"

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch forecast months:", error);
    return NextResponse.json({ error: "Failed to fetch forecast months" }, { status: 500 });
  }
}
