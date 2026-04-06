import { getMigrations } from "better-auth/db/migration";
import { auth } from "@/auth/auth";
import { db, pool, schema } from "@/database";

async function init() {
  console.log("running better-auth migrations...");
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();

  console.log("initializing app schema...");
  await schema.execute(db);

  console.log("database initialized");
  await pool.end();
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
