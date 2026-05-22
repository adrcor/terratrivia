import type {
  UserTable,
  TrialResultsTable,
  TrialHighscoresTable,
  PracticeUnitTable,
  UserSettingsTable,
} from "./schema";
import { DATABASE_URL, DEBUG } from "@/env";
import { PostgresDialect, Kysely } from "kysely";
import { Pool } from "pg";

export interface Database {
  user: UserTable;
  trial_results: TrialResultsTable;
  trial_highscores: TrialHighscoresTable;
  practice_units: PracticeUnitTable;
  user_settings: UserSettingsTable;
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

if (DEBUG) {
  pool.on("connect", (client) => {
    const originalQuery = client.query.bind(client) as typeof client.query;
    (client.query as any) = (...args: any[]) => {
      console.log("SQL:", args[0]?.text ?? args[0]);
      return (originalQuery as any)(...args);
    };
  });
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});
