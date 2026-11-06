// Run with: npm run db:backup
// Writes a compressed dump of DATABASE_URL into BACKUP_DIR (default ./backups) and keeps the newest 14.
// Restore with: pg_restore --clean --if-exists --dbname "$DATABASE_URL" <file>
// Copy the dumps off this machine: a backup on the same disk does not survive that disk.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL first.");
const dir = process.env.BACKUP_DIR || "backups";
const keep = Number(process.env.BACKUP_KEEP) || 14;
mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const file = join(dir, `tecsecure-${stamp}.dump`);
execFileSync(process.env.PG_DUMP || "pg_dump", ["--format=custom", `--file=${file}`, url.split("?")[0]], { stdio: "inherit" });
if (statSync(file).size === 0) throw new Error("The backup came out empty.");
console.info(`Backup written: ${file} (${statSync(file).size} bytes)`);

const old = readdirSync(dir).filter(name => /^tecsecure-.*\.dump$/.test(name)).sort().reverse().slice(keep);
for (const name of old) unlinkSync(join(dir, name));
if (old.length) console.info(`Removed ${old.length} old backup(s).`);
