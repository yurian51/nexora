# CI validation

The CI pipeline must validate the PostgreSQL migration path before application checks. It provisions PostgreSQL 16, applies migrations, re-runs the migration command to verify idempotency, then runs lint, typecheck, tests, and builds.

Production readiness requires a successful GitHub Actions run on the exact commit being released. A missing or failed CI run must never be reported as green.
