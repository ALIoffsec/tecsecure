# Tecsecure operations runbook

**Status:** initial repository-grounded runbook; production access and restore procedures are not verified.
**Last checked:** 2026-10-24.

## Verified hosting shape

`../render.yaml` defines a Render Node web service and a separate Node worker, both rooted at `platform/`, plus a managed PostgreSQL database. It configures Node 22 and a web health endpoint at `/api/health`. No Docker Compose, Dockerfile, Nginx, or Ubuntu VPS configuration was found in the inspected repository. Do not assume an unrelated VPS is the active production host.

The local `.env` is ignored. Never print, copy, commit, or send its values. `.env.example` uses placeholders.

## Local safe verification

From `platform/`:

```powershell
npm ci
npm run db:generate
npm run typecheck
npm test
npm audit
npm run build
```

Build generation and database migration are separate operations. Do not run `npm run db:migrate` until the target database is positively identified as disposable or the production change has been reviewed and authorized.

## Render commands in repository configuration

- Web build: `npm ci && npx prisma generate && npm run build`
- Web start: `npm run db:migrate && npm start`
- Worker start: `npm run worker`
- Health endpoint: `/api/health`

These are the committed blueprint commands, not proof that a Render deployment is active or healthy. The web start command runs migrations on application startup; before scaling web instances, verify migration serialization and operational behavior with the hosting provider.

## Worker behavior and limitations

The current worker polls every 15 seconds in batches of up to 50. It marks external notifications failed when their provider is not configured, expires trials without charging automatically, creates in-app reminders, and cleans expired sessions/rate limits. It logs each worker-cycle error but continues polling. No graceful shutdown signal handling or real target monitoring was identified in the inspected worker source.

Do not advertise external notification delivery or live monitoring until configured providers and real checks pass tests.

## Google and GitHub customer sign-in

Google and GitHub OAuth are supported as optional customer sign-in and registration methods. Create OAuth apps in the provider consoles, register the exact callback URLs `https://your-domain/api/auth/callback/google` and `https://your-domain/api/auth/callback/github`, then store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET` in the hosting provider's secret store. Set `NEXTAUTH_URL` to the canonical HTTPS site origin and `NEXTAUTH_SECRET` to a unique random value of at least 32 characters, then redeploy. Google is the provider for Gmail accounts; it does not send email.

OAuth sign-in only creates CUSTOMER accounts. Existing accounts with a matching email are not automatically linked; users must use the sign-in method already attached to that account. Keep OAuth secrets out of source control, logs, and support chat.

## Telegram support bot

The web application can forward new service requests, orders, and project/quote inquiries to one private administrator chat. The bot webhook accepts `/reply REFERENCE message`, stores the administrator reply in the customer's portal conversation, creates an in-app notification, and sends the reply to customers who linked their Telegram account.

Required hosting secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME` (without `@`)
- `TELEGRAM_ADMIN_CHAT_ID` (private chat only)
- `TELEGRAM_WEBHOOK_SECRET` (high-entropy secret)

Create the bot through `@BotFather` with `/newbot`, then save the returned token and bot username. Start the bot from the administrator's personal Telegram account and send it a message. Before setting a webhook, obtain that private chat's ID from the bot's `getUpdates` API using a trusted private terminal; do not put the bot token in a browser URL, source code, logs, shell history, or support chat. Generate a separate high-entropy webhook secret. Store all four values (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`) in the hosting secret store.

Apply the Prisma migration through the reviewed deployment process. Set the webhook URL to `https://your-domain/api/telegram/webhook` and pass the same webhook secret as Telegram's `secret_token` parameter; verify the response reports success before testing. Customers link their Telegram from `/portal/profile` → “Xabarlarim”; linking tokens expire after 10 minutes and are single-use. New request, order, and project notifications go to the configured private administrator chat. Reply with `/reply REFERENCE your message`; the reply appears in the customer's profile and is sent to their linked Telegram.

Telegram delivery is best-effort after the database transaction commits. If Telegram fails, the request and its portal thread remain stored and the error is logged. SMS delivery and native APK/IPA packages are not included. The navigation install action is a PWA flow and requires HTTPS plus a browser that supports web app installation.

## Backup and restore (not yet verified)

No backup command or tested restore path is provided here because the active production database identity, provider backup policy, retention, and credentials have not been verified. Before creating an operational procedure:

1. Confirm database host/provider, retention, and access policy with the owner.
2. Create a backup using the provider's supported mechanism or a verified PostgreSQL client.
3. Restore only into a separate isolated database.
4. Verify schema migration state, record counts, and a representative application read.
5. Record recovery point and recovery time; never include credentials in this document.

Never use `prisma migrate reset`, `db push`, or a destructive command against production as a backup/restore shortcut.

## Upgrade and rollback

1. Use a separate branch/worktree and retain the current deployment revision.
2. Review dependency audit and migration diffs before deployment.
3. Run `npm ci`, Prisma generation, typecheck, tests, and production build.
4. Ensure a verified backup and a compatible rollback strategy before database-changing releases.
5. Deploy only after explicit owner authorization; check health and application/worker logs.
6. If unhealthy, revert to the previous application revision. Database rollback may not be safe; follow the reviewed recovery plan rather than improvising migrations.

No production deployment or rollback was performed during this audit.
