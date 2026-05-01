-- Create "user" table
CREATE TABLE "user" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "emailVerified" boolean NOT NULL,
  "image" text NULL,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "user_email_key" UNIQUE ("email")
);
-- Create "verification" table
CREATE TABLE "verification" (
  "id" text NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
-- Create index "verification_identifier_idx" to table: "verification"
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");
-- Create "account" table
CREATE TABLE "account" (
  "id" text NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL,
  "accessToken" text NULL,
  "refreshToken" text NULL,
  "idToken" text NULL,
  "accessTokenExpiresAt" timestamptz NULL,
  "refreshTokenExpiresAt" timestamptz NULL,
  "scope" text NULL,
  "password" text NULL,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "account_userId_idx" to table: "account"
CREATE INDEX "account_userId_idx" ON "account" ("userId");
-- Create "session" table
CREATE TABLE "session" (
  "id" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "token" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL,
  "ipAddress" text NULL,
  "userAgent" text NULL,
  "userId" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "session_token_key" UNIQUE ("token"),
  CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "session_userId_idx" to table: "session"
CREATE INDEX "session_userId_idx" ON "session" ("userId");
-- Create "trial_results" table
CREATE TABLE "trial_results" (
  "id" text NOT NULL,
  "id_user" text NULL,
  "region" text NOT NULL,
  "mode" text NOT NULL,
  "length" integer NOT NULL,
  "correct" integer NOT NULL,
  "time" integer NOT NULL,
  "answers" jsonb NOT NULL,
  "created" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "trial_results_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "trial_highscores" table
CREATE TABLE "trial_highscores" (
  "id_user" text NOT NULL,
  "region" text NOT NULL,
  "mode" text NOT NULL,
  "id_result" text NULL,
  "length" integer NOT NULL,
  "correct" integer NOT NULL,
  "time" integer NOT NULL,
  PRIMARY KEY ("id_user", "region", "mode"),
  CONSTRAINT "trial_highscores_id_result_fkey" FOREIGN KEY ("id_result") REFERENCES "trial_results" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "trial_highscores_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
