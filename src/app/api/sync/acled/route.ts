import { NextResponse } from 'next/server';
import { syncAcledData } from '@/lib/data-pipelines/acledSync';

export async function POST() {
  const apiKey = process.env.ACLED_API_KEY;
  const email = process.env.ACLED_EMAIL;

  if (!apiKey || !email) {
    return NextResponse.json(
      { error: 'ACLED_API_KEY and ACLED_EMAIL must be set in .env' },
      { status: 500 }
    );
  }

  try {
    const result = await syncAcledData(apiKey, email);
    if (!result.success) {
       return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ message: result.message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
