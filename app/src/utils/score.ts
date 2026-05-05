import type { CountryScore } from "../types/practice";
import {
  REACTION_FLOOR,
  REACTION_TARGET,
  WPM_TARGET,
  WPM_FLOOR,
} from "@/stores/constants";
import { ilerp } from "@/utils/lerp";

export function ilerpReactionTime(reactionTime: number) {
  return ilerp(-REACTION_FLOOR, -REACTION_TARGET, -reactionTime);
}

export function ilerpWpm(wpm: number) {
  return ilerp(WPM_FLOOR, WPM_TARGET, wpm);
}

export function scoreTotal(score: CountryScore) {
  if (score.count === 0) {
    return 0;
  }
  const reactionPct = ilerpReactionTime(score.reaction_time);
  const typingPct = ilerpWpm(score.wpm);
  const out = (reactionPct + typingPct) * 50;
  if (score.count < 4) {
    return Math.floor(out / (5 - score.count));
  }
  return Math.floor(out);
}
