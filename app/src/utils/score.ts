import type { CountryStats } from "../types/practice";
import { REACTION_TARGET, WPM_TARGET } from "@/stores/constants";
import { wpm } from "@/utils/cpm";

export function reactionScore(reactionTime: number): number {
  if (reactionTime <= 0) return 1;
  return Math.min(1, REACTION_TARGET / reactionTime);
}

export function wpmScore(wpm: number): number {
  if (wpm <= 0) return 0;
  return Math.min(1, wpm / WPM_TARGET);
}

export function typingScore(typingTime: number, answerLength: number): number {
  return wpmScore(wpm(typingTime, answerLength));
}

export function totalScore(
  reactionTime: number,
  typingTime: number,
  answerLength: number,
): number {
  return (
    (reactionScore(reactionTime) + typingScore(typingTime, answerLength)) / 2
  );
}

export function countryScore(stats: CountryStats) {
  if (stats.count === 0) {
    return 0;
  }
  const reactionPct = reactionScore(stats.reaction_time);
  const typingPct = wpmScore(stats.wpm);
  const out = (reactionPct + typingPct) * 50;
  if (stats.count < 4) {
    return Math.floor(out / (5 - stats.count));
  }
  return Math.floor(out);
}
