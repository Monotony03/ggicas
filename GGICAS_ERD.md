# GGICAS Database ERD

This document contains the Entity-Relationship Diagram (ERD) representing the full database structure of the Geopolitical Intelligence & Conflict Analysis System.

## Entity-Relationship Diagram

```mermaid
erDiagram
    Country ||--o{ Leader : "governs"
    Country ||--o{ Alliance : "member_A"
    Country ||--o{ Alliance : "member_B"
    Organization ||--o{ Alliance : "oversees"
    Country ||--o{ ConflictInvolvement : "participates_in"
    Conflict ||--o{ ConflictInvolvement : "includes"
    Country ||--o{ Sanction : "imposes"
    Country ||--o{ Sanction : "targeted_by"
    Country ||--o{ TradeRelation : "origin"
    Country ||--o{ TradeRelation : "destination"
    Country ||--o{ ArmsTransfer : "exports"
    Country ||--o{ ArmsTransfer : "imports"
    Country ||--o{ ConflictForecast : "forecasts"

    Country {
        string id PK
        string name
        string isoCode
        string region
        float gdpCurrentUsd
        float militaryBudget
        datetime createdAt
        datetime updatedAt
    }

    Leader {
        string id PK
        string name
        string title
        string countryId FK
        datetime startDate
        datetime endDate
    }

    Organization {
        string id PK
        string name
        string type
        datetime createdAt
        datetime updatedAt
    }

    Conflict {
        string id PK
        string name
        string type
        string cause
        datetime startDate
        datetime endDate
        datetime createdAt
        datetime updatedAt
    }

    Alliance {
        string id PK
        string countryAId FK
        string countryBId FK
        string organizationId FK
        string allianceType
        string motivation
        datetime startDate
        datetime endDate
    }

    ConflictInvolvement {
        string id PK
        string conflictId FK
        string countryId FK
        string role
        datetime startDate
        datetime endDate
    }

    Sanction {
        string id PK
        string imposingCountryId FK
        string targetCountryId FK
        string sanctionType
        datetime startDate
        datetime endDate
    }

    TradeRelation {
        string id PK
        string countryAId FK
        string countryBId FK
        int year
        float tradeVolumeUsd
    }

    ArmsTransfer {
        string id PK
        string exporterId FK
        string importerId FK
        string weaponType
        int year
        float volumeTIV
    }

    ConflictForecast {
        string id PK
        string countryIso
        string countryName
        datetime forecastMonth
        int bestCase
        int expectedCase
        int worstCase
        float historicalAvg
        string predictedChange
        string violenceType
        string region
        datetime lastSyncedAt
        datetime createdAt
        datetime updatedAt
    }
    AuditLog {
        string id PK
        string tableName
        string recordId
        string action
        string oldData
        string newData
        datetime timestamp
    }

    User {
        string id PK
        string username
        string password
        string role
        datetime createdAt
    }
```

## Key Architectural Decisions

1.  **Junction Tables**: `ConflictInvolvement`, `Alliance`, `Sanction`, `TradeRelation`, and `ArmsTransfer` act as junction tables that facilitate Many-to-Many relationships between Countries or between Countries and Conflicts/Organizations.
2.  **Self-Referencing Relationships**: The `Alliance`, `Sanction`, `TradeRelation`, and `ArmsTransfer` tables utilize two Foreign Keys pointing back to the `Country` table to represent directional or reciprocal interactions between two nations.
3.  **Auditability**: The `AuditLog` table is a standalone entity that tracks changes across the entire system through database triggers, rather than having direct foreign key relationships, ensuring high performance.
4.  **Forecasting**: The `ConflictForecast` table is optimized for time-series and regional analysis, including unique constraints on country, time, and event type.
5.  **Optimized Retrieval (Cursors)**: The system utilizes Keyset Pagination (Cursors) for $O(log n)$ retrieval of large datasets, bypassing the performance bottlenecks of traditional `OFFSET` pagination.
6.  **Encapsulated Logic (Stored Procedures)**: Complex, multi-step business operations (such as Leader Succession) are encapsulated in atomic "Stored Procedure" patterns to guarantee data consistency across multiple entities.
