# Legacy audit and migration classification

Audited accessible workspace files: root `index.html`, `style.css`, `main.js`, `data.js`, `admin/index.html`, `admin/admin.css`, and `admin/admin.js`. No database/schema export, package manifest, source-control metadata, server code, deployment file, CI config, or provider configuration was present in the accessible project inventory. Browser-local storage contents were not accessible to this audit.

## Existing admin capability map

| Legacy capability | New implementation |
|---|---|
| Dashboard counts | New admin page counts persisted services, requests, accounts, projects, products, and invoices |
| Service create/edit/delete | Server-side create, update, and archive API; create/archive exposed in the new admin UI |
| Project records | Customer project request and admin quote workflow; richer project editing remains pending |
| News create/edit/delete | Server-side admin create/update/archive and published public catalog implemented |
| Service request list/delete | Server-persisted requests, status history, scoped customer portal, admin status transitions; permanent deletion intentionally replaced with preserved history |
| Company contact settings | Whitelisted server settings API and admin editor implemented; owner must still verify and configure values |
| Local password change | Replaced by server-side password hashes and session model; account recovery/change-password UI remains pending |
| JSON import/export | Not reused for arbitrary production import; approved migration needs validation/reconciliation tools |
| Telegram bot settings/direct send | Removed from browser. No bot token is migrated; a server-side provider and secret configuration must be approved and configured |

## Data classification

No localStorage snapshot or database export was available, therefore **nothing is approved or migrated**.

| Source information | Classification | Action |
|---|---|---|
| `data.js` service descriptions | Candidate for new catalog after owner review | Re-enter/approve in admin; no automatic seed |
| Projects, client types, technical quantities/results | Unverified business claims | Exclude until Tecsecure verifies permission and accuracy |
| News articles dated 2025 | Historical content candidate | Review, correct dates, then republish deliberately |
| Phone, Telegram handle, email, address | Contact details requiring owner confirmation | Configure in admin after verification |
| Counters, warranty/24x7/certification claims | Unverified claims | Exclude until evidenced |
| Browser-local requests/settings/credentials | Sensitive and not accessible | Export only from authorized browser, inspect and classify; never copy secrets |
| Bot token/Chat ID in local settings | Secret / sensitive integration config | Do not migrate; rotate if it was ever used in a public client |

## Risks found

- Default credentials and password checks were client-side; localStorage values and session flags are not authentication.
- Contact requests and settings were stored per browser, not centrally, and contained personal data.
- The Telegram bot token was sent to the client and used directly from the page.
- Admin/public templates interpolate mutable values through `innerHTML`, creating a stored script-injection risk.
- Form success was displayed regardless of durable server persistence or Telegram response.
- No server authorization, organization data isolation, database, private file storage, migration system, backup/restore, or production deploy setup existed.
- Static project examples and counters cannot be assumed to be true customer evidence or current offers.

## Architecture and data domains

Approved direction: new Next.js + TypeScript modular monolith, PostgreSQL/Prisma, DB-backed sessions and a separate background worker. Existing site is preserved at repository root while new system is built in `platform/`. Schema domains include identity/sessions, organizations/memberships/locations, service and product catalogs, requests/history, projects/quotations/invoices, subscriptions, devices/monitoring checks, security assessments/findings, learning content, notifications/settings, and audit logs.

## Requirements reconciliation and next work

The product scope remains every module in the supplied V1.0 specification. The current code covers the public services/products/news catalog and request flow, server authentication, request administration/status tracking, product/project/quotation workflows, invoice creation from accepted quotes, manual payment review, subscription plans and consented trials, basic organization/device APIs, CCTV estimates, contact settings, and initial learning article publishing. Remaining work includes attachment/private file storage, richer organization/location screens, complete catalog edit workflows, payment providers and recurring billing, notification providers, real monitoring, authorized assessment/reporting workflows, learning course management/labs, support tickets, admin audit/history UI, and end-to-end/security tests.

Phase order: (1) auth/database/API foundation; (2) public catalog, request intake and basic admin; (3) organizations, projects, quotations and portal; (4) CCTV builder and device/warranty workflows; (5) payment providers, configured notifications and monitoring; (6) authorized assessment and learning; (7) migration approval, end-to-end/security tests, backups and deployment verification.

Before a real legacy migration: obtain an owner-approved data export, make a recoverable backup, classify each field/relationship, test conversion against a separate database, reconcile counts, document rollback, and get explicit migration approval.
