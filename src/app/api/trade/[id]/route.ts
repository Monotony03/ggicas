import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const trade = await prisma.tradeRelation.findUnique({
      where: { id },
      include: { countryA: true, countryB: true }
    })
    if (!trade) return NextResponse.json({ error: 'Trade relation not found' }, { status: 404 })
    return NextResponse.json(trade)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trade relation' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { year, tradeVolumeUsd } = body

    const updated = await prisma.tradeRelation.update({
      where: { id },
      data: {
        ...(year && { year: parseInt(year) }),
        ...(tradeVolumeUsd !== undefined && { tradeVolumeUsd: tradeVolumeUsd ? parseFloat(tradeVolumeUsd) : null }),
      }
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update trade relation' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.tradeRelation.delete({ where: { id } })
    return NextResponse.json({ message: 'Trade relation deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete trade relation' }, { status: 500 })
  }
}
