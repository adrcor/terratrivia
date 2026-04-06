import { sql } from "kysely";

export const schema = sql`

CREATE TABLE IF NOT EXISTS trial_results (
	id text PRIMARY KEY,
	id_user text REFERENCES "user"(id) ON DELETE CASCADE,

	region text NOT NULL, -- world | as | af | eu | na | oc | sa
	mode text NOT NULL, -- capitals | flags
	length integer NOT NULL,
	correct integer NOT NULL,
	time integer NOT NULL, -- ms
	answers jsonb NOT NULL, -- array of {country, capital, short, valid, reaction_time, typing_time}

	created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trial_highscores (
	id_user text REFERENCES "user"(id) ON DELETE CASCADE,
	region text, -- world | as | af | eu | na | oc | sa
	mode text, -- capitals | flags

	id_result text REFERENCES trial_results(id) ON DELETE CASCADE,
	length integer NOT NULL,
	correct integer NOT NULL,
	time integer NOT NULL, -- ms

	PRIMARY KEY (id_user, region, mode)
);

`;
