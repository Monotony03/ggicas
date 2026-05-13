import { NextResponse, NextRequest } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || '2024');
    const window = 3; // ±3 year sliding window so the slider always shows data

    const transfers = queryAll(`
      SELECT at.*,
        ex.id as ex_id, ex.name as ex_name, ex.isoCode as ex_iso,
        im.id as im_id, im.name as im_name, im.isoCode as im_iso
      FROM "ArmsTransfer" at
      JOIN "Country" ex ON at."exporterId" = ex.id
      JOIN "Country" im ON at."importerId" = im.id
      WHERE at.year >= ? AND at.year <= ?
      ORDER BY at."volumeTIV" DESC
      LIMIT 60
    `, [year - window, year + window]) as Record<string, unknown>[];

    const data = transfers.map(t => ({
      id: t.id, exporterId: t.exporterId, importerId: t.importerId,
      weaponType: t.weaponType, year: t.year, volumeTIV: t.volumeTIV,
      exporter: { id: t.ex_id, name: t.ex_name, isoCode: t.ex_iso },
      importer: { id: t.im_id, name: t.im_name, isoCode: t.im_iso },
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch arms transfers:", error);
    return NextResponse.json({ error: 'Failed to fetch arms transfers' }, { status: 500 });
  }
}
