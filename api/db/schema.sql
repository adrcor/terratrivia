-- better-auth schema --

create table "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade);

create table "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create index "session_userId_idx" on "session" ("userId");

create index "account_userId_idx" on "account" ("userId");

create index "verification_identifier_idx" on "verification" ("identifier");

-- terratrivia schema --

CREATE TABLE trial_results (
	id text PRIMARY KEY,
	id_user text REFERENCES "user"(id) ON DELETE CASCADE,

	region text NOT NULL, -- world | as | af | eu | na | oc | sa
	mode text NOT NULL, -- capitals | flags
	length integer NOT NULL,
	correct integer NOT NULL,
	time integer NOT NULL, -- ms
	answers jsonb NOT NULL, -- array of {country, capital, short, valid, reaction_time, typing_time}

	created timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trial_highscores (
	id_user text REFERENCES "user"(id) ON DELETE CASCADE,
	region text, -- world | as | af | eu | na | oc | sa
	mode text, -- capitals | flags

	id_result text REFERENCES trial_results(id) ON DELETE CASCADE,
	length integer NOT NULL,
	correct integer NOT NULL,
	time integer NOT NULL, -- ms

	PRIMARY KEY (id_user, region, mode)
);
