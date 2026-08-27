# NEXORA Lovable Landing Page Sync

Source project: Lovable `15ec423c-6376-4083-ae81-86d5e865758b`
Source edit: `884de076b5443674ed05e05350dfd674f55a33d5`

This branch is a safe GitHub landing-page snapshot of the Lovable-generated marketing implementation. It is intentionally isolated from `main` so the existing NEXORA Next.js/NestJS architecture is not overwritten.

## Important

The Lovable project contains a binary hero asset (`src/assets/nexora-command-center.png`) which the available connector cannot export as repository bytes. The source landing implementation therefore remains in Lovable as the visual source of truth until the asset is exported through Lovable/GitHub integration or replaced with a repository-managed asset.

## Source branch

`feat/nexora-lovable-landing`

## Next integration gate

1. Export/sync the remaining Lovable source and binary asset.
2. Adapt the landing components to NEXORA's existing Next.js application structure.
3. Run typecheck, lint, build, accessibility and responsive QA.
4. Open a PR into `main`; do not force-push or overwrite existing application code.