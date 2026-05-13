import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

// Types for our "Stored Procedures"
export interface SuccessionInput {
  countryId: string;
  leaderName: string;
  title: string;
  startDate: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SQLite Connection — replaces Prisma ORM with raw SQL via better-sqlite3
   ═══════════════════════════════════════════════════════════════════════════ */

const DB_PATH = path.join(process.cwd(), 'database', 'dev.db');

// Singleton pattern (same approach as a typical DB client)
declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (globalThis.__db) return globalThis.__db;

  const db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  // Enable foreign key enforcement (SQLite has it off by default!)
  db.pragma('foreign_keys = ON');

  // ── Install triggers on first connection ───────────────────────────────
  installTriggers(db);

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__db = db;
  }

  return db;
}

/* ─── Helper: generate cuid-like IDs ─────────────────────────────────────── */
export function generateId(): string {
  return crypto.randomUUID();
}

/* ─── Query helpers ──────────────────────────────────────────────────────── */

/** Run a SELECT that returns multiple rows */
export function queryAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

/** Run a SELECT that returns a single row (or undefined) */
export function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
}

/** Run an INSERT / UPDATE / DELETE and return { changes, lastInsertRowid } */
export function execute(sql: string, params: unknown[] = []): Database.RunResult {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

/** Run multiple statements inside an ACID transaction */
export function transaction<T>(fn: () => T): T {
  const db = getDatabase();
  const txn = db.transaction(fn);
  return txn();
}

/** Get the raw Database instance (for advanced use) */
export function getDb(): Database.Database {
  return getDatabase();
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRIGGERS — installed once per connection
   SQLite triggers for audit logging and auto-timestamps
   ═══════════════════════════════════════════════════════════════════════════ */
function installTriggers(db: Database.Database) {
  // Only install if AuditLog table exists
  const auditTableExists = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='AuditLog'`
  ).get();

  if (!auditTableExists) return;

  // ── Trigger 1: Audit UPDATE on Country ───────────────────────────────
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_country_update
    AFTER UPDATE ON "Country"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Country',
        OLD.id,
        'UPDATE',
        json_object(
          'name', OLD.name, 'isoCode', OLD.isoCode, 'region', OLD.region,
          'gdpCurrentUsd', OLD.gdpCurrentUsd, 'militaryBudget', OLD.militaryBudget
        ),
        json_object(
          'name', NEW.name, 'isoCode', NEW.isoCode, 'region', NEW.region,
          'gdpCurrentUsd', NEW.gdpCurrentUsd, 'militaryBudget', NEW.militaryBudget
        ),
        datetime('now')
      );
    END;
  `);

  // ── Trigger 2: Audit DELETE on Country ───────────────────────────────
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_country_delete
    AFTER DELETE ON "Country"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Country',
        OLD.id,
        'DELETE',
        json_object(
          'name', OLD.name, 'isoCode', OLD.isoCode, 'region', OLD.region,
          'gdpCurrentUsd', OLD.gdpCurrentUsd, 'militaryBudget', OLD.militaryBudget
        ),
        NULL,
        datetime('now')
      );
    END;
  `);

  // ── Trigger 3: Audit INSERT/UPDATE/DELETE on Sanction ────────────────
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_sanction_insert
    AFTER INSERT ON "Sanction"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Sanction',
        NEW.id,
        'INSERT',
        NULL,
        json_object(
          'imposingCountryId', NEW.imposingCountryId, 'targetCountryId', NEW.targetCountryId,
          'sanctionType', NEW.sanctionType, 'startDate', NEW.startDate
        ),
        datetime('now')
      );
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_sanction_update
    AFTER UPDATE ON "Sanction"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Sanction',
        OLD.id,
        'UPDATE',
        json_object(
          'imposingCountryId', OLD.imposingCountryId, 'targetCountryId', OLD.targetCountryId,
          'sanctionType', OLD.sanctionType, 'startDate', OLD.startDate
        ),
        json_object(
          'imposingCountryId', NEW.imposingCountryId, 'targetCountryId', NEW.targetCountryId,
          'sanctionType', NEW.sanctionType, 'startDate', NEW.startDate
        ),
        datetime('now')
      );
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_sanction_delete
    AFTER DELETE ON "Sanction"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Sanction',
        OLD.id,
        'DELETE',
        json_object(
          'imposingCountryId', OLD.imposingCountryId, 'targetCountryId', OLD.targetCountryId,
          'sanctionType', OLD.sanctionType, 'startDate', OLD.startDate
        ),
        NULL,
        datetime('now')
      );
    END;
  `);

  // ── Trigger 4: Audit INSERT/UPDATE/DELETE on Conflict ────────────────
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_conflict_insert
    AFTER INSERT ON "Conflict"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Conflict',
        NEW.id,
        'INSERT',
        NULL,
        json_object('name', NEW.name, 'type', NEW.type, 'cause', NEW.cause, 'startDate', NEW.startDate),
        datetime('now')
      );
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_conflict_update
    AFTER UPDATE ON "Conflict"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Conflict',
        OLD.id,
        'UPDATE',
        json_object('name', OLD.name, 'type', OLD.type, 'cause', OLD.cause, 'startDate', OLD.startDate),
        json_object('name', NEW.name, 'type', NEW.type, 'cause', NEW.cause, 'startDate', NEW.startDate),
        datetime('now')
      );
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_audit_conflict_delete
    AFTER DELETE ON "Conflict"
    FOR EACH ROW
    BEGIN
      INSERT INTO "AuditLog" (id, tableName, recordId, action, oldData, newData, timestamp)
      VALUES (
        lower(hex(randomblob(16))),
        'Conflict',
        OLD.id,
        'DELETE',
        json_object('name', OLD.name, 'type', OLD.type, 'cause', OLD.cause, 'startDate', OLD.startDate),
        NULL,
        datetime('now')
      );
    END;
  `);

  // ── Trigger 5: Auto-update updatedAt timestamp ──────────────────────
  const tablesWithUpdatedAt = ['Country', 'Organization', 'Conflict', 'ConflictForecast'];
  for (const table of tablesWithUpdatedAt) {
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS trg_auto_updated_at_${table.toLowerCase()}
      AFTER UPDATE ON "${table}"
      FOR EACH ROW
      BEGIN
        UPDATE "${table}" SET "updatedAt" = datetime('now')
        WHERE id = NEW.id AND "updatedAt" = NEW."updatedAt";
      END;
    `);
  }

  // ── Create Views ────────────────────────────────────────────────────
  db.exec(`
    CREATE VIEW IF NOT EXISTS v_most_connected_countries AS
    SELECT c.name, c.isoCode,
      (SELECT COUNT(*) FROM "Alliance" a WHERE a."countryAId" = c.id OR a."countryBId" = c.id) as allianceCount,
      (SELECT COUNT(*) FROM "ConflictInvolvement" ci WHERE ci."countryId" = c.id) as conflictCount,
      (SELECT COUNT(*) FROM "Sanction" s WHERE s."imposingCountryId" = c.id OR s."targetCountryId" = c.id) as sanctionCount,
      (SELECT COUNT(*) FROM "Alliance" a WHERE a."countryAId" = c.id OR a."countryBId" = c.id) +
      (SELECT COUNT(*) FROM "ConflictInvolvement" ci WHERE ci."countryId" = c.id) +
      (SELECT COUNT(*) FROM "Sanction" s WHERE s."imposingCountryId" = c.id OR s."targetCountryId" = c.id) as totalConnections
    FROM "Country" c
    ORDER BY totalConnections DESC;
  `);

  db.exec(`
    CREATE VIEW IF NOT EXISTS v_active_sanctions AS
    SELECT s.id, s.sanctionType, s.startDate, s.endDate,
      ic.name as imposingCountryName, ic.isoCode as imposingCountryIso,
      tc.name as targetCountryName, tc.isoCode as targetCountryIso
    FROM "Sanction" s
    JOIN "Country" ic ON s."imposingCountryId" = ic.id
    JOIN "Country" tc ON s."targetCountryId" = tc.id
    WHERE s."endDate" IS NULL;
  `);

  db.exec(`
    CREATE VIEW IF NOT EXISTS v_gdp_military_ratio AS
    WITH Stats AS (
      SELECT name, isoCode, gdpCurrentUsd, militaryBudget,
        ROUND(CAST(militaryBudget AS REAL) / NULLIF(gdpCurrentUsd, 0) * 100, 2) as milPercent
      FROM "Country"
      WHERE gdpCurrentUsd > 0 AND militaryBudget > 0
    )
    SELECT name, isoCode, gdpCurrentUsd, militaryBudget, milPercent,
           RANK() OVER (ORDER BY milPercent DESC) as rank
    FROM Stats
    ORDER BY rank ASC;
  `);

  db.exec(`
    CREATE VIEW IF NOT EXISTS v_conflict_timeline AS
    SELECT
      (CAST(strftime('%Y', startDate) AS INTEGER) / 10) * 10 as decade,
      COUNT(*) as count
    FROM "Conflict"
    GROUP BY decade
    ORDER BY decade ASC;
  `);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STORED PROCEDURE: sp_assign_leader
 * Simulates a stored procedure by encapsulating complex multi-step logic
 * inside an atomic transaction.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function sp_assign_leader(input: SuccessionInput) {
  const db = getDatabase();
  
  return db.transaction(() => {
    // 1. End current leader's term
    db.prepare(`
      UPDATE "Leader"
      SET "endDate" = ?
      WHERE "countryId" = ? AND "endDate" IS NULL
    `).run(input.startDate, input.countryId);

    // 2. Insert new leader
    const id = generateId();
    db.prepare(`
      INSERT INTO "Leader" (id, name, title, "countryId", "startDate")
      VALUES (?, ?, ?, ?, ?)
    `).run(id, input.leaderName, input.title, input.countryId, input.startDate);

    return { success: true, leaderId: id };
  })();
}
