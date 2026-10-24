# Tecsecure security review

**Status:** FINDINGS FIXED IN THE LOCAL WORKING TREE — dependency upgrades and admin-elevation expiry enforcement pass local verification. Migration application and production/deployment-specific review remain incomplete.
**Scope:** local repository and test configuration only. No third-party or production probing was performed.
**Last checked:** 2026-10-24.

## Confirmed dependency findings

| Severity | Package | Affected version | Finding | Evidence |
|---|---|---:|---|---|
| CRITICAL | `next` | 16.4.0 | npm audit reports an unauthenticated RCE in the Image Optimization API when SVG is used. | Advisory GHSA-2464-fhr4-w9xw; npm audit range `>=16.0.0 <=16.4.0`. |
| HIGH | `next` | 16.4.0 | npm audit reports App Router Server Actions denial of service. | Advisory GHSA-p3m5-59mp-jv5r; npm audit range `>=16.0.0 <=16.4.0`. |
| CRITICAL | `next` | 16.4.0 | npm audit reports unauthenticated RCE in `use cache` functions returning typed arrays. | Advisory GHSA-673q-mjm6-r5xr; npm audit range `>=16.0.0 <=16.4.0`. |
| HIGH | `zod` | 3.25.28 | npm audit reports memory exhaustion while validating oversized constrained collections. | Advisory GHSA-mrhx-c7xc-m3w5; npm audit range `<4.6.6`, fix offered as 4.6.7. |

npm audit's package summary reports one critical and one high vulnerable dependency because it aggregates the three Next.js advisories under one package.

## Confirmed source finding

| Severity | File | Finding | Exploit prerequisites / impact | Status |
|---|---|---|---|---|
| HIGH | [`src/lib/auth.ts`](../src/lib/auth.ts) | Server-side admin elevation checked the 14-day session expiry but not the intended 30-minute elevation expiry. A stolen pair of session/elevation cookies could retain elevated privileges after the admin window. | Requires theft of both cookies; could permit privileged admin/module API access until session expiry or revocation. | Fixed in the current working tree by persisting and checking `adminAccessExpiresAt`; migration `0010_admin_access_expiry` is required before using the updated app with a database. Not deployed. |

### Remediation status

- **Next.js/Zod:** the current main working tree pins Next.js 16.4.3 and Zod 4.6.7 and configures `experimental.agentUpgrade: "security"`. `npm audit` reports 0 vulnerabilities; typecheck, all 24 tests, and production build pass. Schema boundary tests cover configured service-media and project-item limits. Broader request-body size coverage remains an open follow-up.
- **Admin elevation:** the current working tree stores and checks a separate server-side elevation expiry. Migration `0010_admin_access_expiry` is present but was not applied to any database. A regression test verifies the expiry boundaries.
- **Application source:** focused reviews covered changed profile/certificate code, auth/authorization/customer-isolation flows, and upload/payment/worker/logging surfaces. No confirmed issue was found in the reviewed latter scope; the confirmed admin-elevation issue above was fixed in the current working tree. Deployment-specific storage/network-egress and production log/database behavior remain unreviewed.

## Review coverage and limitations

- Confirmed source patterns exist for database-backed sessions, hashed session tokens, separate admin elevation, role/module checks, Zod input validation, and ownership checks in selected request/quote handlers.
- Initial review of recent profile/certificate changes found no confirmed issue in that limited diff.
- Focused auth review inspected the requested auth/authorization/customer-isolation scope. A separate review found no confirmed issue in upload/payment/worker/logging code, but deployment-specific configurations and external services were not examined.
- No production or third-party testing was performed; these scoped reviews do not certify the whole deployment as secure.
- No production tests, external scanning, penetration testing, or database mutation was performed.
- Follow-up must test negative cases (unauthenticated requests, cross-customer IDs, staff privilege boundaries, oversized bodies, invalid inputs) using local test data only.

## Security release gate

Do not run the updated application against a database until migration `0010_admin_access_expiry` has been applied to the approved target. The current main working tree passes the local audit/test/build gates, but no database migration or production deployment was performed; repeat the checks on the exact release tree.
