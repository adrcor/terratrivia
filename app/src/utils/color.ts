export function practiceScoreColor(value: number, threshold: number): string {
  if (value === 100) {
    return "var(--color-primary-600)";
  }
  if (value === 0) {
    return "var(--color-neutral-600)";
  }
  if (value < threshold) {
    const pct = (value / threshold) * 100;
    return `color-mix(in oklch, var(--color-orange-800) ${100 - pct}%, var(--color-emerald-700) ${pct}%)`;
  }
  const pct = Math.floor(((value - threshold) / (100 - threshold)) * 100);
  return `color-mix(in oklch, var(--color-primary-800) ${100 - pct}%, var(--color-primary-700) ${pct}%)`;
}

export function trialScoreColor(value: number): string {
  if (value === 100) {
    return "var(--color-primary-600)";
  }
  return `color-mix(in oklch, var(--color-orange-800) ${100 - value}%, var(--color-emerald-700) ${value}%)`;
}
