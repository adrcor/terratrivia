import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface TrialAnswer {
  country: string;
  cca2: string;
  answer: string;
  valid: boolean;
  reaction_time: number;
  typing_time: number;
}

export interface UserTable {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface TrialResultsTable {
  id: string;
  id_user: string | null;
  region: string;
  mode: string;
  length: number;
  correct: number;
  time: number;
  answers: TrialAnswer[];
  created: Generated<Date>;
}

export type TrialResult = Selectable<TrialResultsTable>;
export type NewTrialResult = Insertable<TrialResultsTable>;
export type TrialResultUpdate = Updateable<TrialResultsTable>;

export interface TrialHighscoresTable {
  id_user: string;
  region: string;
  mode: string;
  id_result: string | null;
  length: number;
  correct: number;
  time: number;
}
