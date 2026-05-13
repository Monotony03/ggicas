import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute, generateId } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')

    const conditions: string[] = []
    const params: unknown[] = []

    if (yearStr) {
      const yearDate = `${yearStr}-01-01T00:00:00.000Z`
      conditions.push(`s."startDate" <= ?`)
      params.push(yearDate)
      conditions.push(`(s."endDate" IS NULL OR s."endDate" >= ?)`)
      params.push(yearDate)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const sanctions = queryAll(`
      SELECT s.*,
        ic.id as ic_id, ic.name as ic_name, ic.isoCode as ic_iso, ic.region as ic_region,
          ic.gdpCurrentUsd as ic_gdp, ic.militaryBudget as ic_mil,
        tc.id as tc_id, tc.name as tc_name, tc.isoCode as tc_iso, tc.region as tc_region,
          tc.gdpCurrentUsd as tc_gdp, tc.militaryBudget as tc_mil
      FROM "Sanction" s
      JOIN "Country" ic ON s."imposingCountryId" = ic.id
      JOIN "Country" tc ON s."targetCountryId" = tc.id
      ${whereClause}
    `, params) as Record<string, unknown>[]

    const data = sanctions.map(s => ({
      id: s.id, imposingCountryId: s.imposingCountryId, targetCountryId: s.targetCountryId,
      sanctionType: s.sanctionType, startDate: s.startDate, endDate: s.endDate,
      imposingCountry: { id: s.ic_id, name: s.ic_name, isoCode: s.ic_iso, region: s.ic_region, gdpCurrentUsd: s.ic_gdp, militaryBudget: s.ic_mil },
      targetCountry: { id: s.tc_id, name: s.tc_name, isoCode: s.tc_iso, region: s.tc_region, gdpCurrentUsd: s.tc_gdp, militaryBudget: s.tc_mil },
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch sanctions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imposingCountryId, targetCountryId, sanctionType, startDate, endDate } = body
    if (!imposingCountryId || !targetCountryId || !sanctionType || !startDate) {
      return NextResponse.json({ error: 'imposingCountryId, targetCountryId, sanctionType and startDate are required' }, { status: 400 })
    }
    const id = generateId()
    execute(
      `INSERT INTO "Sanction" (id, "imposingCountryId", "targetCountryId", "sanctionType", "startDate", "endDate")
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, imposingCountryId, targetCountryId, sanctionType, new Date(startDate).toISOString(), endDate ? new Date(endDate).toISOString() : null]
    )
    const sanction = queryOne(`SELECT * FROM "Sanction" WHERE id = ?`, [id])
    return NextResponse.json(sanction, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create sanction' }, { status: 500 })
  }
}
