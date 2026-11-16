// Runs `prisma migrate deploy` during the Vercel build.
// Uses the direct (unpooled) Neon connection when available, and skips cleanly
// when no database is connected yet so the site still builds.
import { spawnSync } from "node:child_process";

const direct = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
if (!direct) {
  console.log("[migrate] No DATABASE_URL set. Skipping migrations (progress saving will be off).");
  process.exit(0);
}
const r = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: direct },
});
process.exit(r.status ?? 1);
