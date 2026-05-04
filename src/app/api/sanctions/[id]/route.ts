import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sanction = await prisma.sanction.findUnique({
      where: { id },
      include: { imposingCountry: true, targetCountry: true }
    })
    if (!sanction) return NextResponse.json({ error: 'Sanction not found' }, { status: 404 })
    return NextResponse.json(sanction)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sanction' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { sanctionType, startDate, endDate } = body

    const updated = await prisma.sanction.update({
      where: { id },
      data: {
        ...(sanctionType && { sanctionType }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      }
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update sanction' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.sanction.delete({ where: { id } })
    return NextResponse.json({ message: 'Sanction deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete sanction' }, { status: 500 })
  }
}
