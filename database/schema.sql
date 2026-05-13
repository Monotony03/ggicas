-- GGICAS Database Schema
-- Generated as a standard SQL definition of the relational structure.

-- 1. Tables
CREATE TABLE IF NOT EXISTS "Country" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "isoCode" TEXT UNIQUE NOT NULL,
    "region" TEXT NOT NULL,
    "gdpCurrentUsd" REAL,
    "militaryBudget" REAL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Leader" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Conflict" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cause" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Alliance" (
    "id" TEXT PRIMARY KEY,
    "countryAId" TEXT NOT NULL,
    "countryBId" TEXT,
    "organizationId" TEXT,
    "allianceType" TEXT NOT NULL,
    "motivation" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    FOREIGN KEY ("countryAId") REFERENCES "Country" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("countryBId") REFERENCES "Country" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "ConflictInvolvement" (
    "id" TEXT PRIMARY KEY,
    "conflictId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    FOREIGN KEY ("conflictId") REFERENCES "Conflict" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Sanction" (
    "id" TEXT PRIMARY KEY,
    "imposingCountryId" TEXT NOT NULL,
    "targetCountryId" TEXT NOT NULL,
    "sanctionType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    FOREIGN KEY ("imposingCountryId") REFERENCES "Country" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("targetCountryId") REFERENCES "Country" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TradeRelation" (
    "id" TEXT PRIMARY KEY,
    "countryAId" TEXT NOT NULL,
    "countryBId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tradeVolumeUsd" REAL,
    FOREIGN KEY ("countryAId") REFERENCES "Country" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("countryBId") REFERENCES "Country" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ArmsTransfer" (
    "id" TEXT PRIMARY KEY,
    "exporterId" TEXT NOT NULL,
    "importerId" TEXT NOT NULL,
    "weaponType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "volumeTIV" REAL,
    FOREIGN KEY ("exporterId") REFERENCES "Country" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("importerId") REFERENCES "Country" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT PRIMARY KEY,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldData" TEXT,
    "newData" TEXT,
    "timestamp" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ConflictForecast" (
    "id" TEXT PRIMARY KEY,
    "countryIso" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "forecastMonth" DATETIME NOT NULL,
    "bestCase" INTEGER NOT NULL,
    "expectedCase" INTEGER NOT NULL,
    "worstCase" INTEGER NOT NULL,
    "historicalAvg" REAL,
    "predictedChange" TEXT NOT NULL,
    "violenceType" TEXT DEFAULT 'All Event Types',
    "region" TEXT,
    "lastSyncedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("countryIso", "forecastMonth", "violenceType")
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT 'admin',
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Indices
CREATE INDEX IF NOT EXISTS "idx_leader_country" ON "Leader" ("countryId");
CREATE INDEX IF NOT EXISTS "idx_alliance_countryA" ON "Alliance" ("countryAId");
CREATE INDEX IF NOT EXISTS "idx_alliance_countryB" ON "Alliance" ("countryBId");
CREATE INDEX IF NOT EXISTS "idx_alliance_org" ON "Alliance" ("organizationId");
CREATE INDEX IF NOT EXISTS "idx_conflict_involvement_conflict" ON "ConflictInvolvement" ("conflictId");
CREATE INDEX IF NOT EXISTS "idx_conflict_involvement_country" ON "ConflictInvolvement" ("countryId");
CREATE INDEX IF NOT EXISTS "idx_sanction_imposer" ON "Sanction" ("imposingCountryId");
CREATE INDEX IF NOT EXISTS "idx_sanction_target" ON "Sanction" ("targetCountryId");
CREATE INDEX IF NOT EXISTS "idx_trade_countryA" ON "TradeRelation" ("countryAId");
CREATE INDEX IF NOT EXISTS "idx_trade_countryB" ON "TradeRelation" ("countryBId");
CREATE INDEX IF NOT EXISTS "idx_arms_exporter" ON "ArmsTransfer" ("exporterId");
CREATE INDEX IF NOT EXISTS "idx_arms_importer" ON "ArmsTransfer" ("importerId");
CREATE INDEX IF NOT EXISTS "idx_forecast_month" ON "ConflictForecast" ("forecastMonth");
CREATE INDEX IF NOT EXISTS "idx_forecast_country" ON "ConflictForecast" ("countryIso");
CREATE INDEX IF NOT EXISTS "idx_forecast_region" ON "ConflictForecast" ("region");

-- 3. Views (from db.ts)
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

CREATE VIEW IF NOT EXISTS v_active_sanctions AS
SELECT s.id, s.sanctionType, s.startDate, s.endDate,
  ic.name as imposingCountryName, ic.isoCode as imposingCountryIso,
  tc.name as targetCountryName, tc.isoCode as targetCountryIso
FROM "Sanction" s
JOIN "Country" ic ON s."imposingCountryId" = ic.id
JOIN "Country" tc ON s."targetCountryId" = tc.id
WHERE s."endDate" IS NULL;

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

CREATE VIEW IF NOT EXISTS v_conflict_timeline AS
SELECT
  (CAST(strftime('%Y', startDate) AS INTEGER) / 10) * 10 as decade,
  COUNT(*) as count
FROM "Conflict"
GROUP BY decade
ORDER BY decade ASC;
