# Tecsecure implementation checklist

Living checklist for the existing `platform/` app. Update evidence and status as work is verified. Do not delete or overwrite pre-existing user work.

## P0 — production safety

- [x] Upgrade current working tree to verified Next.js 16.4.3 and Zod 4.6.7; local `npm audit` reports 0 vulnerabilities.
- [ ] Expand invalid-input and request-body size regression coverage for the Zod 4.6.7 migration; two schema-boundary tests now verify configured array limits. Typecheck, 24 tests, build, and `npm audit` pass in the current working tree.
- [ ] Apply migration `0010_admin_access_expiry` to an explicitly approved database target; no database has been migrated.
- [ ] Complete deployment-specific security review; production storage, egress, logs, and database settings remain unverified.
- [ ] Add cross-customer and staff/admin authorization regression tests across ID-addressed routes.
- [ ] Verify DB target and migration workflow; do not run destructive operations against production.
- [ ] Perform backup and restore exercise in an isolated database and document actual evidence.

## P1 — service operations

- [x] Allow guests to submit a quote request with contact details and a project description; return a request reference and make account registration optional afterward.
- [ ] Exercise request creation through customer confirmation, quote revision/accept/reject, invoice, service execution, and completion.
- [ ] Add race/idempotency tests for duplicate submissions and concurrent quote responses.
- [ ] Verify internal notes are not exposed to customers.
- [ ] Audit administrative actions and staff module permissions.
- [ ] Add pagination/filters for growing administrative/customer lists.

## P2 — operational capabilities

- [ ] Implement bounded retry and graceful shutdown for worker jobs.
- [ ] Configure a real notification provider only after credentials/approval; test delivery, failure, retry, and deduplication.
- [ ] Implement monitoring only for customer-authorized targets with SSRF controls and real status history.
- [ ] Verify organization membership controls and device ownership with negative tests.
- [ ] Preserve/test product inquiries, invoices/manual payment review, CCTV calculations, and academy routes.
- [ ] Mark any unimplemented item clearly in UI and docs.

## P3 — refinement and release

- [ ] Verify mobile/tablet/desktop and accessibility behavior.
- [ ] Measure production-mode performance; do not infer success from CSS edits alone.
- [ ] Verify public claims, metadata, robots behavior, and real contact information.
- [ ] Write exact release/rollback steps for the verified hosting provider.
- [ ] Obtain explicit authorization before production deployment or provider/payment activation.

## Baseline evidence (2026-10-24)

- Initial baseline: `npm test` 21/21, `npm run typecheck` pass, and `npm run build` pass after the Next.js 16.4.0 security reminder retry.
- Current security-fix verification: `npm audit` 0 vulnerabilities, typecheck/schema validation/build pass, and `npm test` 24/24.
- Current working tree has Next.js 16.4.3, Zod 4.6.7, the admin-elevation expiry fix, `npm audit` 0 vulnerabilities, typecheck/build passing, and 24/24 tests passing. Changes are uncommitted and undeployed.
- Focused source review confirmed an admin elevation expiry flaw; the current working tree stores/checks the 30-minute expiry and includes a regression test. The upload/payment/worker/logging review found no confirmed vulnerability in its reviewed scope; deployment-specific configuration remains unreviewed.
- No production deployment, production DB migration, backup restore, or payment-provider operation was performed.
