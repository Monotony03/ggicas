import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const country = await prisma.country.findUnique({
      where: { id },
      include: { leaders: true }
    })
    if (!country) return NextResponse.json({ error: 'Country not found' }, { status: 404 })
    return NextResponse.json(country)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch country' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, isoCode, region, gdpCurrentUsd, militaryBudget } = body

    const updated = await prisma.country.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isoCode && { isoCode }),
        ...(region && { region }),
        ...(gdpCurrentUsd !== undefined && { gdpCurrentUsd: gdpCurrentUsd ? parseFloat(gdpCurrentUsd) : null }),
        ...(militaryBudget !== undefined && { militaryBudget: militaryBudget ? parseFloat(militaryBudget) : null }),
      }
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // ACID Transaction: The database will natively handle cascading deletes!
    await prisma.country.delete({ where: { id } })
    return NextResponse.json({ message: 'Country deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete country' }, { status: 500 })
  }
}
