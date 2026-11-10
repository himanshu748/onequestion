/** Invalid configuration must never silently produce an unbounded/NaN budget. */
export function hostedDailyLimit(raw?: string): number {
  const parsed = Number(raw ?? "6");
  return Number.isFinite(parsed) ? Math.min(20, Math.max(0, parsed)) : 6;
}
