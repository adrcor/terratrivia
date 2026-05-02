export type Region = "af" | "am" | "as" | "eu" | "oc" | "world";
export type Mode = "capitals" | "flags";
export const modes: Mode[] = ["capitals", "flags"];
export const regions: Region[] = [
  "af",
  "am",
  "as",
  "eu",
  "oc",
  "world",
];

export const regionLengths: Record<Region, number> = {
  af: 54,
  am: 35,
  as: 47,
  eu: 45,
  oc: 14,
  world: 195,
};

export interface Pair {
  prompt: string;
  expected: string;
}

export interface Country {
  name: string;
  capital: string;
  cca2: string;
  region: Region;
  flag: string;
}

export interface InputAnswer {
  answer: string;
  valid: boolean;
  reaction_time: number; // ms
  typing_time: number; // ms
}

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
