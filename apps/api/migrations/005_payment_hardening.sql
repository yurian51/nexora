BEGIN;

-- Explicit provider/event uniqueness is already enforced for payments. Add the
-- supporting event lookup index used by webhook processing and reconciliation.
CREATE INDEX IF NOT EXISTS payment_events_tenant_created_idx
  ON payment_events (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS payment_events_tenant_type_idx
  ON payment_events (tenant_id, event_type, created_at DESC);

-- Keep webhook payloads auditable while making event processing state explicit.
ALTER TABLE payment_events
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'PROCESSED'
  CHECK (processing_status IN ('RECEIVED','PROCESSED','FAILED'));

COMMIT;
