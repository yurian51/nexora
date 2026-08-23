CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE tenant_status AS ENUM ('ACTIVE','SUSPENDED','TRIAL','ARCHIVED');
CREATE TYPE user_role AS ENUM ('OWNER','ADMIN','MANAGER','AGENT','SUPPORT','VIEWER');
CREATE TYPE router_status AS ENUM ('ONLINE','OFFLINE','DEGRADED','UNKNOWN');
CREATE TYPE voucher_status AS ENUM ('AVAILABLE','SOLD','ACTIVE','EXPIRED','SUSPENDED','CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING','SUCCESS','FAILED','CANCELLED','REFUNDED');
CREATE TYPE session_status AS ENUM ('ACTIVE','ENDED','EXPIRED','TERMINATED');

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  status tenant_status NOT NULL DEFAULT 'TRIAL',
  currency CHAR(3) NOT NULL DEFAULT 'TZS',
  timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Dar_es_Salaam',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  role user_role NOT NULL DEFAULT 'VIEWER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE routers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  host VARCHAR(255) NOT NULL,
  api_port INTEGER NOT NULL DEFAULT 8729,
  status router_status NOT NULL DEFAULT 'UNKNOWN',
  last_heartbeat TIMESTAMPTZ,
  active_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  phone VARCHAR(32),
  email VARCHAR(255),
  full_name VARCHAR(160),
  username VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, username)
);

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'TZS',
  duration_seconds BIGINT,
  data_limit_bytes BIGINT,
  download_bps BIGINT,
  upload_bps BIGINT,
  simultaneous_devices INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id),
  code VARCHAR(100) NOT NULL,
  status voucher_status NOT NULL DEFAULT 'AVAILABLE',
  expires_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  provider VARCHAR(64) NOT NULL,
  provider_reference VARCHAR(160),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'TZS',
  status payment_status NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_reference)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  router_id UUID REFERENCES routers(id) ON DELETE SET NULL,
  username VARCHAR(100),
  ip_address INET,
  mac_address VARCHAR(32),
  status session_status NOT NULL DEFAULT 'ACTIVE',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  bytes_in BIGINT NOT NULL DEFAULT 0,
  bytes_out BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80),
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_packages_tenant ON packages(tenant_id);
CREATE INDEX idx_vouchers_tenant_status ON vouchers(tenant_id, status);
CREATE INDEX idx_payments_tenant_created ON payments(tenant_id, created_at DESC);
CREATE INDEX idx_sessions_tenant_status ON sessions(tenant_id, status);
CREATE INDEX idx_audit_tenant_created ON audit_logs(tenant_id, created_at DESC);
