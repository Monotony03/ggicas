import { NextResponse, NextRequest } from 'next/server'
import { queryAll, queryOne, execute, generateId } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const country = queryOne(`SELECT * FROM "Country" WHERE id = ?`, [id])
    if (!country) return NextResponse.json({ error: 'Country not found' }, { status: 404 })

    const leaders = queryAll(`SELECT * FROM "Leader" WHERE "countryId" = ? ORDER BY "startDate" DESC`, [id])
    return NextResponse.json({ ...country, leaders })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch country' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, isoCode, region, gdpCurrentUsd, militaryBudget } = body

    // Dynamic UPDATE — only set provided fields
    const sets: string[] = []
    const values: unknown[] = []

    if (name) { sets.push(`name = ?`); values.push(name) }
    if (isoCode) { sets.push(`isoCode = ?`); values.push(isoCode) }
    if (region) { sets.push(`region = ?`); values.push(region) }
    if (gdpCurrentUsd !== undefined) { sets.push(`gdpCurrentUsd = ?`); values.push(gdpCurrentUsd ? parseFloat(gdpCurrentUsd) : null) }
    if (militaryBudget !== undefined) { sets.push(`militaryBudget = ?`); values.push(militaryBudget ? parseFloat(militaryBudget) : null) }

    if (sets.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    sets.push(`updatedAt = ?`)
    values.push(new Date().toISOString())
    values.push(id)

    execute(`UPDATE "Country" SET ${sets.join(', ')} WHERE id = ?`, values)
    const updated = queryOne(`SELECT * FROM "Country" WHERE id = ?`, [id])
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // CASCADE is handled by SQLite foreign key constraints
    execute(`DELETE FROM "Country" WHERE id = ?`, [id])
    return NextResponse.json({ message: 'Country deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete country' }, { status: 500 })
  }
}
