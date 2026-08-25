# NEXORA — Product Architecture

## Product position
NEXORA is a multi-tenant connected-business and ISP operations platform for hotspot billing, vouchers, subscriptions, payments, network operations and customer management.

## Brand
**NEXORA**  
*The Operating Platform for Connected Businesses.*

## Core domains
- Identity, organization and tenant isolation
- Customers and devices
- Sites and routers
- Plans and voucher batches
- Subscriptions and sessions
- Payments and reconciliation
- Captive portal
- MikroTik and FreeRADIUS adapters
- Agents/resellers and commissions
- Reports, alerts and audit logs

## Architecture rule
Start as a modular monolith with strict module boundaries. PostgreSQL is the source of truth. Redis is for ephemeral state, caching and background jobs. External integrations must be adapter-based and idempotent.

## Integration boundaries
### Network
`NetworkAdapter` is responsible for router operations and health polling. MikroTik RouterOS API is the first adapter. SSH is an explicit fallback, never an implicit command execution path.

### Authentication
`AuthService` owns credentials, access tokens, refresh/session lifecycle and tenant context. Authorization must be enforced server-side and every tenant-scoped query must carry organization context.

### Payments
`PaymentProvider` exposes initiate, verify, refund and webhook-verification contracts. A successful browser redirect is never sufficient to activate service. Activation requires a verified provider event or an independently verified provider status.

### RADIUS
FreeRADIUS is an integration boundary, not a reason to leak billing rules into router-specific code. Accounting events update session usage through an idempotent event processor.

## MVP order
1. CI/build verification
2. Auth + tenant isolation + RBAC
3. Customers, sites and routers
4. Plans + voucher engine
5. Sessions and subscriptions
6. Payment abstraction + webhook idempotency
7. MikroTik adapter + router health
8. Captive portal
9. FreeRADIUS/PPPoE
10. Reports, alerts and agent/reseller controls

## Security invariants
- No secrets in Git.
- Passwords use strong password hashing with per-user salts.
- Sensitive credentials are encrypted at rest.
- Tenant boundaries are enforced in API/service/database access paths.
- Critical mutations produce audit events.
- Payment webhook handlers are idempotent.
- Destructive router actions require explicit authorization and confirmation.
- Real integrations are never represented as connected until verified.
