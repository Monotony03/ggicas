import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const conflict = await prisma.conflict.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            country: {
              include: {
                alliancesA: { include: { organization: true } },
                sanctionsIn: { include: { imposingCountry: true } },
                armsImports: {
                  orderBy: { year: 'desc' },
                  take: 2,
                  include: { exporter: true }
                }
              }
            }
          }
        }
      }
    })
    if (!conflict) return NextResponse.json({ error: 'Conflict not found' }, { status: 404 })
    return NextResponse.json(conflict)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conflict' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, cause, startDate, endDate } = body

    const updated = await prisma.conflict.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(cause !== undefined && { cause }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      }
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update conflict' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // ACID Transaction: atomically remove conflict and all participant records
    await prisma.$transaction(async (tx) => {
      await tx.conflictInvolvement.deleteMany({ where: { conflictId: id } })
      await tx.conflict.delete({ where: { id } })
    })
    return NextResponse.json({ message: 'Conflict deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete conflict' }, { status: 500 })
  }
}
