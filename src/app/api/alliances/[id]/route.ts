import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const row = queryOne<Record<string, unknown>>(`
      SELECT a.*,
        cA.id as cA_id, cA.name as cA_name, cA.isoCode as cA_iso, cA.region as cA_region,
        cB.id as cB_id, cB.name as cB_name, cB.isoCode as cB_iso, cB.region as cB_region,
        org.id as org_id, org.name as org_name, org.type as org_type
      FROM "Alliance" a
      JOIN "Country" cA ON a."countryAId" = cA.id
      LEFT JOIN "Country" cB ON a."countryBId" = cB.id
      LEFT JOIN "Organization" org ON a."organizationId" = org.id
      WHERE a.id = ?
    `, [id])
    if (!row) return NextResponse.json({ error: 'Alliance not found' }, { status: 404 })

    return NextResponse.json({
      id: row.id, countryAId: row.countryAId, countryBId: row.countryBId,
      organizationId: row.organizationId, allianceType: row.allianceType,
      motivation: row.motivation, startDate: row.startDate, endDate: row.endDate,
      countryA: { id: row.cA_id, name: row.cA_name, isoCode: row.cA_iso, region: row.cA_region },
      countryB: row.cB_id ? { id: row.cB_id, name: row.cB_name, isoCode: row.cB_iso, region: row.cB_region } : null,
      organization: row.org_id ? { id: row.org_id, name: row.org_name, type: row.org_type } : null,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch alliance' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { allianceType, motivation, startDate, endDate } = body

    const sets: string[] = []
    const values: unknown[] = []

    if (allianceType) { sets.push(`"allianceType" = ?`); values.push(allianceType) }
    if (motivation !== undefined) { sets.push(`motivation = ?`); values.push(motivation) }
    if (startDate) { sets.push(`"startDate" = ?`); values.push(new Date(startDate).toISOString()) }
    if (endDate !== undefined) { sets.push(`"endDate" = ?`); values.push(endDate ? new Date(endDate).toISOString() : null) }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    values.push(id)

    execute(`UPDATE "Alliance" SET ${sets.join(', ')} WHERE id = ?`, values)
    const updated = queryOne(`SELECT * FROM "Alliance" WHERE id = ?`, [id])
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update alliance' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    execute(`DELETE FROM "Alliance" WHERE id = ?`, [id])
    return NextResponse.json({ message: 'Alliance deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete alliance' }, { status: 500 })
  }
}
