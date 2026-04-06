export function lerp(start: number, end: number, ratio: number): number {
  ratio = Math.max(0, Math.min(1, ratio));
  return start + (end - start) * ratio;
}

export function ilerp(start: number, end: number, value: number): number {
  value = Math.max(start, Math.min(end, value));
  return (value - start) / (end - start);
}
