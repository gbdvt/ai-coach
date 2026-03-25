export function formatNumber(
  n: number | null | undefined,
  opts?: { maxFractionDigits?: number },
): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    maximumFractionDigits: opts?.maxFractionDigits ?? 1,
  });
}

export function formatInt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return Math.round(n).toLocaleString();
}
