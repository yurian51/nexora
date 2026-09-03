BEGIN;

-- Prevent two outstanding payment attempts from being created for one WiFi purchase.
-- Historical SUCCESS/FAILED/REFUNDED payments remain allowed.
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_pending_per_purchase_uq
  ON payments (tenant_id, purchase_id)
  WHERE purchase_id IS NOT NULL AND status = 'PENDING';

-- Make webhook/event ingestion safe to retry even when a provider omits an event id.
-- Provider event IDs remain the primary deduplication key; payloads without one are handled by the service.

COMMIT;
