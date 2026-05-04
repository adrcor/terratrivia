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