# Tecsecure release notes

## Unreleased — 2026-10-24

### Implemented in the current uncommitted checkout
- Telegram support flow: service requests, orders, and project quote requests now create portal conversations and are forwarded to a configured private administrator bot chat; `/reply REFERENCE text` stores the reply in the customer's profile and delivers it to Telegram-linked customers. Profile menu now groups overview, profile, services, orders/status, monitoring, projects, finance, wallet, learning, store, subscriptions, and messages; the learning dashboard is shown only in its own section. Requires Telegram environment secrets, webhook configuration, and the new Prisma migration.
- Added a PWA install action to the main navigation and `/install` instructions. It uses the browser's install prompt when available; no native APK/IPA is part of this change.
- Store upgrade: `/products` has search (name/brand/model/SKU), category/brand/stock filters, sorting and pagination; client-side cart (`/cart`); checkout with Yandex Maps delivery-point picker (needs `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`, otherwise manual address only); `Order`/`OrderItem`/`OrderStatusHistory` models (migration `store_orders`); `POST/GET /api/orders` (login required, prices read from DB, rate-limited), `PATCH /api/orders/[id]` (PRODUCTS staff, forward-only transitions, audit + customer notification); customer tracking at `/portal/orders`, staff queue at `/admin/orders`. No online payment: orders are requests that staff confirm and price. Yandex free API terms are for open sites; confirm licensing for commercial use.
- Product page (Uzum/Yandex Market style): 3-column layout (gallery, key facts, sticky buy box), anchor tabs (Tavsif, Xususiyatlar, Sharhlar, Savol-javob), rating summary with distribution bars, ratings on catalog cards. New models `ProductReview` (1–5 stars, pros/cons, comment; one per customer; only customers with a DELIVERED order containing the product, shown as "Xarid qilgan") and `ProductQuestion` (any logged-in user asks; PRODUCTS staff answer inline). Migration `product_reviews_questions`; APIs `POST /api/products/[id]/reviews`, `POST|PATCH /api/products/[id]/questions`. No review moderation UI yet.
- Store redesign (based on Baymard PLP/order-tracking guidelines): hero search, category chips with counts, sticky filter sidebar (mobile toggle) with removable active-filter chips, product cards with badges and category SVG illustrations (not real photos), product page with breadcrumbs, buy box and specs table, floating cart button, 3-step checkout with sticky summary, horizontal order tracker in `/portal/orders`, restyled `/admin/orders`.
- Checkout map and product administration: delivery address is now a separate map-first step with a large Yandex map dialog, map search, point selection, and an explicit browser-geolocation option; recipient name, phone, and delivery note are grouped separately. The browser geolocation policy is same-origin only. The staff product form supports category, specifications and compatibility JSON in addition to create/edit/archive/publish, price, stock and warranty fields; its existing media uploader accepts product photos and MP4/WebM video.
- Checkout polish: unresolved reverse-geocoded street names no longer show an error panel or block checkout when a map point is selected; users may add directions in the optional note. Removed the duplicate coordinate strip and moved geolocation to a compact icon control at the map's lower-right, clear of Yandex attribution. Contact fields now use accented surfaces, focus rings and distinct contact/address cards.
- News: `prisma/seed-news.mjs` seeds 8 evergreen educational articles (OWASP Top 10:2021, OWASP API Security Top 10:2023, phishing, passwords/MFA, 3-2-1 backups, Wi‑Fi, CCTV hardening, what an audit includes). Idempotent; run with `node --env-file=.env prisma/seed-news.mjs`. Not breaking-news items; review before publishing to production.
- Quote → invoice → payment flow verified end to end over HTTP with temporary users (since deleted): issue, accept (customer only), duplicate/early invoice blocked, partial + final manual payments, staff-only verification, concurrent verification (one 200, one 409), invoice becomes PAID, cross-customer access denied (403). Two gaps fixed: duplicate invoice per quotation (409) and over-payment submission (409).
- Real monitoring MVP: `src/lib/monitoring.ts`, `PATCH /api/devices/[id]` (admin only, audit logged) and a worker check every 5 minutes. TCP port reachability only, `tcp:PORT` method, opt-in per device, public IPs only (loopback/private/link-local/metadata blocked, DNS result validated before connecting). No ping/SNMP/agent/LAN/alerting; `/monitoring` copy updated in uz/ru/en to say exactly this. Unit tests in `monitoring.test.ts`.
- Catalog seed `prisma/seed-catalog.mjs` includes six sample equipment items with provisional UZS prices; review and adjust them in the admin catalog before production. Run locally with `node --env-file=.env prisma/seed-catalog.mjs`.
- `/sample-report`: template of the audit report structure (not a real client report), linked from `/cybersecurity`.
- `/privacy`: draft service terms (cancellation, payment, warranty limits) in uz/ru/en; requires legal approval.

- Enabled unauthenticated quote requests from `/request-quote` using a phone number and project description; the existing service-request API stores the request and returns a reference number. Existing customers retain the structured project quote flow, and guest account creation is optional after submission.
- Added profile XP calculation, level thresholds, skill ratings, and achievement conditions.
- Added a server-side profile data loader and profile certificate data; separated achievements from certificates in the profile.
- Redesigned certificate verification pages with exam-specific title, acronym, accent, and print styling.
- Reduced profile client data by moving progress aggregation to the server and removed a continuously animated fixed background; reduced motion and mobile blur behavior were adjusted.
- Added unit coverage for XP breakdown and achievements.

**Baseline verification before security upgrades:** typecheck passes; tests pass 21/21; production build passes after the Next.js 16.4.0 security reminder retry. Subsequent security and guest quote changes are documented separately below and remain uncommitted.

### Security fixes in the current working tree

- Main working tree pins Next.js 16.4.3 and Zod 4.6.7 and configures the `security` agent-upgrade policy. `npm audit` reports 0 vulnerabilities.
- Focused auth review found that server-side admin access did not enforce the 30-minute elevation expiry. The working tree adds `Session.adminAccessExpiresAt`, migration `0010_admin_access_expiry`, and an expiry-boundary test. No database migration was applied.
- Current verification: typecheck, Prisma client generation, schema validation, 24/24 tests, and production build pass.
- Security branch `security/next-upgrade-2026-10-24` remains available with commits `d5c4632` and `10a85a1`; the fixes in the main working tree are uncommitted.
- Added schema-boundary tests for the Zod major-version migration; expand these with request-body size and route-specific invalid-input tests before release.
- No deployment was performed.

### Known limitations / external gates

- No automatic payment provider or merchant approval is configured.
- External email/Telegram delivery is not configured.
- Monitoring does not perform real network checks.
- Backup restoration has not been exercised against an isolated database.
- The repository's checked-in Render blueprint is the only deployment configuration verified in this session; VPS assumptions remain unconfirmed.
