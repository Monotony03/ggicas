# GGICAS Database Concepts & Features Documentation

This document provides a comprehensive technical breakdown of the database concepts and features implemented in the **Geopolitical Intelligence & Conflict Analysis System (GGICAS)**.

---

## 1. Relational Data Modeling & Schema Design
The project uses a structured relational model to represent complex geopolitical entities and their interactions.

### Tables & Primary Keys
All entities are defined with unique Primary Keys, typically using `cuid()` or `UUID` formats for distributed safety.
- **File Reference**: [database/schema.sql](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/database/schema.sql)
- **Code Examples**:
    - `Country` table (Lines 5-14)
    - `Conflict` table (Lines 34-43)
    - `Leader` table (Lines 16-24)

### Relationships (Entity-Relationship Model)
1. **One-to-Many (1:M)**:
    - `Country` to `Leader`: One country can have multiple leaders over time.
    - **Ref**: [database/schema.sql:L23](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/database/schema.sql#L23)
2. **Many-to-Many (M:M)**:
    - `Country` to `Conflict`: Multiple countries participate in multiple conflicts via the `ConflictInvolvement` junction table.
    - **Ref**: [database/schema.sql:L59-68](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/database/schema.sql#L59-68)
3. **Self-Referencing / Recursive**:
    - `Alliance`: A record connecting two records from the same `Country` table (`countryAId` and `countryBId`).
    - **Ref**: [database/schema.sql:L45-57](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/database/schema.sql#L45-57)

---

## 2. Integrity Constraints & Referential Actions
Ensuring data consistency through database-level enforcement.

- **Foreign Key Constraints**: Enforced in SQLite to prevent orphaned records.
    - **Ref**: [src/lib/db.ts:L33](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L33) (`PRAGMA foreign_keys = ON`)
- **Cascading Deletes**: Automatically cleaning up related data (e.g., deleting a country deletes its conflict involvements).
    - **Ref**: [database/schema.sql:L67](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/database/schema.sql#L67) (`ON DELETE CASCADE`)
- **Unique Constraints**: Ensuring identity uniqueness for ISO codes and entity names.
    - **Ref**: [database/schema.sql:L7-8](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/database/schema.sql#L7-8)

---

## 3. Advanced SQL Features
Moving beyond basic CRUD to utilize the full power of the SQL engine.

### Database Triggers
Used for automated side effects without application-level logic.
1. **Audit Logging**: Automatically captures `UPDATE` and `DELETE` actions into an `AuditLog` table, preserving `oldData` and `newData` as JSON.
    - **Ref**: [src/lib/db.ts:L89-264](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L89-264)
2. **Auto-Timestamps**: Automatically updates the `updatedAt` column whenever a row is modified.
    - **Ref**: [src/lib/db.ts:L266-278](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L266-278)

### Database Views
Simplifying complex analytical queries into virtual tables.
1. **`v_most_connected_countries`**: Aggregates alliances, conflicts, and sanctions per country.
    - **Ref**: [src/lib/db.ts:L281-292](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L281-292)
2. **`v_gdp_military_ratio`**: Uses **Common Table Expressions (CTEs)** and **Window Functions (`RANK() OVER`)** to calculate geopolitical rankings.
    - **Ref**: [src/lib/db.ts:L305-317](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L305-317)

---

## 4. Query Optimization & Performance
Techniques used to ensure a responsive analytical dashboard.

- **Indexing**: Secondary indexes on foreign keys and frequently filtered columns (e.g., `forecastMonth`, `region`).
    - **Ref**: [database/schema.sql:L138-153](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/database/schema.sql#L138-153)
- **Prepared Statements**: Protecting against SQL Injection and improving execution speed.
    - **Ref**: [src/lib/db.ts:L55](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L55) (`db.prepare(sql)`)
- **Write-Ahead Logging (WAL)**: Improving concurrency by allowing simultaneous reads and writes.
    - **Ref**: [src/lib/db.ts:L31](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L31) (`PRAGMA journal_mode = WAL`)
- **Keyset Pagination (Cursors)**: Replacing `OFFSET` with unique keyset filtering (`WHERE id > ?`) to achieve constant time $O(log n)$ lookups regardless of dataset size.
    - **Ref**: [src/app/api/conflicts/route.ts:L32-38](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/app/api/conflicts/route.ts#L32-38)

---

## 5. Transaction Management & Persistence
Ensuring data reliability and the ACID properties.

- **ACID Transactions**: Ensuring that complex operations (like syncing conflict data) either succeed completely or fail gracefully without data corruption.
    - **Ref**: [src/lib/db.ts:L73-78](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L73-78)
- **Singleton Pattern**: Maintaining a single database connection instance to optimize resource usage in a serverless/Next.js environment.
    - **Ref**: [src/lib/db.ts:L19-23](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L19-23)
- **Stored Procedures (Simulated)**: Encapsulating multi-step business logic (e.g., Leader Succession) into atomic database service functions to ensure consistency across multiple table updates.
    - **Ref**: [src/lib/db.ts:L330-358](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/lib/db.ts#L330-358) (`sp_assign_leader`)

---

## 6. Analytical Data Patterns
Database features used specifically for the Geopolitical Dashboard.

- **Aggregations**: Using `COUNT()`, `SUM()`, and `GROUP BY` to generate high-level insights.
    - **Ref**: [src/app/api/analytics/route.ts:L10-15](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/app/api/analytics/route.ts#L10-15)
- **Pagination**: Implementing `LIMIT` and `OFFSET` for efficient browsing of large conflict datasets.
    - **Ref**: [src/app/api/conflicts/route.ts:L47](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/app/api/conflicts/route.ts#L47)
- **Dynamic Filtering**: Building SQL queries dynamically based on user input (e.g., searching by year or type).
    - **Ref**: [src/app/api/conflicts/route.ts:L13-33](file:///c:/Users/Abdul%20Rehman%20Saud/OneDrive/Desktop/SEM%204/DB/DB%20project/geopolitcal%20analysis/ggicas/src/app/api/conflicts/route.ts#L13-33)
