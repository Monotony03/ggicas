import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute, generateId } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const conditions: string[] = []
    const params: unknown[] = []

    if (yearStr) {
      const yearDate = `${yearStr}-01-01T00:00:00.000Z`
      conditions.push(`a."startDate" <= ?`)
      params.push(yearDate)
      conditions.push(`(a."endDate" IS NULL OR a."endDate" >= ?)`)
      params.push(yearDate)
    }
    if (search) {
      conditions.push(`a."allianceType" LIKE ?`)
      params.push(`%${search}%`)
    }
    if (type) {
      conditions.push(`a."allianceType" = ?`)
      params.push(type)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countRow = queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM "Alliance" a ${whereClause}`, params)
    const total = countRow?.total ?? 0

    const offset = (page - 1) * limit
    const mainParams = [...params, limit, offset]

    const alliances = queryAll(`
      SELECT a.*,
        cA.id as cA_id, cA.name as cA_name, cA.isoCode as cA_iso, cA.region as cA_region,
          cA.gdpCurrentUsd as cA_gdp, cA.militaryBudget as cA_mil,
        cB.id as cB_id, cB.name as cB_name, cB.isoCode as cB_iso, cB.region as cB_region,
          cB.gdpCurrentUsd as cB_gdp, cB.militaryBudget as cB_mil,
        org.id as org_id, org.name as org_name, org.type as org_type
      FROM "Alliance" a
      JOIN "Country" cA ON a."countryAId" = cA.id
      LEFT JOIN "Country" cB ON a."countryBId" = cB.id
      LEFT JOIN "Organization" org ON a."organizationId" = org.id
      ${whereClause}
      ORDER BY a."startDate" DESC
      LIMIT ? OFFSET ?
    `, mainParams) as Record<string, unknown>[]

    const data = alliances.map(a => ({
      id: a.id, countryAId: a.countryAId, countryBId: a.countryBId,
      organizationId: a.organizationId, allianceType: a.allianceType,
      motivation: a.motivation, startDate: a.startDate, endDate: a.endDate,
      countryA: { id: a.cA_id, name: a.cA_name, isoCode: a.cA_iso, region: a.cA_region, gdpCurrentUsd: a.cA_gdp, militaryBudget: a.cA_mil },
      countryB: a.cB_id ? { id: a.cB_id, name: a.cB_name, isoCode: a.cB_iso, region: a.cB_region, gdpCurrentUsd: a.cB_gdp, militaryBudget: a.cB_mil } : null,
      organization: a.org_id ? { id: a.org_id, name: a.org_name, type: a.org_type } : null,
    }))

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch alliances' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { countryAId, countryBId, organizationId, allianceType, motivation, startDate, endDate } = body
    if (!countryAId || !allianceType || !startDate) {
      return NextResponse.json({ error: 'countryAId, allianceType and startDate are required' }, { status: 400 })
    }
    const id = generateId()
    execute(
      `INSERT INTO "Alliance" (id, "countryAId", "countryBId", "organizationId", "allianceType", motivation, "startDate", "endDate")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, countryAId, countryBId || null, organizationId || null, allianceType, motivation || null, new Date(startDate).toISOString(), endDate ? new Date(endDate).toISOString() : null]
    )
    const alliance = queryOne(`SELECT * FROM "Alliance" WHERE id = ?`, [id])
    return NextResponse.json(alliance, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create alliance' }, { status: 500 })
  }
}
