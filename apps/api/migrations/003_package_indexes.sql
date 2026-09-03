BEGIN;

CREATE INDEX IF NOT EXISTS packages_tenant_active_created_idx
  ON packages (tenant_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS packages_tenant_name_idx
  ON packages (tenant_id, lower(name));

COMMIT;
