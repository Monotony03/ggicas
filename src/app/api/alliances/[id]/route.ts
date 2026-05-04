import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const alliance = await prisma.alliance.findUnique({
      where: { id },
      include: { countryA: true, countryB: true, organization: true }
    })
    if (!alliance) return NextResponse.json({ error: 'Alliance not found' }, { status: 404 })
    return NextResponse.json(alliance)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch alliance' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { allianceType, motivation, startDate, endDate } = body

    const updated = await prisma.alliance.update({
      where: { id },
      data: {
        ...(allianceType && { allianceType }),
        ...(motivation !== undefined && { motivation }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      }
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update alliance' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.alliance.delete({ where: { id } })
    return NextResponse.json({ message: 'Alliance deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete alliance' }, { status: 500 })
  }
}
