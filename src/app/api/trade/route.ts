import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute, generateId } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')

    const conditions: string[] = []
    const params: unknown[] = []

    if (yearStr) {
      conditions.push(`t.year = ?`)
      params.push(parseInt(yearStr))
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const trades = queryAll(`
      SELECT t.*,
        cA.id as cA_id, cA.name as cA_name, cA.isoCode as cA_iso, cA.region as cA_region,
          cA.gdpCurrentUsd as cA_gdp, cA.militaryBudget as cA_mil,
        cB.id as cB_id, cB.name as cB_name, cB.isoCode as cB_iso, cB.region as cB_region,
          cB.gdpCurrentUsd as cB_gdp, cB.militaryBudget as cB_mil
      FROM "TradeRelation" t
      JOIN "Country" cA ON t."countryAId" = cA.id
      JOIN "Country" cB ON t."countryBId" = cB.id
      ${whereClause}
    `, params) as Record<string, unknown>[]

    const data = trades.map(t => ({
      id: t.id, countryAId: t.countryAId, countryBId: t.countryBId,
      year: t.year, tradeVolumeUsd: t.tradeVolumeUsd,
      countryA: { id: t.cA_id, name: t.cA_name, isoCode: t.cA_iso, region: t.cA_region, gdpCurrentUsd: t.cA_gdp, militaryBudget: t.cA_mil },
      countryB: { id: t.cB_id, name: t.cB_name, isoCode: t.cB_iso, region: t.cB_region, gdpCurrentUsd: t.cB_gdp, militaryBudget: t.cB_mil },
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch trade relations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { countryAId, countryBId, year, tradeVolumeUsd } = body
    if (!countryAId || !countryBId || !year) {
      return NextResponse.json({ error: 'countryAId, countryBId and year are required' }, { status: 400 })
    }
    const id = generateId()
    execute(
      `INSERT INTO "TradeRelation" (id, "countryAId", "countryBId", year, "tradeVolumeUsd")
       VALUES (?, ?, ?, ?, ?)`,
      [id, countryAId, countryBId, parseInt(year), tradeVolumeUsd ? parseFloat(tradeVolumeUsd) : null]
    )
    const trade = queryOne(`SELECT * FROM "TradeRelation" WHERE id = ?`, [id])
    return NextResponse.json(trade, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create trade relation' }, { status: 500 })
  }
}
