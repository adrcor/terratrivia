-- Create "practice_units" table
CREATE TABLE "practice_units" (
  "id_user" text NOT NULL,
  "region" text NOT NULL,
  "mode" text NOT NULL,
  "unit" jsonb NOT NULL,
  PRIMARY KEY ("id_user", "region", "mode"),
  CONSTRAINT "practice_units_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
