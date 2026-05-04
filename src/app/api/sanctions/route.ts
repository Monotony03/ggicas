import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')
    let whereClause = {}

    if (yearStr) {
      const yearDate = new Date(`${yearStr}-01-01`)
      whereClause = {
        startDate: { lte: yearDate },
        OR: [
          { endDate: null },
          { endDate: { gte: yearDate } }
        ]
      }
    }

    const sanctions = await prisma.sanction.findMany({
      where: whereClause,
      include: {
        imposingCountry: true,
        targetCountry: true,
      }
    })
    return NextResponse.json(sanctions)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch sanctions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imposingCountryId, targetCountryId, sanctionType, startDate, endDate } = body
    if (!imposingCountryId || !targetCountryId || !sanctionType || !startDate) {
      return NextResponse.json({ error: 'imposingCountryId, targetCountryId, sanctionType and startDate are required' }, { status: 400 })
    }
    const sanction = await prisma.sanction.create({
      data: {
        imposingCountryId,
        targetCountryId,
        sanctionType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      }
    })
    return NextResponse.json(sanction, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create sanction' }, { status: 500 })
  }
}
