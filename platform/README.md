# Tecsecure V1.0 — new platform foundation

The production-oriented rebuild lives in `platform/`; the original static files at the repository root are intentionally left untouched. This is a modular monolith: Next.js (public/customer/admin UI and API), PostgreSQL/Prisma, and a separate worker process.

## Current capability / scope status

| Capability | Status |
|---|---|
| Public site and published service catalog | Three-way entry to Services, Learning and Equipment Shop; grouped search at `/search`, shared navigation and account links |
| Service overview with infrastructure, installation, consulting, and equipment sections | Implemented; category details are translated and illustrated |
| Public product market | Published inventory, category/brand/stock/specification filters, currency-scoped price filtering, up to three same-category comparisons, image gallery and customer order requests; no online payment |
| Public homepage contact details | Implemented; email, phone, and social handles can be edited in admin site settings |
| Customer registration/login, database-backed sessions, password hashing | Implemented |
| Google, GitHub, Yandex, and Microsoft customer sign-in | Implemented; each provider requires owner-created OAuth app credentials and callback registration; existing email accounts are not silently linked |
| Customer logout, account deletion, and request/project data anonymization | Implemented; password-confirmed; financial history is retained |
| Admin/staff server-side access checks and bootstrap | Implemented; staff has a separate login entry and is limited to request/project operations, while ADMIN manages system settings and user roles |
| Service requests, unique reference, request history, owner-scoped portal | Detailed requests or phone-and-consent callbacks; selected service/topic is retained; request links open the correct account section |
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
| Learning catalog and article access | Public entry and lab/exam previews, searchable module catalog with URL filters, resume links, TEC purchases and 30-day wallet-funded subscriptions; existing content access rules remain in force |
| Support tickets, uploads/private file storage, admin audit/history UI | Pending |
| Public statistics, client logos, prices, project claims | Not carried over as verified; must be confirmed by Tecsecure |

“Implemented” here means a route or workflow exists in source; it is not a claim that it has passed a production database end-to-end test. See `docs/` for the audit and legacy capability mapping.

### Public journeys and catalog maintenance

- `/` introduces Tecsecure before the three illustrated entry paths to `/services`, `/learning`, or `/products`. The redundant decision/account section is omitted; account navigation remains in the shared header. `/store` is specifically for TEC packs and learning subscriptions, not physical equipment.
- Liquid Glass is the default appearance profile. Its glassmorphism material uses low-opacity surfaces over a cyan/violet/teal backdrop, frosted blur and directional edge highlights, rather than opaque cards with a blur declaration. The homepage illustrates it with overlapping glass panes over colored shapes. The shared material covers public pages, learning, the customer workspace and administration; existing profiles remain alternate palettes/fonts. Menus/dialogs retain stronger tints and reading/code surfaces remain higher-opacity for legibility. Unsupported browsers, increased contrast and reduced transparency use opaque fallbacks.
- Navigation fades without remounting page state. Hero/card entrances and product hover transitions respect reduced motion. Motion is decorative and never required to access a control.
- The user-supplied UI demos are adapted into local React/CSS in `src/components/` and `src/app/feature-effects.css`, not executed from the download directory. There are no imported CDN scripts, GSAP/jQuery dependencies, demo photographs, fake payment details or global demo resets.
  - `animated-login-register_form_tcw`: one sliding login/register window with the original orange rotating shapes, floating labels and gradient submit button. Switching uses local state and native history, not page navigation; inactive forms are inert and disabled. Direct links and browser Back select the appropriate panel. Existing validation, OAuth, locale and staff-only access are preserved.
  - `Animated Logout Button`: original articulated SVG, walking poses, closing door, impact and falling sequence on shared customer/staff/admin logout. The animation runs after the server accepts logout, and navigation waits for it to finish. Failure reports an error without redirecting. The fall distance is bounded for the site's scrollable layout.
  - `Credit_Card_TCW`: reversible internal wallet card showing real balance, reward points and rank; explicitly not a bank card, with no CVV or invented number.
  - `Order_button_animation`: original CSS-built 3D truck, wheels, cabin and parcel, with loading/road/driving choreography ported to native Web Animations. Requests start immediately; the button flips back to its check mark only when both the choreography and a successful server response complete. Failure resets the button and retains the cart. Motion resources are cancelled on unmount.
  - The `deadline-loading` adaptation, route loading component, illustration and styles have been removed. Cart price requests retain plain loading feedback.
  - Checkout's delivery map uses the shared native top-layer dialog, escaping the address card's backdrop-filter/stacking/clipping. Background controls are inert while open; Escape, backdrop click and closing restore focus.
  - `lamp_moving_tcw`: localized 404 page with a swinging lamp and working home/search links.
  - `futuristic_landing_page`: manual three-direction hero selector with rotating glass content and destination links, replacing the unrelated juice products.
  - `timed_card`: active portfolio card emphasis and position progress, using the existing real photos and autoplay/hover/swipe controls rather than remote travel images.
  - `burning_reveal`: the supplied organic paper/fire shader and eight-second easing, with Tecsecure replacing the demo title. It replays on every document entry/reload, restored browser-history entry, and return to the homepage from another route; there is no session-storage suppression. Other internal navigation does not interrupt users with an intro. Skip and Escape open the site immediately; reduced-motion skips it. WebGL failure uses a brief static title, with nine-second hydrated and ten-second pre-hydration safety exits. Resolution is capped and GPU resources/listeners are released on exit.
  - `fire_footer`: visible mint liquid bubbles using the original SVG blur/alpha-threshold gooey filter above the glass footer. Particles loop while visible, pause offscreen/backgrounded and have a localized pause/resume control. Reduced-motion uses a static edge.
  - Decorative entrance/footer/lamp effects finish within five seconds. Pending-state indicators run only while waiting. Reduced-motion disables animations; controls and content remain usable.
- Published portfolio media starts scrolling automatically without a visible toolbar. Mouse hover pauses it and leaving resumes it; a deliberate horizontal touch swipe stops automatic movement until reload or keyboard restart. Vertical touch scrolling does not stop it. Keyboard focus, image zoom, offscreen visibility and background tabs pause it; reduced motion disables automatic playback. A keyboard-focus-only pause/start control, Arrow/Home/End navigation and image zoom remain available. Original media is not duplicated.
- `/services` explains six common needs, scope, deliverables, exclusions and price factors. `/contact?mode=callback` needs a phone and consent; detailed requests still require a name and description. `topic` is bounded and safely included in the saved request; `service` must match an available published service.
- `/search` groups published product/service matches and learning previews. Lesson bodies, exam answers and private account data are not search results.
- Product media is resolved from existing `MediaAsset` records on the server. Cards prefer the first image over video; detail pages provide thumbnails and an accessible native-dialog zoom. Missing photos are labelled illustrations, not invented product photographs. Add verified model photos, specifications, compatibility and warranty through the product editor.
- Shop cards offer a keyboard/touch-accessible quick-view dialog with gallery, public specifications, price and existing cart actions. If a second real image exists, pointer hover crossfades to it. Image failures are disclosed, not silently substituted. Quick view uses the current page's catalog snapshot; checkout still revalidates live prices and availability.
- Price filtering/sorting is in the selected original currency (UZS by default); display conversion is independent. A missing price is a quote request, never zero. Specification filters appear for categories with structured specifications.
- `/products/compare?ids=...` accepts up to three published products of one category. Selection is kept in session storage; the comparison page reads current database values.
- Cart previews fetch current public prices and media without requiring sign-in. Order submission still requires a customer account. Submitted catalog expectations are checked server-side; changes return HTTP 409 for review. Delivery fees and timing are agreed separately, and submitting an order is not payment confirmation.
- Customer dashboard sections use `/portal/profile?section=...`, so requests and navigation remain addressable. Guest lab/exam previews omit answers, purchases and account progress; starting protected activities retains authentication.
- No invented project outcomes, client reviews, guaranteed response times, partnerships, stock or shipping promises are added. Those facts must be maintained by the business.

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
| `INTEGRATION_CREDENTIALS_KEY` | Optional | Stable random key (32+ bytes) for encrypting admin-managed credentials at rest; defaults to `NEXTAUTH_SECRET` |
| OAuth provider variables | Optional fallback | Google, GitHub, Yandex, and Microsoft credentials can be managed in Admin → System → Integration settings |
| Telegram provider variables | Optional fallback | Bot token, username, private admin chat ID, and webhook secret can be managed in Admin → System → Integration settings |
| `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` | Optional fallback | Yandex Maps key; can be managed in Admin → System → Integration settings and is sent to browsers to render maps |

The current auth uses an unguessable random session token in an HttpOnly/SameSite cookie; only a SHA-256 token digest and expiration are stored in PostgreSQL. Passwords use bcrypt. Changing/removing the initial-admin environment variables after bootstrap does not rotate an existing password.

For OAuth, register the exact callback URLs `https://your-domain/api/auth/callback/google`, `/api/auth/callback/github`, `/api/auth/callback/yandex`, and `/api/auth/callback/microsoft` with the providers (use `http://localhost:3000` for local development). “Gmail sign-in” uses Google OAuth; it does not need an email-sending password. Credentials can be entered in Admin → System → Integration settings; the values are encrypted in the database and take effect without redeploying. A dedicated, stable `INTEGRATION_CREDENTIALS_KEY` is recommended; if omitted, `NEXTAUTH_SECRET` is used, so rotating it requires re-entering stored credentials. Secret fields are never returned to the browser; leave them blank to keep the saved value or explicitly select Clear. An OAuth identity that returns an email already used by a password account is rejected rather than linked automatically; continue using that account's existing sign-in method. Account linking is not currently supported. OAuth sign-in creates customer accounts only and cannot grant staff/admin access.

To enable Google and GitHub buttons, create OAuth apps in Google Cloud Console and GitHub Developer Settings. Add `https://your-domain/api/auth/callback/google` as Google's authorized redirect URI. For GitHub, set the callback URL to `https://your-domain/api/auth/callback/github`; the GitHub provider requests verified email access so private email addresses can be returned. Enter each provider's client ID and client secret in Admin → System → Integration settings, set `NEXTAUTH_URL` to the site's exact HTTPS origin, and ensure `NEXTAUTH_SECRET` is a unique random value of at least 32 characters. Keep OAuth client secrets private and never paste them into chat or source control.

### Telegram support and notifications

1. Create a bot with BotFather. Enter `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, a private `TELEGRAM_ADMIN_CHAT_ID`, and a randomly generated `TELEGRAM_WEBHOOK_SECRET` in Admin → System → Integration settings. These settings override the optional environment fallbacks.
2. The bot must be started by the administrator. Before setting its webhook, obtain the administrator chat ID from Telegram's `getUpdates` response; never paste the bot token into source code or commit it.
3. Configure Telegram's webhook URL as `https://your-domain/api/telegram/webhook` with Telegram's `secret_token` set to the same `TELEGRAM_WEBHOOK_SECRET`.
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
