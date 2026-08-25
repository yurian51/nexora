# Payment webhook contract

POST `/api/v1/billing/webhooks/:provider`

Headers:
- `x-nexora-signature: sha256=<HMAC-SHA256(raw-body)>`
- `x-payment-signature` is accepted as a provider-compatible alias.

The HMAC secret is `PAYMENT_WEBHOOK_SECRET` and must never be committed.

JSON body:
```json
{
  "tenantId": "uuid",
  "paymentId": "uuid",
  "eventId": "provider-event-id",
  "eventType": "payment.succeeded",
  "status": "SUCCESS",
  "providerReference": "provider-reference",
  "amount": "5000",
  "currency": "TZS"
}
```

Supported status transitions are `SUCCESS`, `FAILED`, and `REFUNDED`.
A successful payment activates the purchase and creates/updates one access grant for the purchase. A refund revokes the grant. Duplicate provider event IDs are accepted idempotently.
