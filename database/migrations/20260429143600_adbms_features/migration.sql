-- Create Materialized View for Analytics
CREATE MATERIALIZED VIEW "mview_analytics_summary" AS
SELECT 
  c.id, c.name, c."isoCode",
  (SELECT COUNT(*) FROM "Alliance" a WHERE a."countryAId" = c.id OR a."countryBId" = c.id) as "allianceCount",
  (SELECT COUNT(*) FROM "ConflictInvolvement" ci WHERE ci."countryId" = c.id) as "conflictCount",
  (SELECT COUNT(*) FROM "Sanction" s WHERE s."imposingCountryId" = c.id OR s."targetCountryId" = c.id) as "sanctionCount"
FROM "Country" c;

-- Create unique index to allow refreshing concurrently
CREATE UNIQUE INDEX mview_analytics_summary_id_idx ON "mview_analytics_summary"(id);

-- Create Audit Trigger for Country Table
CREATE OR REPLACE FUNCTION log_country_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO "AuditLog" (id, "tableName", "recordId", action, "oldData", "newData", timestamp)
        VALUES (
            gen_random_uuid()::text,
            'Country',
            NEW.id,
            'UPDATE',
            row_to_json(OLD)::text,
            row_to_json(NEW)::text,
            now()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO "AuditLog" (id, "tableName", "recordId", action, "oldData", timestamp)
        VALUES (
            gen_random_uuid()::text,
            'Country',
            OLD.id,
            'DELETE',
            row_to_json(OLD)::text,
            now()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER country_audit_trigger
AFTER UPDATE OR DELETE ON "Country"
FOR EACH ROW EXECUTE FUNCTION log_country_audit();

-- Create Trigger to prevent Alliance between active conflicting countries
CREATE OR REPLACE FUNCTION prevent_conflicting_alliance()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INT;
BEGIN
    -- Check if there's an active conflict where both countries are participants
    SELECT COUNT(*) INTO conflict_count
    FROM "ConflictInvolvement" ci1
    JOIN "ConflictInvolvement" ci2 ON ci1."conflictId" = ci2."conflictId"
    JOIN "Conflict" c ON c.id = ci1."conflictId"
    WHERE ci1."countryId" = NEW."countryAId" 
      AND ci2."countryId" = NEW."countryBId"
      AND (c."endDate" IS NULL OR c."endDate" > now());

    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Cannot form an alliance: The two countries are currently in an active conflict.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_conflicting_alliance_trigger
BEFORE INSERT ON "Alliance"
FOR EACH ROW EXECUTE FUNCTION prevent_conflicting_alliance();
