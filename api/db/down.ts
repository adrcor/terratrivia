import { promises as fs } from "node:fs";
import * as path from "node:path";
import { Pool } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const migrationsDir = path.join(import.meta.dir, "migrations");
const entries = await fs.readdir(migrationsDir);
const names = entries
  .filter((f) => f.endsWith(".sql"))
  .map((f) => f.replace(/\.sql$/, ""))
  .sort();

if (names.length < 2) {
  console.error(
    `Need at least 2 migrations to go down 1; found ${names.length}.`,
  );
  process.exit(1);
}

const latestFile = names[names.length - 1];
const prevFile = names[names.length - 2];
const prevVersion = prevFile.split("_")[0];

const db = new Kysely<unknown>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: url }),
  }),
});

const latestApplied = await sql<{ name: string }>`
  SELECT name FROM kysely_migration ORDER BY name DESC LIMIT 1
`.execute(db);

if (latestApplied.rows.length === 0) {
  console.error("kysely_migration is empty; nothing to revert.");
  await db.destroy();
  process.exit(1);
}

const applied = latestApplied.rows[0].name;
if (applied !== latestFile) {
  console.error(
    `Latest applied migration (${applied}) doesn't match latest file (${latestFile}).`,
  );
  console.error("Refusing to proceed — fix the state mismatch first.");
  await db.destroy();
  process.exit(1);
}

console.log(`Reverting ${latestFile} → ${prevFile}\n`);

const proc = Bun.spawn(
  [
    "atlas",
    "schema",
    "diff",
    "--from",
    "file://db/migrations?format=atlas",
    "--to",
    `file://db/migrations?format=atlas&version=${prevVersion}`,
    "--env",
    "local",
    "-c",
    "file://db/atlas.hcl",
  ],
  { stdio: ["inherit", "pipe", "inherit"] },
);

const sqlText = await new Response(proc.stdout).text();
const code = await proc.exited;

if (code !== 0) {
  console.error(`atlas exited ${code}; not modifying anything.`);
  await db.destroy();
  process.exit(code);
}

if (sqlText.trim() === "" || /no changes/i.test(sqlText)) {
  console.log("Atlas reports no schema differences. Nothing to revert.");
  await db.destroy();
  process.exit(0);
}

console.log("--- SQL to apply ---");
console.log(sqlText);
console.log("--------------------");

const answer = prompt("Apply this revert? [y/N]");
if (answer?.toLowerCase() !== "y") {
  console.log("Aborted.");
  await db.destroy();
  process.exit(1);
}

await sql.raw(sqlText).execute(db);
await sql`DELETE FROM kysely_migration WHERE name = ${latestFile}`.execute(db);
console.log(`✓ reverted ${latestFile}`);

await db.destroy();
