import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute, generateId } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortDir = searchParams.get('sortDir') === 'desc' ? 'DESC' : 'ASC'

    // Whitelist sortable columns to prevent SQL injection
    const allowedSortColumns: Record<string, string> = {
      name: 'c.name', isoCode: 'c.isoCode', region: 'c.region',
      gdpCurrentUsd: 'c.gdpCurrentUsd', militaryBudget: 'c.militaryBudget',
    }
    const orderCol = allowedSortColumns[sortBy] || 'c.name'

    // ── Build dynamic WHERE clause ────────────────────────────────────
    const conditions: string[] = []
    const params: unknown[] = []

    if (search) {
      conditions.push(`(c.name LIKE ? OR c.isoCode LIKE ?)`)
      params.push(`%${search}%`, `%${search}%`)
    }
    if (region) {
      conditions.push(`c.region = ?`)
      params.push(region)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // ── COUNT for pagination ──────────────────────────────────────────
    const countRow = queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM "Country" c ${whereClause}`, params
    )
    const total = countRow?.total ?? 0

    // ── Main query with LEFT JOIN on Leaders (with temporal filter) ───
    let leaderJoinCondition = ''
    const mainParams = [...params]

    if (yearStr) {
      leaderJoinCondition = `AND l."startDate" <= ? AND (l."endDate" IS NULL OR l."endDate" >= ?)`
      const yearDate = `${yearStr}-01-01T00:00:00.000Z`
      mainParams.push(yearDate, yearDate)
    }

    const offset = (page - 1) * limit
    mainParams.push(limit, offset)

    const rows = queryAll<Record<string, unknown>>(`
      SELECT c.*, l.id as leader_id, l.name as leader_name, l.title as leader_title,
             l."startDate" as leader_startDate, l."endDate" as leader_endDate
      FROM "Country" c
      LEFT JOIN "Leader" l ON l."countryId" = c.id ${leaderJoinCondition}
      ${whereClause}
      ORDER BY ${orderCol} ${sortDir}
      LIMIT ? OFFSET ?
    `, mainParams)

    // ── Group leaders under their countries ───────────────────────────
    const countryMap = new Map<string, Record<string, unknown>>()
    for (const row of rows) {
      const cId = row.id as string
      if (!countryMap.has(cId)) {
        countryMap.set(cId, {
          id: row.id, name: row.name, isoCode: row.isoCode, region: row.region,
          gdpCurrentUsd: row.gdpCurrentUsd, militaryBudget: row.militaryBudget,
          createdAt: row.createdAt, updatedAt: row.updatedAt,
          leaders: [],
        })
      }
      if (row.leader_id) {
        (countryMap.get(cId)!.leaders as unknown[]).push({
          id: row.leader_id, name: row.leader_name, title: row.leader_title,
          countryId: cId, startDate: row.leader_startDate, endDate: row.leader_endDate,
        })
      }
    }

    return NextResponse.json({
      data: Array.from(countryMap.values()),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, isoCode, region, gdpCurrentUsd, militaryBudget } = body
    if (!name || !isoCode || !region) {
      return NextResponse.json({ error: 'name, isoCode and region are required' }, { status: 400 })
    }
    const id = generateId()
    const now = new Date().toISOString()
    execute(
      `INSERT INTO "Country" (id, name, isoCode, region, gdpCurrentUsd, militaryBudget, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, isoCode, region, gdpCurrentUsd ? parseFloat(gdpCurrentUsd) : null, militaryBudget ? parseFloat(militaryBudget) : null, now, now]
    )
    const country = queryOne(`SELECT * FROM "Country" WHERE id = ?`, [id])
    return NextResponse.json(country, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 })
  }
}
