import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || '2024');
    const window = 3; // ±3 year sliding window so the slider always shows data

    const transfers = await prisma.armsTransfer.findMany({
      where: {
        year: {
          gte: year - window,
          lte: year + window,
        },
      },
      include: {
        exporter: { select: { id: true, name: true, isoCode: true } },
        importer: { select: { id: true, name: true, isoCode: true } },
      },
      orderBy: { volumeTIV: 'desc' },
      take: 60, // cap to avoid flooding the globe with too many arcs
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Failed to fetch arms transfers:", error);
    return NextResponse.json({ error: 'Failed to fetch arms transfers' }, { status: 500 });
  }
}
