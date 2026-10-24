# Tecsecure V1.0 — new platform foundation

The production-oriented rebuild lives in `platform/`; the original static files at the repository root are intentionally left untouched. This is a modular monolith: Next.js (public/customer/admin UI and API), PostgreSQL/Prisma, and a separate worker process.

## Current capability / scope status

| Capability | Status |
|---|---|
| Public site and published service catalog | Implemented |
| Service overview with infrastructure, installation, consulting, and equipment sections | Implemented; category details are translated and illustrated |
| Public product market | Reads published products from the database; shows an honest empty state until real inventory is published; inquiries only, no checkout |
| Public homepage contact details | Implemented; email, phone, and social handles can be edited in admin site settings |
| Customer registration/login, database-backed sessions, password hashing | Implemented |
| Google, GitHub, Yandex, and Microsoft customer sign-in | Implemented; each provider requires owner-created OAuth app credentials and callback registration; existing email accounts are not silently linked |
| Customer logout, account deletion, and request/project data anonymization | Implemented; password-confirmed; financial history is retained |
| Admin/staff server-side access checks and bootstrap | Implemented; staff has a separate login entry and is limited to request/project operations, while ADMIN manages system settings and user roles |
| Service requests, unique reference, request history, owner-scoped portal | Implemented |
| Telegram notifications for new service requests, orders, and project quotes | Implemented; requires the bot secrets and webhook setup below |
| Telegram admin replies saved in customer profile and sent to linked customers | Implemented; customer must connect Telegram from Profile → My messages |
| Customer portal with grouped service/order/monitoring/project/learning sections | Implemented |
| Tecsecure app install button | Implemented as a PWA install flow; not a native APK download |
| Admin service catalog create/archive | Implemented |
| Product catalog create/read and project submissions | Implemented |
| News publishing and admin create/edit/archive | Implemented |
| Admin quotation issue; customer accept/reject | Implemented |
| CCTV preliminary storage/bandwidth/PoE estimate | Implemented; assumptions disclosed |
| Organizations and memberships data model/create/list | Implemented; initial organization setup UI is pending |
| Device inventory registration and organization scoping | Implemented; UI and monitoring integration pending |
| Invoice creation from accepted quotations; manual payment submission and admin approval | Implemented; no payment provider or automatic settlement |
| Subscription plans and customer-consented trials | Implemented; no recurring billing or automatic charge |
| Monitoring worker | Not operational; no target checks are executed and all devices remain `UNKNOWN` until real telemetry is integrated |
| Email and worker-based external notification delivery | Not configured; the worker records undeliverable notifications as `FAILED` |
| Cybersecurity authorization/reporting | Schema foundation only; customer authorization, evidence access, and reporting workflow pending |
| Learning catalog and article access | Implemented; 13 static modules, TEC purchases, and 30-day wallet-funded Basic/Standard/Expert subscriptions; no hosted lab runtime or automatic renewal |
| Support tickets, uploads/private file storage, admin audit/history UI | Pending |
| Public statistics, client logos, prices, project claims | Not carried over as verified; must be confirmed by Tecsecure |

“Implemented” here means a route or workflow exists in source; it is not a claim that it has passed a production database end-to-end test. See `docs/` for the audit and legacy capability mapping.

## Local setup

Requirements: Node.js 22, npm, and PostgreSQL 15+.

1. From this directory, copy `.env.example` to `.env` and set a private PostgreSQL `DATABASE_URL`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 8 characters.
2. Install dependencies: `npm install`.
3. Generate Prisma client: `npm run db:generate`.
4. Create/apply the initial migration in a development database: `npm run db:dev -- --name initial`.
5. Create the first admin: `npm run admin:create`.
6. Start the application: `npm run dev`.
7. Visit `http://localhost:3000`; staff sign in at `/staff/login` and reach `/admin`, while customers use the personal portal. Never use the legacy default credentials.

For an existing database, take a backup first. Do not run `migrate dev` against production; use reviewed migrations and `npm run db:migrate`.

To reset an existing administrator or founder password from an interactive server terminal, run `npm run admin:password-reset -- admin@example.com` from this directory with `DATABASE_URL` available in the process environment. The new password is entered without terminal echo, must be at least 8 characters, and the command revokes that account's existing sessions. If the database URL is stored in `.env` rather than provided by the service environment, run `node --env-file=.env --import tsx scripts/reset-admin-password.ts admin@example.com` instead. This command does not create accounts or change roles.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string; keep private |
| `ADMIN_EMAIL` | Initial setup only | First administrator identity for the bootstrap script |
| `ADMIN_PASSWORD` | Initial setup only | One-time bootstrap secret; at least 8 characters |
| `NEXT_PUBLIC_APP_URL` | Deployment | Canonical public origin for deployment and security configuration |
| `NEXTAUTH_URL` | OAuth | Canonical origin used by NextAuth; must match the registered provider callback origin |
| `NEXTAUTH_SECRET` | OAuth | Unique random secret used to protect OAuth state and JWT sessions; never reuse the example value |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth app credentials |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth app credentials |
| `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET` | Optional | Yandex OAuth app credentials |
| `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` | Optional | Microsoft identity app credentials; tenant defaults to `common` |
| `TELEGRAM_BOT_TOKEN` | Optional | Secret token for the Tecsecure Telegram bot |
| `TELEGRAM_BOT_USERNAME` | Telegram | Public bot username without `@`, used to create customer linking links |
| `TELEGRAM_ADMIN_CHAT_ID` | Telegram | Private administrator chat ID that receives new request/order/project messages |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram | High-entropy secret used to authenticate Telegram webhook requests |

The current auth uses an unguessable random session token in an HttpOnly/SameSite cookie; only a SHA-256 token digest and expiration are stored in PostgreSQL. Passwords use bcrypt. Changing/removing the initial-admin environment variables after bootstrap does not rotate an existing password.

For OAuth, register the exact callback URLs `https://your-domain/api/auth/callback/google`, `/api/auth/callback/github`, `/api/auth/callback/yandex`, and `/api/auth/callback/microsoft` with the providers (use `http://localhost:3000` for local development). “Gmail sign-in” uses Google OAuth; it does not need an email-sending password. Configure secrets only in the local ignored `.env` or the hosting provider's secret store. An OAuth identity that returns an email already used by a password account is rejected rather than linked automatically; continue using that account's existing sign-in method. Account linking is not currently supported. OAuth sign-in creates customer accounts only and cannot grant staff/admin access.

To enable Google and GitHub buttons, create OAuth apps in Google Cloud Console and GitHub Developer Settings. Add `https://your-domain/api/auth/callback/google` as Google's authorized redirect URI. For GitHub, set the callback URL to `https://your-domain/api/auth/callback/github`; the GitHub provider requests verified email access so private email addresses can be returned. Put each provider's client ID and client secret into the hosting secret store, set `NEXTAUTH_URL` to the site's exact HTTPS origin, and ensure `NEXTAUTH_SECRET` is a unique random value of at least 32 characters. Restart/redeploy the web service; the matching buttons then appear on both `/login` and `/register`. Keep OAuth client secrets private and never paste them into chat or source control.

### Telegram support and notifications

1. Create a bot with BotFather. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, a private `TELEGRAM_ADMIN_CHAT_ID`, and a randomly generated `TELEGRAM_WEBHOOK_SECRET` only in the hosting provider's secret store.
2. The bot must be started by the administrator. Before setting its webhook, obtain the administrator chat ID from Telegram's `getUpdates` response; never paste the bot token into source code or commit it.
3. Apply the reviewed Prisma migration using the deployment's normal migration process. Configure Telegram's webhook URL as `https://your-domain/api/telegram/webhook` with Telegram's `secret_token` set to the same `TELEGRAM_WEBHOOK_SECRET`.
4. New service requests, product orders, and project/quote requests are sent to the configured private chat with a category and reference. Reply in that chat using `/reply REFERENCE your message`. The reply is saved to the customer's profile; if the customer connected Telegram in Profile → My messages, it is also delivered to that Telegram account.
5. Verify an end-to-end test with a non-production request before enabling this in production. If Telegram is unavailable, the original request remains saved in the database and delivery failure is logged.

Customer Telegram notifications currently use Telegram only; SMS is not configured. The “Ilovani yuklab olish” navigation button installs the HTTPS PWA when the browser offers installation, and otherwise opens browser-specific install instructions. No native Android/iOS package is included.

TEC packs use a 4,990 UZS base value per TEC and server-calculated volume discounts. Course subscriptions are prepaid for 30 days and do not renew automatically. UZS wallet deposits still require proof submission and administrator approval; no card/bank gateway is connected. The public product market lists published real records only and offers no online checkout. Do not publish placeholder inventory or imply that a deposit, product order, or recurring payment is automatic.

## Appearance and languages

The site provides light, dark, and system-following appearance modes, plus Uzbek, Russian, and English UI languages. Preferences are stored in the current browser only; they are not account settings and do not sync across devices. The main navigation is grouped into Home, Services, Market, and Education; customer account access is separate from staff login. Inner pages include a contextual Back link. Only ADMIN can edit system settings and user roles; STAFF can process service requests and projects. Contact email and social handles can be changed by an administrator in the admin company-information settings. Product, service, and learning/news content entered by an administrator remains in its original language and is not machine-translated; add separately reviewed localized content before publishing multilingual catalog copy.

The Education catalog contains self-paced material, not an accredited credential or a guarantee of senior/job-ready skill. Modules and paths do not include hosted isolated labs, instructor grading, or verified production experience. Completion time should be treated as a study estimate, not a promise; users need additional practice and supervised work to demonstrate professional proficiency. Public services include a translated overview of managed IT, IT management, VoIP, monitoring planning, backup/cloud, network security, and lifecycle support. Continuous live monitoring is not currently available on this platform.

Customer account deletion requires the current password and explicit confirmation. It removes the login/profile and memberships, anonymizes service-request details, and removes customer notes from project records; invoices/payment records and operational history remain for business recordkeeping. Staff/admin accounts cannot delete themselves through this customer action.

## Tests and checks

- `npm test` — unit tests for CCTV estimates and request status transitions.
- `npm run typecheck` — TypeScript check.
- `npm run build` — Prisma client generation and Next.js production build.
- `npm run db:migrate` — apply checked-in migrations to a configured database.

The test suite does not replace end-to-end, authorization, database migration, security, or production checks. Those must be run against an isolated PostgreSQL test database before release.

## Render deployment

`../render.yaml` defines a Render web service, worker, and PostgreSQL database. Connect a Git repository containing this project to Render and review the Blueprint before provisioning. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin and provide `ADMIN_EMAIL` plus a unique `ADMIN_PASSWORD` of at least 8 characters as Render secrets. After the first deploy and database migration, run `npm run admin:create` once from the web service shell to create the initial administrator. Deploying a public service requires access to the owner’s Render account and domain/DNS; no account, domain, provider credential, or permission is present in this workspace, so the Blueprint is prepared but not remotely deployed here.

The web start command applies reviewed Prisma migrations before serving. Back up the database before any production migration. Configure managed PostgreSQL backups and test restore/rollback in a separate environment.

## Security and operational limitations

- No sample customers, live inventory, pricing, telemetry, payment results, client logos, or success metrics are seeded.
- New customer registration is enabled; admin/staff roles can only be granted server-side by an authorized operator.
- Organization membership filters are enforced for organization and device records; do not expose database credentials to the browser.
- Request uploads, email/Telegram provider delivery, payment webhooks, recurring billing, real monitoring checks, and lab execution are not enabled.
- The worker explicitly records unconfigured external notification delivery as failed. It does not run network scans or probes.
- Application logs must not contain request descriptions, passwords, session tokens, or private assessment evidence.
- Configure provider-backed rate limiting/WAF and private document storage before accepting high-volume public traffic or confidential files.

## Backup and recovery

Use Render’s managed PostgreSQL backups or scheduled encrypted `pg_dump` stored outside the web filesystem. Restrict backup access, test restoration to a separate database, and validate record counts and relationships before switching traffic. Never test restore or migration against the only production copy.
