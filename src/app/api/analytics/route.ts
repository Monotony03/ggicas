import { NextResponse } from 'next/server'
import { queryAll } from '@/lib/db'

export async function GET() {
  try {
    // 1. Most connected countries (using database VIEW)
    const mostConnected = queryAll(`SELECT * FROM v_most_connected_countries LIMIT 15`)

    // 2. Conflicts by type — GROUP BY + COUNT aggregate
    const conflictsByType = queryAll(`
      SELECT type, COUNT(*) as count
      FROM "Conflict"
      GROUP BY type
      ORDER BY count DESC
    `)

    // 3. Conflicts per decade — temporal aggregation (using database VIEW)
    const conflictsPerDecade = queryAll(`SELECT * FROM v_conflict_timeline`)

    // 4. Sanctions network — who sanctions whom most (correlated subquery)
    const topSanctioners = queryAll(`
      SELECT c.name as country, COUNT(*) as sanctionsImposed
      FROM "Sanction" s
      JOIN "Country" c ON s."imposingCountryId" = c.id
      WHERE s."endDate" IS NULL
      GROUP BY c.id
      ORDER BY sanctionsImposed DESC
      LIMIT 10
    `)

    // 5. Most sanctioned countries
    const mostSanctioned = queryAll(`
      SELECT c.name as country, COUNT(*) as sanctionsReceived
      FROM "Sanction" s
      JOIN "Country" c ON s."targetCountryId" = c.id
      WHERE s."endDate" IS NULL
      GROUP BY c.id
      ORDER BY sanctionsReceived DESC
      LIMIT 10
    `)

    // 6. Top trade pairs — multi-table JOIN with SUM aggregate
    const topTradePairs = queryAll(`
      SELECT c1.name as countryA, c2.name as countryB,
        SUM(t."tradeVolumeUsd") as totalVolume,
        COUNT(*) as dataPoints
      FROM "TradeRelation" t
      JOIN "Country" c1 ON t."countryAId" = c1.id
      JOIN "Country" c2 ON t."countryBId" = c2.id
      GROUP BY t."countryAId", t."countryBId", c1.name, c2.name
      ORDER BY totalVolume DESC
      LIMIT 10
    `)

    // 7. GDP vs Military spending ratio — CTE + Window Function (using database VIEW)
    const gdpMilRatio = queryAll(`SELECT * FROM v_gdp_military_ratio`)

    // 8. Alliance types distribution — GROUP BY with NULL filter
    const allianceTypes = queryAll(`
      SELECT "allianceType", COUNT(*) as count
      FROM "Alliance"
      WHERE "endDate" IS NULL
      GROUP BY "allianceType"
      ORDER BY count DESC
    `)

    return NextResponse.json({
      mostConnected, conflictsByType, conflictsPerDecade,
      topSanctioners, mostSanctioned, topTradePairs,
      gdpMilRatio, allianceTypes,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 })
  }
}
