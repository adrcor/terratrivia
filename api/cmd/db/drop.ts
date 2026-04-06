import { db, pool } from "@/database";
import { sql } from "kysely";

async function drop() {
  console.log("dropping all tables...");
  await sql`
    DO $$
    DECLARE
      tables TEXT;
    BEGIN
      SELECT string_agg('"' || table_name || '"', ', ') INTO tables
      FROM information_schema.tables
      WHERE table_schema = 'public';

      IF tables IS NOT NULL THEN
        EXECUTE 'DROP TABLE IF EXISTS ' || tables || ' CASCADE';
      END IF;
    END $$
  `.execute(db);

  console.log("all tables dropped");
  await pool.end();
}

drop().catch((err) => {
  console.error(err);
  process.exit(1);
});
