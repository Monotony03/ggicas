import axios from 'axios';
import { queryOne, execute, generateId } from '../db';

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
      // Find country by name
      const country = queryOne<{ id: string }>(
        `SELECT id FROM "Country" WHERE name = ?`,
        [event.country]
      );
      if (!country) continue;

      // Find or create the conflict
      const conflictName = `ACLED: ${event.event_type} in ${event.country}`;
      let conflict = queryOne<{ id: string }>(
        `SELECT id FROM "Conflict" WHERE name = ?`,
        [conflictName]
      );

      if (!conflict) {
        const conflictId = generateId();
        const now = new Date().toISOString();
        execute(
          `INSERT INTO "Conflict" (id, name, type, cause, "startDate", "endDate", "createdAt", "updatedAt")
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [conflictId, conflictName, event.event_type, event.notes, new Date(event.event_date).toISOString(), null, now, now]
        );
        conflict = { id: conflictId };
      }

      // Add involvement if not exists
      const existingInvolvement = queryOne(
        `SELECT id FROM "ConflictInvolvement" WHERE "conflictId" = ? AND "countryId" = ?`,
        [conflict.id, country.id]
      );

      if (!existingInvolvement) {
        execute(
          `INSERT INTO "ConflictInvolvement" (id, "conflictId", "countryId", role, "startDate", "endDate")
           VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId(), conflict.id, country.id, 'Participant', new Date(event.event_date).toISOString(), null]
        );
        importedCount++;
      }
    }

    return { success: true, message: `Successfully imported/updated ${importedCount} conflict involvements from ACLED.` };
  } catch (error) {
    console.error('ACLED Sync Error:', error);
    return { success: false, error: 'Failed to sync with ACLED API' };
  }
}
