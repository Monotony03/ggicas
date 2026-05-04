import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // 1. Most connected countries
    const mostConnected = await prisma.$queryRaw`
      SELECT c.name, c.isoCode,
        (SELECT COUNT(*) FROM "Alliance" a WHERE a."countryAId" = c.id OR a."countryBId" = c.id) as "allianceCount",
        (SELECT COUNT(*) FROM "ConflictInvolvement" ci WHERE ci."countryId" = c.id) as "conflictCount",
        (SELECT COUNT(*) FROM "Sanction" s WHERE s."imposingCountryId" = c.id OR s."targetCountryId" = c.id) as "sanctionCount",
        (SELECT COUNT(*) FROM "Alliance" a WHERE a."countryAId" = c.id OR a."countryBId" = c.id) +
        (SELECT COUNT(*) FROM "ConflictInvolvement" ci WHERE ci."countryId" = c.id) +
        (SELECT COUNT(*) FROM "Sanction" s WHERE s."imposingCountryId" = c.id OR s."targetCountryId" = c.id) as "totalConnections"
      FROM "Country" c
      ORDER BY "totalConnections" DESC
      LIMIT 15
    ` as any[]

    // 2. Conflicts by type
    const conflictsByType = await prisma.$queryRaw`
      SELECT type, COUNT(*) as count
      FROM "Conflict"
      GROUP BY type
      ORDER BY count DESC
    ` as any[]

    // 3. Conflicts per decade
    const conflictsPerDecade = await prisma.$queryRaw`
      SELECT 
        (CAST(strftime('%Y', "startDate") AS INTEGER) / 10) * 10 as decade,
        COUNT(*) as count
      FROM "Conflict"
      GROUP BY decade
      ORDER BY decade ASC
    ` as any[]

    // 4. Sanctions network — who sanctions whom most
    const topSanctioners = await prisma.$queryRaw`
      SELECT c.name as country, COUNT(*) as "sanctionsImposed"
      FROM "Sanction" s
      JOIN "Country" c ON s."imposingCountryId" = c.id
      WHERE s."endDate" IS NULL
      GROUP BY c.id
      ORDER BY "sanctionsImposed" DESC
      LIMIT 10
    ` as any[]

    // 5. Most sanctioned countries
    const mostSanctioned = await prisma.$queryRaw`
      SELECT c.name as country, COUNT(*) as "sanctionsReceived"
      FROM "Sanction" s
      JOIN "Country" c ON s."targetCountryId" = c.id
      WHERE s."endDate" IS NULL
      GROUP BY c.id
      ORDER BY "sanctionsReceived" DESC
      LIMIT 10
    ` as any[]

    // 6. Top trade pairs
    const topTradePairs = await prisma.$queryRaw`
      SELECT c1.name as "countryA", c2.name as "countryB", 
        SUM(t."tradeVolumeUsd") as "totalVolume",
        COUNT(*) as "dataPoints"
      FROM "TradeRelation" t
      JOIN "Country" c1 ON t."countryAId" = c1.id
      JOIN "Country" c2 ON t."countryBId" = c2.id
      GROUP BY t."countryAId", t."countryBId", c1.name, c2.name
      ORDER BY "totalVolume" DESC
      LIMIT 10
    ` as any[]

    // 7. GDP vs Military spending ratio (using CTE and Window Function)
    const gdpMilRatio = await prisma.$queryRaw`
      WITH Stats AS (
        SELECT name, "gdpCurrentUsd", "militaryBudget",
          ROUND(CAST("militaryBudget" AS REAL) / NULLIF("gdpCurrentUsd", 0) * 100, 2) as "milPercent"
        FROM "Country"
        WHERE "gdpCurrentUsd" > 0 AND "militaryBudget" > 0
      )
      SELECT name, "gdpCurrentUsd", "militaryBudget", "milPercent",
             RANK() OVER (ORDER BY "milPercent" DESC) as rank
      FROM Stats
      ORDER BY rank ASC
    ` as any[]

    // 8. Alliance types distribution
    const allianceTypes = await prisma.$queryRaw`
      SELECT "allianceType", COUNT(*) as count
      FROM "Alliance"
      WHERE "endDate" IS NULL
      GROUP BY "allianceType"
      ORDER BY count DESC
    ` as any[]

    // Serialize BigInts
    const data = {
      mostConnected, conflictsByType, conflictsPerDecade,
      topSanctioners, mostSanctioned, topTradePairs,
      gdpMilRatio, allianceTypes,
    }
    const serialized = JSON.stringify(data, (_, v) => typeof v === 'bigint' ? Number(v) : v)
    return new NextResponse(serialized, { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 })
  }
}
