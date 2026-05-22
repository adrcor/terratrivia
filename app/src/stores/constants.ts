export const NEW_DISCOVER_COUNT = 5;

export const WPM_INVALID = 0;
export const REACTION_INVALID = 5000;

export const EXPONENTIAL_WEIGHT = 5;

export interface ScoringSettings {
  reactionTarget: number;
  wpmTarget: number;
  validationScore: number;
}

export const PRESETS = {
  casual: {
    reactionTarget: 1500,
    wpmTarget: 60,
    validationScore: 40,
  },
  standard: {
    reactionTarget: 1000,
    wpmTarget: 100,
    validationScore: 50,
  },
  expert: {
    reactionTarget: 750,
    wpmTarget: 150,
    validationScore: 60,
  },
} as const satisfies Record<string, ScoringSettings>;

export type PresetName = keyof typeof PRESETS;
