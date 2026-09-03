BEGIN;

CREATE TABLE IF NOT EXISTS payment_provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider text NOT NULL,
  display_name text,
  credentials_ref text,
  webhook_secret_ref text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider)
);

CREATE INDEX IF NOT EXISTS payment_provider_configs_tenant_active_idx
  ON payment_provider_configs (tenant_id, is_active);

CREATE INDEX IF NOT EXISTS payment_provider_configs_provider_idx
  ON payment_provider_configs (provider, is_active);

COMMIT;
