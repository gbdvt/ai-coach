/** Local calendar date as YYYY-MM-DD (no timezone shift for “today”). */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDateString(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, delta: number): string {
  const d = parseLocalDateString(iso);
  d.setDate(d.getDate() + delta);
  return formatLocalDate(d);
}

/** Inclusive range [start, end] as ISO date strings. */
export function eachDateInRange(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  let cur = parseLocalDateString(startIso);
  const end = parseLocalDateString(endIso);
  while (cur <= end) {
    out.push(formatLocalDate(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
  return out;
}
