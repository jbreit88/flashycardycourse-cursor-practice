/** Stable across Node and browsers — avoids hydration mismatches from locale/timezone defaults. */
export function formatDateMedium(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(d);
}
