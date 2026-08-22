# YURIAN WiFi Billing

Production-oriented WiFi billing and hotspot management platform for MikroTik networks.

## Vision

Manage WiFi businesses, branches, MikroTik routers, HotSpot customers, packages, vouchers, payments, sessions, agents, reporting and network operations from one platform.

## Architecture

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Database: PostgreSQL
- Cache/queues: Redis + BullMQ
- AAA: FreeRADIUS
- Network: MikroTik RouterOS v7
- Secure router connectivity: WireGuard
- Deployment: Docker + GitHub Actions

## Phase 1

Authentication/RBAC, multi-tenant businesses and locations, router registry, customers, packages, vouchers, sessions, payment abstraction, captive portal, dashboard and audit logs.

## Security

No secrets in Git. Tenant isolation, RBAC/least privilege, audit logs, signed payment webhooks, encrypted router secrets, rate limiting and controlled destructive operations.

## Status

FOUNDATION
