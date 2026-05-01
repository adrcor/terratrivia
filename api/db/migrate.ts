import { promises as fs } from "node:fs";
import * as path from "node:path";
import { Pool } from "pg";
import {
  Kysely,
  Migrator,
  PostgresDialect,
  sql,
  type Migration,
  type MigrationProvider,
} from "kysely";

class AtlasMigrationProvider implements MigrationProvider {
  constructor(private readonly folder: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const entries = await fs.readdir(this.folder);
    const sqlFiles = entries.filter((f) => f.endsWith(".sql")).sort();

    const migrations: Record<string, Migration> = {};
    for (const file of sqlFiles) {
      const full = path.join(this.folder, file);
      const name = file.replace(/\.sql$/, "");
      migrations[name] = {
        up: async (db: Kysely<unknown>) => {
          const contents = await fs.readFile(full, "utf8");
          await sql.raw(contents).execute(db);
        },
      };
    }
    return migrations;
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const db = new Kysely<unknown>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: url }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new AtlasMigrationProvider(
    path.join(import.meta.dir, "migrations"),
  ),
});

const { error, results } = await migrator.migrateToLatest();

for (const r of results ?? []) {
  const mark = r.status === "Success" ? "✓" : r.status === "Error" ? "✗" : "·";
  console.log(`${mark} ${r.migrationName} (${r.direction})`);
}

if (error) {
  console.error("Migration failed:", error);
  await db.destroy();
  process.exit(1);
}

if (!results || results.length === 0) {
  console.log("No pending migrations.");
}

await db.destroy();
