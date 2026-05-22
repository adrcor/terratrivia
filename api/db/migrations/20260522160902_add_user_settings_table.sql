-- Create "user_settings" table
CREATE TABLE "user_settings" (
  "id_user" text NOT NULL,
  "settings" jsonb NOT NULL DEFAULT '{}',
  "updated" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id_user"),
  CONSTRAINT "user_settings_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
