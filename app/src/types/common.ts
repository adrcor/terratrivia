

export type Region = "af" | "am" | "as" | "eu" | "oc" | "world";
export type Mode = "capitals" | "flags";
export const modes: Mode[] = ["capitals", "flags"];
export const regions: Region[] = ["af", "am", "as", "eu", "oc", "world"];

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
