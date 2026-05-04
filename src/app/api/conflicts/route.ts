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

    // Temporal filter
    if (yearStr) {
      const yearDate = new Date(`${yearStr}-01-01`)
      where.startDate = { lte: yearDate }
      where.OR = [
        { endDate: null },
        { endDate: { gte: yearDate } }
      ]
    }

    // Search filter (LIKE)
    if (search) {
      where.name = { contains: search }
    }
    if (type) {
      where.type = type
    }

    const total = await prisma.conflict.count({ where })

    const conflicts = await prisma.conflict.findMany({
      where,
      include: {
        participants: {
          include: { country: true }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({
      data: conflicts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch conflicts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, cause, startDate, endDate } = body
    if (!name || !type || !startDate) {
      return NextResponse.json({ error: 'name, type and startDate are required' }, { status: 400 })
    }
    const conflict = await prisma.conflict.create({
      data: {
        name,
        type,
        cause: cause || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      }
    })
    return NextResponse.json(conflict, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create conflict' }, { status: 500 })
  }
}
