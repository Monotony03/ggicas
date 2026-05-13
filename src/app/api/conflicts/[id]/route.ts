import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute, transaction } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Multi-table JOIN: conflict → participants → country → alliances, sanctions, arms
    const conflict = queryOne(`SELECT * FROM "Conflict" WHERE id = ?`, [id])
    if (!conflict) return NextResponse.json({ error: 'Conflict not found' }, { status: 404 })

    // Get participants with their country data
    const participants = queryAll(`
      SELECT ci.*, c.id as country_id, c.name as country_name, c.isoCode as country_isoCode,
             c.region as country_region, c.gdpCurrentUsd as country_gdp, c.militaryBudget as country_milBudget
      FROM "ConflictInvolvement" ci
      JOIN "Country" c ON ci."countryId" = c.id
      WHERE ci."conflictId" = ?
    `, [id]) as Record<string, unknown>[]

    // For each participant, fetch their alliances, sanctions, and arms imports
    const enrichedParticipants = participants.map(p => {
      const countryId = p.country_id as string

      const alliances = queryAll(`
        SELECT a.*, org.name as org_name, org.type as org_type
        FROM "Alliance" a
        LEFT JOIN "Organization" org ON a."organizationId" = org.id
        WHERE a."countryAId" = ?
      `, [countryId]) as Record<string, unknown>[]

      const sanctionsIn = queryAll(`
        SELECT s.*, ic.name as imposing_name, ic.isoCode as imposing_iso
        FROM "Sanction" s
        JOIN "Country" ic ON s."imposingCountryId" = ic.id
        WHERE s."targetCountryId" = ?
      `, [countryId]) as Record<string, unknown>[]

      const armsImports = queryAll(`
        SELECT at.*, ex.name as exporter_name, ex.isoCode as exporter_iso
        FROM "ArmsTransfer" at
        JOIN "Country" ex ON at."exporterId" = ex.id
        WHERE at."importerId" = ?
        ORDER BY at.year DESC
        LIMIT 2
      `, [countryId]) as Record<string, unknown>[]

      return {
        id: p.id, conflictId: p.conflictId, countryId: p.countryId,
        role: p.role, startDate: p.startDate, endDate: p.endDate,
        country: {
          id: countryId, name: p.country_name, isoCode: p.country_isoCode,
          region: p.country_region, gdpCurrentUsd: p.country_gdp, militaryBudget: p.country_milBudget,
          alliancesA: alliances.map(a => ({
            ...a,
            organization: a.org_name ? { name: a.org_name, type: a.org_type } : null,
          })),
          sanctionsIn: sanctionsIn.map(s => ({
            ...s,
            imposingCountry: { name: s.imposing_name, isoCode: s.imposing_iso },
          })),
          armsImports: armsImports.map(ai => ({
            ...ai,
            exporter: { name: ai.exporter_name, isoCode: ai.exporter_iso },
          })),
        },
      }
    })

    return NextResponse.json({ ...conflict, participants: enrichedParticipants })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conflict' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, cause, startDate, endDate } = body

    const sets: string[] = []
    const values: unknown[] = []

    if (name) { sets.push(`name = ?`); values.push(name) }
    if (type) { sets.push(`type = ?`); values.push(type) }
    if (cause !== undefined) { sets.push(`cause = ?`); values.push(cause) }
    if (startDate) { sets.push(`"startDate" = ?`); values.push(new Date(startDate).toISOString()) }
    if (endDate !== undefined) { sets.push(`"endDate" = ?`); values.push(endDate ? new Date(endDate).toISOString() : null) }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

    sets.push(`"updatedAt" = ?`)
    values.push(new Date().toISOString())
    values.push(id)

    execute(`UPDATE "Conflict" SET ${sets.join(', ')} WHERE id = ?`, values)
    const updated = queryOne(`SELECT * FROM "Conflict" WHERE id = ?`, [id])
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update conflict' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // ACID Transaction: atomically remove conflict and all participant records
    transaction(() => {
      execute(`DELETE FROM "ConflictInvolvement" WHERE "conflictId" = ?`, [id])
      execute(`DELETE FROM "Conflict" WHERE id = ?`, [id])
    })
    return NextResponse.json({ message: 'Conflict deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete conflict' }, { status: 500 })
  }
}
