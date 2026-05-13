import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute, generateId } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor') // High-performance Keyset Pagination cursor

    const conditions: string[] = []
    const params: unknown[] = []

    // Temporal filter
    if (yearStr) {
      const yearDate = `${yearStr}-01-01T00:00:00.000Z`
      conditions.push(`cf."startDate" <= ?`)
      params.push(yearDate)
      conditions.push(`(cf."endDate" IS NULL OR cf."endDate" >= ?)`)
      params.push(yearDate)
    }
    if (search) {
      conditions.push(`cf.name LIKE ?`)
      params.push(`%${search}%`)
    }
    if (type) {
      conditions.push(`cf.type = ?`)
      params.push(type)
    }

    // Keyset Pagination (Cursor) Logic
    // In advanced DBs, we filter by ID instead of using OFFSET for O(log n) performance
    if (cursor) {
      conditions.push(`cf.id > ?`)
      params.push(cursor)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count for pagination
    const countRow = queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM "Conflict" cf ${whereClause}`, params)
    const total = countRow?.total ?? 0

    const offset = cursor ? 0 : (page - 1) * limit
    const mainParams = [...params, limit, offset]

    // Get conflicts
    // Note: Keyset pagination requires a deterministic order (e.g. ID)
    const conflicts = queryAll(`
      SELECT * FROM "Conflict" cf
      ${whereClause}
      ORDER BY cf.id ASC
      LIMIT ? OFFSET ?
    `, mainParams) as any[]

    // Get participants for each conflict (batch query)
    const conflictIds = (conflicts as { id: string }[]).map(c => c.id)
    let participantsMap = new Map<string, unknown[]>()

    if (conflictIds.length > 0) {
      const placeholders = conflictIds.map(() => '?').join(',')
      const participants = queryAll(`
        SELECT ci.*, c.id as country_id, c.name as country_name, c.isoCode as country_isoCode, c.region as country_region
        FROM "ConflictInvolvement" ci
        JOIN "Country" c ON ci."countryId" = c.id
        WHERE ci."conflictId" IN (${placeholders})
      `, conflictIds)

      for (const p of participants as Record<string, unknown>[]) {
        const cfId = p.conflictId as string
        if (!participantsMap.has(cfId)) participantsMap.set(cfId, [])
        participantsMap.get(cfId)!.push({
          id: p.id, conflictId: p.conflictId, countryId: p.countryId,
          role: p.role, startDate: p.startDate, endDate: p.endDate,
          country: {
            id: p.country_id, name: p.country_name,
            isoCode: p.country_isoCode, region: p.country_region,
          }
        })
      }
    }

    const data = (conflicts as { id: string }[]).map(cf => ({
      ...cf,
      participants: participantsMap.get(cf.id) || [],
    }))

    const nextCursor = data.length > 0 ? data[data.length - 1].id : null

    return NextResponse.json({
      data,
      pagination: { 
        page: cursor ? null : page, 
        limit, 
        total, 
        totalPages: Math.ceil(total / limit),
        nextCursor // The "Key" for the next batch of data
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch conflicts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, cause, startDate, endDate } = body
    if (!name || !type || !startDate) {
      return NextResponse.json({ error: 'name, type and startDate are required' }, { status: 400 })
    }
    const id = generateId()
    const now = new Date().toISOString()
    execute(
      `INSERT INTO "Conflict" (id, name, type, cause, "startDate", "endDate", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type, cause || null, new Date(startDate).toISOString(), endDate ? new Date(endDate).toISOString() : null, now, now]
    )
    const conflict = queryOne(`SELECT * FROM "Conflict" WHERE id = ?`, [id])
    return NextResponse.json(conflict, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create conflict' }, { status: 500 })
  }
}
