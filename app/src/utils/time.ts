export function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(2);
}

export function formatSecondsInt(ms: number): string {
  return Math.floor(ms / 1000).toString();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
