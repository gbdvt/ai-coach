import type { DailyLog } from "@/types/daily-log";

export function averageWeight(logs: DailyLog[]): number | null {
  const vals = logs
    .map((l) => l.morning_weight_kg)
    .filter((v): v is number => v != null && !Number.isNaN(Number(v)));
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + Number(b), 0) / vals.length;
}

export function averageCalories(logs: DailyLog[]): number | null {
  const vals = logs
    .map((l) => l.calories_actual)
    .filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function averageProtein(logs: DailyLog[]): number | null {
  const vals = logs
    .map((l) => l.protein_actual_g)
    .filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function trainingDaysCount(logs: DailyLog[]): number {
  return logs.filter(
    (l) =>
      (l.training_type != null && l.training_type.trim() !== "") ||
      (l.training_duration_min != null && l.training_duration_min > 0),
  ).length;
}

/** Consecutive days with a log, walking back from `startDate` (inclusive). */
export function logStreak(logDates: Set<string>, startDate: string): number {
  let streak = 0;
  let cur = startDate;
  while (logDates.has(cur)) {
    streak += 1;
    const [y, m, d] = cur.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - 1);
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, "0");
    const nd = String(dt.getDate()).padStart(2, "0");
    cur = `${ny}-${nm}-${nd}`;
  }
  return streak;
}
