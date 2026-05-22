import type { Mode, Region } from "@/types/common";

export type KeyMetric = "total" | "reaction" | "typing";

export interface TrialAnswer {
  country: string;
  cca2: string;
  answer: string;
  valid: boolean;
  reaction_time: number; // ms
  typing_time: number; // ms
}

export interface TrialResultLocal {
  region: Region;
  mode: Mode;
  length: number;
  correct: number;
  time: number;
  answers: Array<TrialAnswer>;
  created: string;
}

export interface TrialResultSmall {
  id: string;
  region: Region;
  mode: Mode;
  correct: number;
  length: number;
  time: number;
  created: string;
}

export interface TrialResult extends TrialResultSmall {
  answers: Array<TrialAnswer>;
}

export interface TrialHighscore {
  id_user: string;
  region: Region;
  mode: Mode;

  id_result: string;
  correct: number;
  length: number;
  time: number;
}
