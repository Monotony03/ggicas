import axios from 'axios';
import prisma from '../prisma';

const ACLED_API_URL = 'https://api.acleddata.com/acled/read/';

export async function syncAcledData(apiKey: string, email: string) {
  try {
    console.log('Fetching latest ACLED conflict data...');
    // Fetch events from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const response = await axios.get(ACLED_API_URL, {
      params: {
        key: apiKey,
        email: email,
        event_date: dateStr,
        event_date_where: '>=',
        limit: 100, // For demonstration
      }
    });

    const events = response.data.data;
    if (!events || events.length === 0) {
      return { success: true, message: 'No new events found.' };
    }

    let importedCount = 0;

    for (const event of events) {
      // Very simplified mapping of ACLED event to our Conflict schema
      const country = await prisma.country.findFirst({
        where: { name: event.country }
      });

      if (!country) continue;

      // Find or create the conflict
      let conflict = await prisma.conflict.findFirst({
        where: { name: `ACLED: ${event.event_type} in ${event.country}` }
      });

      if (!conflict) {
        conflict = await prisma.conflict.create({
          data: {
            name: `ACLED: ${event.event_type} in ${event.country}`,
            type: event.event_type,
            cause: event.notes,
            startDate: new Date(event.event_date),
            endDate: null,
          }
        });
      }

      // Add involvement
      const existingInvolvement = await prisma.conflictInvolvement.findFirst({
        where: { conflictId: conflict.id, countryId: country.id }
      });

      if (!existingInvolvement) {
        await prisma.conflictInvolvement.create({
          data: {
            conflictId: conflict.id,
            countryId: country.id,
            role: 'Participant', // ACLED actors can be mapped more specifically here
            startDate: new Date(event.event_date),
          }
        });
        importedCount++;
      }
    }

    return { success: true, message: `Successfully imported/updated ${importedCount} conflict involvements from ACLED.` };
  } catch (error) {
    console.error('ACLED Sync Error:', error);
    return { success: false, error: 'Failed to sync with ACLED API' };
  }
}
