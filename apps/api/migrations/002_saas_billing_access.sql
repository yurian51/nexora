BEGIN;

CREATE TABLE IF NOT EXISTS saas_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price numeric(14,2) NOT NULL CHECK (price >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  billing_interval text NOT NULL CHECK (billing_interval IN ('MONTH','YEAR')),
  max_routers integer CHECK (max_routers IS NULL OR max_routers > 0),
  max_sites integer CHECK (max_sites IS NULL OR max_sites > 0),
  max_customers integer CHECK (max_customers IS NULL OR max_customers > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  saas_plan_id uuid NOT NULL REFERENCES saas_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'TRIALING' CHECK (status IN ('TRIALING','ACTIVE','PAST_DUE','CANCELED','EXPIRED')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS organization_subscriptions_tenant_idx ON organization_subscriptions (tenant_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS organization_active_subscription_uq
  ON organization_subscriptions (tenant_id)
  WHERE status IN ('TRIALING','ACTIVE','PAST_DUE');

CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  payment_id uuid,
  provider text NOT NULL,
  provider_event_id text,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  signature_valid boolean,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, payment_id) REFERENCES payments(tenant_id, id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_event_uq
  ON payment_events (provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payment_events_payment_idx ON payment_events (payment_id, created_at DESC);

CREATE TABLE IF NOT EXISTS access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  purchase_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  router_id uuid,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACTIVE','EXPIRED','REVOKED')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, purchase_id) REFERENCES wifi_plan_purchases(tenant_id, id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, router_id) REFERENCES routers(tenant_id, id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS access_grants_purchase_uq ON access_grants (purchase_id);
CREATE INDEX IF NOT EXISTS access_grants_customer_status_idx ON access_grants (tenant_id, customer_id, status);

COMMIT;
