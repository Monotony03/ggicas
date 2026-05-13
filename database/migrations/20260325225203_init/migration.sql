-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "gdpCurrentUsd" REAL,
    "militaryBudget" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Conflict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Alliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryAId" TEXT NOT NULL,
    "countryBId" TEXT,
    "organizationId" TEXT,
    "allianceType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    CONSTRAINT "Alliance_countryAId_fkey" FOREIGN KEY ("countryAId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Alliance_countryBId_fkey" FOREIGN KEY ("countryBId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alliance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConflictInvolvement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conflictId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    CONSTRAINT "ConflictInvolvement_conflictId_fkey" FOREIGN KEY ("conflictId") REFERENCES "Conflict" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConflictInvolvement_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sanction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imposingCountryId" TEXT NOT NULL,
    "targetCountryId" TEXT NOT NULL,
    "sanctionType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    CONSTRAINT "Sanction_imposingCountryId_fkey" FOREIGN KEY ("imposingCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sanction_targetCountryId_fkey" FOREIGN KEY ("targetCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryAId" TEXT NOT NULL,
    "countryBId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tradeVolumeUsd" REAL,
    CONSTRAINT "TradeRelation_countryAId_fkey" FOREIGN KEY ("countryAId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeRelation_countryBId_fkey" FOREIGN KEY ("countryBId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_isoCode_key" ON "Country"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Alliance_countryAId_idx" ON "Alliance"("countryAId");

-- CreateIndex
CREATE INDEX "Alliance_countryBId_idx" ON "Alliance"("countryBId");

-- CreateIndex
CREATE INDEX "Alliance_organizationId_idx" ON "Alliance"("organizationId");

-- CreateIndex
CREATE INDEX "ConflictInvolvement_conflictId_idx" ON "ConflictInvolvement"("conflictId");

-- CreateIndex
CREATE INDEX "ConflictInvolvement_countryId_idx" ON "ConflictInvolvement"("countryId");

-- CreateIndex
CREATE INDEX "Sanction_imposingCountryId_idx" ON "Sanction"("imposingCountryId");

-- CreateIndex
CREATE INDEX "Sanction_targetCountryId_idx" ON "Sanction"("targetCountryId");

-- CreateIndex
CREATE INDEX "TradeRelation_countryAId_idx" ON "TradeRelation"("countryAId");

-- CreateIndex
CREATE INDEX "TradeRelation_countryBId_idx" ON "TradeRelation"("countryBId");
