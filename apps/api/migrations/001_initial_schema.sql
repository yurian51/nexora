BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'TRIAL' CHECK (status IN ('TRIAL','ACTIVE','SUSPENDED','ARCHIVED')),
  currency text NOT NULL DEFAULT 'TZS',
  timezone text NOT NULL DEFAULT 'Africa/Dar_es_Salaam',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'CASHIER' CHECK (role IN ('OWNER','ADMIN','CASHIER','AGENT','READ_ONLY')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uq ON users (lower(email));

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS routers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id uuid,
  name text NOT NULL,
  vendor text,
  model text,
  ip_address inet,
  mac_address macaddr,
  os_version text,
  status text NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE','DEGRADED','OFFLINE')),
  active_users integer NOT NULL DEFAULT 0 CHECK (active_users >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, location_id) REFERENCES locations(tenant_id, id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  username text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, username)
);
CREATE INDEX IF NOT EXISTS customers_tenant_created_idx ON customers (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(14,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'TZS',
  duration_seconds bigint NOT NULL CHECK (duration_seconds > 0),
  data_limit_bytes bigint,
  download_bps bigint,
  upload_bps bigint,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS wifi_plan_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  package_id uuid NOT NULL,
  router_id uuid,
  price numeric(14,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT','PAID','ACTIVE','EXPIRED','CANCELED','REFUNDED')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, package_id) REFERENCES packages(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, router_id) REFERENCES routers(tenant_id, id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS purchases_tenant_customer_idx ON wifi_plan_purchases (tenant_id, customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS purchases_tenant_status_idx ON wifi_plan_purchases (tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id uuid,
  purchase_id uuid,
  provider text NOT NULL,
  provider_reference text,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  idempotency_key text NOT NULL,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, idempotency_key),
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE SET NULL,
  FOREIGN KEY (tenant_id, purchase_id) REFERENCES wifi_plan_purchases(tenant_id, id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_reference_uq ON payments (tenant_id, provider, provider_reference) WHERE provider_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_tenant_created_idx ON payments (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_tenant_status_idx ON payments (tenant_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id uuid,
  router_id uuid,
  username text,
  ip_address inet,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  bytes_in bigint NOT NULL DEFAULT 0 CHECK (bytes_in >= 0),
  bytes_out bigint NOT NULL DEFAULT 0 CHECK (bytes_out >= 0),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ENDED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE SET NULL,
  FOREIGN KEY (tenant_id, router_id) REFERENCES routers(tenant_id, id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS sessions_tenant_status_idx ON sessions (tenant_id, status, started_at DESC);

CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  package_id uuid NOT NULL,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'UNUSED' CHECK (status IN ('UNUSED','USED','EXPIRED','CANCELED')),
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code),
  FOREIGN KEY (tenant_id, package_id) REFERENCES packages(tenant_id, id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS vouchers_tenant_status_idx ON vouchers (tenant_id, status);

COMMIT;
