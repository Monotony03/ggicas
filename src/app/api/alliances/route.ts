import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}

    if (yearStr) {
      const yearDate = new Date(`${yearStr}-01-01`)
      where.startDate = { lte: yearDate }
      where.OR = [
        { endDate: null },
        { endDate: { gte: yearDate } }
      ]
    }

    if (search) {
      where.allianceType = { contains: search }
    }
    if (type) {
      where.allianceType = type
    }

    const total = await prisma.alliance.count({ where })

    const alliances = await prisma.alliance.findMany({
      where,
      include: {
        countryA: true,
        countryB: true,
        organization: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({
      data: alliances,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch alliances' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { countryAId, countryBId, organizationId, allianceType, motivation, startDate, endDate } = body
    if (!countryAId || !allianceType || !startDate) {
      return NextResponse.json({ error: 'countryAId, allianceType and startDate are required' }, { status: 400 })
    }
    const alliance = await prisma.alliance.create({
      data: {
        countryAId,
        countryBId: countryBId || null,
        organizationId: organizationId || null,
        allianceType,
        motivation: motivation || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      }
    })
    return NextResponse.json(alliance, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create alliance' }, { status: 500 })
  }
}
