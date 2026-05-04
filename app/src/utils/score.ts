import type { CountryScore } from "../types/practice";
import { wpm } from "@/utils/cpm";
import { ilerp } from "@/utils/lerp";

const WPM_LOW = 30;
const WPM_HIGH = 150;
const REACTION_LOW = 700;
const REACTION_HIGH = 2100;

export function ilerpReactionTime(reactionTime: number) {
  return ilerp(-REACTION_HIGH, -REACTION_LOW, -reactionTime);
}

export function ilerpWpm(wpm: number) {
  return ilerp(WPM_LOW, WPM_HIGH, wpm);
}

export function scoreTotal(score: CountryScore) {
  if (score.count === 0) {
    return 0;
  }
  const reactionPct = ilerpReactionTime(score.reaction_time);
  const typingPct = ilerpWpm(wpm(score.typing_time, score.answer.length));
  const out = (reactionPct + typingPct) * 50;
  if (score.count < 4) {
    return Math.floor(out / (5 - score.count));
  }
  return Math.floor(out);
}
