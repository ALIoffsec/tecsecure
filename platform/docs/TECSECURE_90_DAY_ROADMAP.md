# Tecsecure V1.0 — 90-day delivery roadmap

This roadmap reflects the repository as inspected on 2026-10-24. It is a prioritized delivery plan, not a claim that unfinished features already work. Dates are phase-relative; no production deployment is implied.

## Days 1–15 — Audit and stabilization

- Preserve current uncommitted work and establish baseline test/build results.
- Upgrade affected dependencies and review the full authentication, authorization, and tenant-isolation surface.
- Confirm the active deployment/database provider from configuration (currently Render blueprint, not verified Ubuntu VPS).
- Create backup/restore instructions and execute a restore against an isolated database.
- Fix only confirmed critical defects; add regression tests.

**Acceptance:** current dependency audit has no known unresolved critical/high findings; primary test/typecheck/build pass; backup restoration has actual evidence or is clearly marked blocked.

**Current status:** the main working tree contains verified Next.js/Zod upgrades and the admin-elevation expiry fix; local audit, typecheck, tests, and build pass. The required migration has not been applied; broader deployment-specific review and backup/restore testing remain open.

## Days 16–30 — Core service operations

- Exercise anonymous and authenticated service-request submission.
- Verify request reference creation, customer ownership, and valid status transitions.
- Verify quote creation/revision, acceptance/rejection, invoice consistency, and duplicate/race behavior.
- Complete customer-facing request/quote/service views without exposing internal notes.
- Add audit trail coverage for privileged operations.

**Acceptance:** a request can traverse the supported request → quote → approval → invoice/service lifecycle with ownership enforcement and tests.

**Current status:** relevant routes and data models exist; end-to-end lifecycle and concurrency coverage not established by the current unit suite.

## Days 31–45 — Payment and notifications

- Keep manual payment review explicit until a provider and official protocol are approved.
- Compare Click/Payme merchant requirements and official callback documentation before selecting an integration.
- Add a provider-neutral payment boundary only when actual provider requirements are known.
- Implement notification retries with bounded attempts and persistent delivery outcomes.
- Obtain real provider credentials/approval only through the owner/merchant process; do not simulate successful settlements.

**Acceptance:** verified callback tests cover signature, amount, identity, duplicate replay, cancellation/refund where supported; notification failures and retries are observable.

**Current status:** manual payment submission/review exists; no gateway integration or configured external notification channel is verified.

## Days 46–60 — Operational modules

- Implement a narrowly scoped, authorized monitoring MVP with safe target validation, timeouts, and history.
- Verify product inquiry and catalog admin workflows; avoid implying stock or warranty terms without evidence.
- Review organization membership and role enforcement, including attempts to alter IDs in requests.
- Preserve and test CCTV/PoE assumptions and boundary behavior.
- Keep academy labs/exams/certificates honest and internally scoped.

**Acceptance:** every capability advertised as operational has real data, authorization, and verification evidence; unimplemented modules remain clearly labeled.

**Current status:** CCTV and learning tests exist; live monitoring and external notification are not operational; membership and device workflow require additional negative-case testing.

## Days 61–75 — Security and reliability

- Complete independent source review and remediate verified high-severity findings.
- Expand authorization, payment, worker, and persistence tests.
- Restore a backup in an isolated database and document recovery point limitations.
- Verify worker shutdown/restart, migrations, health checks, and deployment rollback against actual hosting configuration.
- Resolve major accessibility/performance issues without removing product functionality.

**Acceptance:** no known critical issue is left undocumented; critical customer journeys pass and restoration procedure has been exercised.

## Days 76–90 — Release readiness

- Run regression suite and production build on the exact release branch.
- Verify public forms, customer portal isolation, admin workflows, and actual service claims.
- Review secrets, logs, HTTPS/proxy configuration, static assets, SEO, and accessibility.
- Publish factual release notes and a safe deployment/rollback plan.
- List all external gates: payment onboarding, business/legal confirmation, notification credentials, and authorized monitoring targets.

**Acceptance:** V1 scope is limited to evidence-backed, tested capabilities. Do not label the whole platform production-ready if external gates or critical acceptance tests remain open.

## Release gate

Production release is not authorized by this roadmap. Before any live release, require owner authorization, clean dependency audit, reviewed migrations, recoverable backup, secure environment configuration, verified deployment health, and successful rollback/recovery plan.
