BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS vouchers_tenant_code_uq ON vouchers (tenant_id, code);
CREATE INDEX IF NOT EXISTS vouchers_tenant_status_expiry_idx ON vouchers (tenant_id, status, expires_at);
CREATE INDEX IF NOT EXISTS vouchers_tenant_package_idx ON vouchers (tenant_id, package_id, created_at DESC);

COMMIT;
