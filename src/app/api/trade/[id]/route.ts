import { NextResponse, NextRequest } from 'next/server'
import { queryOne, execute } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const row = queryOne<Record<string, unknown>>(`
      SELECT t.*,
        cA.id as cA_id, cA.name as cA_name, cA.isoCode as cA_iso, cA.region as cA_region,
        cB.id as cB_id, cB.name as cB_name, cB.isoCode as cB_iso, cB.region as cB_region
      FROM "TradeRelation" t
      JOIN "Country" cA ON t."countryAId" = cA.id
      JOIN "Country" cB ON t."countryBId" = cB.id
      WHERE t.id = ?
    `, [id])
    if (!row) return NextResponse.json({ error: 'Trade relation not found' }, { status: 404 })

    return NextResponse.json({
      id: row.id, countryAId: row.countryAId, countryBId: row.countryBId,
      year: row.year, tradeVolumeUsd: row.tradeVolumeUsd,
      countryA: { id: row.cA_id, name: row.cA_name, isoCode: row.cA_iso, region: row.cA_region },
      countryB: { id: row.cB_id, name: row.cB_name, isoCode: row.cB_iso, region: row.cB_region },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trade relation' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { year, tradeVolumeUsd } = body

    const sets: string[] = []
    const values: unknown[] = []

    if (year) { sets.push(`year = ?`); values.push(parseInt(year)) }
    if (tradeVolumeUsd !== undefined) { sets.push(`"tradeVolumeUsd" = ?`); values.push(tradeVolumeUsd ? parseFloat(tradeVolumeUsd) : null) }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    values.push(id)

    execute(`UPDATE "TradeRelation" SET ${sets.join(', ')} WHERE id = ?`, values)
    const updated = queryOne(`SELECT * FROM "TradeRelation" WHERE id = ?`, [id])
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update trade relation' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    execute(`DELETE FROM "TradeRelation" WHERE id = ?`, [id])
    return NextResponse.json({ message: 'Trade relation deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete trade relation' }, { status: 500 })
  }
}
