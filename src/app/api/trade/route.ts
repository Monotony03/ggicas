import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')
    let whereClause = {}

    if (yearStr) {
      whereClause = { year: parseInt(yearStr) }
    }

    const trades = await prisma.tradeRelation.findMany({
      where: whereClause,
      include: {
        countryA: true,
        countryB: true,
      }
    })
    return NextResponse.json(trades)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch trade relations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { countryAId, countryBId, year, tradeVolumeUsd } = body
    if (!countryAId || !countryBId || !year) {
      return NextResponse.json({ error: 'countryAId, countryBId and year are required' }, { status: 400 })
    }
    const trade = await prisma.tradeRelation.create({
      data: {
        countryAId,
        countryBId,
        year: parseInt(year),
        tradeVolumeUsd: tradeVolumeUsd ? parseFloat(tradeVolumeUsd) : null,
      }
    })
    return NextResponse.json(trade, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create trade relation' }, { status: 500 })
  }
}
