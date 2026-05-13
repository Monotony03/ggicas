import { NextResponse, NextRequest } from 'next/server'
import { queryAll } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Complex multi-table JOIN: find countries connected via shared organizations
    const influencePairs = queryAll(`
      SELECT c1.name as countryA, org.name as sharedOrganization, c2.name as countryB
      FROM "Alliance" a1
      JOIN "Country" c1 ON a1."countryAId" = c1.id
      JOIN "Organization" org ON a1."organizationId" = org.id
      JOIN "Alliance" a2 ON a2."organizationId" = org.id AND a2."countryAId" != c1.id
      JOIN "Country" c2 ON a2."countryAId" = c2.id
      GROUP BY c1.id, c2.id, org.id
    `)

    return NextResponse.json(influencePairs)
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to calculate influence' }, { status: 500 })
  }
}
