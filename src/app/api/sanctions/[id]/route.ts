import { NextResponse, NextRequest } from 'next/server'
import { queryOne, execute } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const row = queryOne<Record<string, unknown>>(`
      SELECT s.*,
        ic.id as ic_id, ic.name as ic_name, ic.isoCode as ic_iso, ic.region as ic_region,
        tc.id as tc_id, tc.name as tc_name, tc.isoCode as tc_iso, tc.region as tc_region
      FROM "Sanction" s
      JOIN "Country" ic ON s."imposingCountryId" = ic.id
      JOIN "Country" tc ON s."targetCountryId" = tc.id
      WHERE s.id = ?
    `, [id])
    if (!row) return NextResponse.json({ error: 'Sanction not found' }, { status: 404 })

    return NextResponse.json({
      id: row.id, imposingCountryId: row.imposingCountryId, targetCountryId: row.targetCountryId,
      sanctionType: row.sanctionType, startDate: row.startDate, endDate: row.endDate,
      imposingCountry: { id: row.ic_id, name: row.ic_name, isoCode: row.ic_iso, region: row.ic_region },
      targetCountry: { id: row.tc_id, name: row.tc_name, isoCode: row.tc_iso, region: row.tc_region },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sanction' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { sanctionType, startDate, endDate } = body

    const sets: string[] = []
    const values: unknown[] = []

    if (sanctionType) { sets.push(`"sanctionType" = ?`); values.push(sanctionType) }
    if (startDate) { sets.push(`"startDate" = ?`); values.push(new Date(startDate).toISOString()) }
    if (endDate !== undefined) { sets.push(`"endDate" = ?`); values.push(endDate ? new Date(endDate).toISOString() : null) }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    values.push(id)

    execute(`UPDATE "Sanction" SET ${sets.join(', ')} WHERE id = ?`, values)
    const updated = queryOne(`SELECT * FROM "Sanction" WHERE id = ?`, [id])
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update sanction' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    execute(`DELETE FROM "Sanction" WHERE id = ?`, [id])
    return NextResponse.json({ message: 'Sanction deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete sanction' }, { status: 500 })
  }
}
