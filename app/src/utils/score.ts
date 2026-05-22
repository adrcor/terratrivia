import type { CountryStats } from "../types/practice";
import { wpm } from "@/utils/cpm";

export function reactionScore(reactionTime: number, target: number): number {
  if (reactionTime <= 0) return 1;
  return Math.min(1, target / reactionTime);
}

export function wpmScore(wpm: number, target: number): number {
  if (wpm <= 0) return 0;
  return Math.min(1, wpm / target);
}

export function typingScore(
  typingTime: number,
  answerLength: number,
  wpmTarget: number,
): number {
  return wpmScore(wpm(typingTime, answerLength), wpmTarget);
}

export function totalScore(
  reactionTime: number,
  typingTime: number,
  answerLength: number,
  reactionTarget: number,
  wpmTarget: number,
): number {
  return (
    (reactionScore(reactionTime, reactionTarget) +
      typingScore(typingTime, answerLength, wpmTarget)) /
    2
  );
}

export function countryScore(
  stats: CountryStats,
  reactionTarget: number,
  wpmTarget: number,
) {
  if (stats.count === 0) {
    return 0;
  }
  const reactionPct = reactionScore(stats.reaction_time, reactionTarget);
  const typingPct = wpmScore(stats.wpm, wpmTarget);
  const out = (reactionPct + typingPct) * 50;
  if (stats.count < 4) {
    return Math.floor(out / (5 - stats.count));
  }
  return Math.floor(out);
}
