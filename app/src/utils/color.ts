import { VALID_THRESHOLD } from "@/stores/constants";

export function practiceScoreColor(value: number): string {
  if (value === 100) {
    return "var(--color-primary-600)";
  }
  if (value === 0) {
    return "var(--color-neutral-600)";
  }
  if (value < VALID_THRESHOLD) {
    const pct = (value / VALID_THRESHOLD) * 100;
    return `color-mix(in oklch, var(--color-emerald-700) ${Math.max(20, pct)}%, transparent)`;
  }
  const pct = Math.floor(
    ((value - VALID_THRESHOLD) / (100 - VALID_THRESHOLD)) * 100,
  );
  return `color-mix(in oklch, var(--color-primary-800) ${100 - pct}%, var(--color-primary-700) ${pct}%)`;
}

export function trialScoreColor(value: number): string {
  if (value === 100) {
    return "var(--color-primary-600)";
  }
  return `color-mix(in oklch, var(--color-orange-800) ${100 - value}%, var(--color-emerald-700) ${value}%)`;
}
