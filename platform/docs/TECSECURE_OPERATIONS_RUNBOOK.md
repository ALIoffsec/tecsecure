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
