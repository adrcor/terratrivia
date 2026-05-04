import type { Country, Mode, Region } from "./common";

export interface CountryScore {
  country: string;
  cca2: string;
  answer: string;
  reaction_time: number;
  typing_time: number;
  count: number;
}

export interface UnitState {
  region: Region;
  mode: Mode;
  count: number;
  discovered: number;
  validated: number;
  list: Array<Country>;
  scores: Record<string, CountryScore>;
}

export type PracticeState = Partial<Record<`${Mode}:${Region}`, UnitState>>;

export interface PracticeAnswer {
  cca2: string;
  reaction_time: number;
  typing_time: number;
  valid: boolean;
}

export interface PracticeStats {
  validated: number;
  completed: number;
  average_reaction_time: number;
  average_wpm: number;
}
