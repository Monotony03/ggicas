import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearStr = searchParams.get('year')
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortDir = searchParams.get('sortDir') === 'desc' ? 'desc' as const : 'asc' as const

    // Build where clause with search + filter
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { isoCode: { contains: search } },
      ]
    }
    if (region) {
      where.region = region
    }

    // Leader temporal filter
    let leaderWhereClause = {}
    if (yearStr) {
      const yearDate = new Date(`${yearStr}-01-01`)
      leaderWhereClause = {
        startDate: { lte: yearDate },
        OR: [
          { endDate: null },
          { endDate: { gte: yearDate } }
        ]
      }
    }

    // Get total count for pagination metadata
    const total = await prisma.country.count({ where })

    // Paginated, sorted, filtered query
    const countries = await prisma.country.findMany({
      where,
      include: {
        leaders: { where: leaderWhereClause }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortDir },
    })

    // Return with pagination metadata
    return NextResponse.json({
      data: countries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, isoCode, region, gdpCurrentUsd, militaryBudget } = body
    if (!name || !isoCode || !region) {
      return NextResponse.json({ error: 'name, isoCode and region are required' }, { status: 400 })
    }
    const country = await prisma.country.create({
      data: {
        name,
        isoCode,
        region,
        gdpCurrentUsd: gdpCurrentUsd ? parseFloat(gdpCurrentUsd) : null,
        militaryBudget: militaryBudget ? parseFloat(militaryBudget) : null,
      }
    })
    return NextResponse.json(country, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 })
  }
}
