BEGIN;

CREATE INDEX IF NOT EXISTS purchases_tenant_package_idx
  ON wifi_plan_purchases (tenant_id, package_id, created_at DESC);

CREATE INDEX IF NOT EXISTS purchases_tenant_customer_status_idx
  ON wifi_plan_purchases (tenant_id, customer_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS access_grants_tenant_status_ends_idx
  ON access_grants (tenant_id, status, ends_at DESC);

COMMIT;
