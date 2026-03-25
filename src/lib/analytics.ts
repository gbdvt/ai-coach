import type { DailyLog } from "@/types/daily-log";
import { addDays, eachDateInRange } from "@/lib/dates";

/** Map date → log (last write wins if duplicates). */
export function logsByDate(logs: DailyLog[]): Map<string, DailyLog> {
  const m = new Map<string, DailyLog>();
  for (const l of logs) m.set(l.date, l);
  return m;
}

export function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export type WeightTrendLabel = "cutting effectively" | "stable" | "increasing";

export function weightLabelTone(
  label: WeightTrendLabel | null,
): "positive" | "neutral" | "warn" {
  if (label === "cutting effectively") return "positive";
  if (label === "increasing") return "warn";
  return "neutral";
}

/** Compare average weight in last 7 calendar days vs the 7 days before that. */
export function compareWeightWeeks(
  byDate: Map<string, DailyLog>,
  today: string,
): {
  currentAvg: number | null;
  prevAvg: number | null;
  deltaKg: number | null;
  label: WeightTrendLabel | null;
  currentDaysWithWeight: number;
  prevDaysWithWeight: number;
} {
  const curStart = addDays(today, -6);
  const prevEnd = addDays(curStart, -1);
  const prevStart = addDays(prevEnd, -6);

  const weightsInRange = (start: string, end: string): number[] => {
    const days = eachDateInRange(start, end);
    const out: number[] = [];
    for (const d of days) {
      const w = byDate.get(d)?.morning_weight_kg;
      if (w != null && !Number.isNaN(Number(w))) out.push(Number(w));
    }
    return out;
  };

  const cur = weightsInRange(curStart, today);
  const prev = weightsInRange(prevStart, prevEnd);
  const currentAvg = mean(cur);
  const prevAvg = mean(prev);

  let deltaKg: number | null = null;
  if (currentAvg != null && prevAvg != null) deltaKg = currentAvg - prevAvg;

  let label: WeightTrendLabel | null = null;
  if (deltaKg != null) {
    if (deltaKg < -0.05) label = "cutting effectively";
    else if (deltaKg > 0.05) label = "increasing";
    else label = "stable";
  }

  return {
    currentAvg,
    prevAvg,
    deltaKg,
    label,
    currentDaysWithWeight: cur.length,
    prevDaysWithWeight: prev.length,
  };
}

/** Average of min(actual/target, 1.2) over days in window where target > 0 and actual present. */
export function macroAdherencePercent(
  byDate: Map<string, DailyLog>,
  today: string,
  kind: "calories" | "protein",
): { percent: number | null; daysCounted: number; avgActual: number | null; avgTarget: number | null } {
  const start = addDays(today, -6);
  const days = eachDateInRange(start, today);
  const ratios: number[] = [];
  const actuals: number[] = [];
  const targets: number[] = [];

  for (const d of days) {
    const log = byDate.get(d);
    if (!log) continue;
    if (kind === "calories") {
      const t = log.calorie_target;
      const a = log.calories_actual;
      if (t != null && t > 0 && a != null) {
        ratios.push(Math.min(1.2, a / t));
        actuals.push(a);
        targets.push(t);
      }
    } else {
      const t = log.protein_target_g;
      const a = log.protein_actual_g;
      if (t != null && t > 0 && a != null) {
        ratios.push(Math.min(1.2, a / t));
        actuals.push(a);
        targets.push(t);
      }
    }
  }

  if (ratios.length === 0) {
    return { percent: null, daysCounted: 0, avgActual: null, avgTarget: null };
  }

  const avgRatio = mean(ratios)!;
  return {
    percent: Math.round(Math.min(100, avgRatio * 100)),
    daysCounted: ratios.length,
    avgActual: mean(actuals),
    avgTarget: mean(targets),
  };
}

export function trainingDaysInLast7(byDate: Map<string, DailyLog>, today: string): number {
  const start = addDays(today, -6);
  const days = eachDateInRange(start, today);
  let n = 0;
  for (const d of days) {
    const log = byDate.get(d);
    if (!log) continue;
    if (
      (log.training_type != null && log.training_type.trim() !== "") ||
      (log.training_duration_min != null && log.training_duration_min > 0)
    ) {
      n += 1;
    }
  }
  return n;
}

export type TrainingConsistencyLabel = "consistent" | "low activity";

export function trainingConsistencyLabel(trainedDays: number): TrainingConsistencyLabel {
  return trainedDays >= 4 ? "consistent" : "low activity";
}

export type WeightChartRow = {
  date: string;
  label: string;
  weight: number | null;
  ma7: number | null;
};

/** One row per calendar day in [weekStart, today]; MA uses weights in trailing up-to-7-day window. */
export function buildWeightChartRows(
  byDate: Map<string, DailyLog>,
  weekStart: string,
  today: string,
  labelFn: (iso: string) => string,
): WeightChartRow[] {
  const days = eachDateInRange(weekStart, today);
  return days.map((d, i) => {
    const w = byDate.get(d)?.morning_weight_kg;
    const weight = w != null && !Number.isNaN(Number(w)) ? Number(w) : null;
    const windowStart = Math.max(0, i - 6);
    const windowDays = days.slice(windowStart, i + 1);
    const ws = windowDays
      .map((x) => byDate.get(x)?.morning_weight_kg)
      .filter((v): v is number => v != null && !Number.isNaN(Number(v)))
      .map(Number);
    const ma7 = ws.length > 0 ? ws.reduce((a, b) => a + b, 0) / ws.length : null;
    return { date: d, label: labelFn(d), weight, ma7 };
  });
}

export type MacroChartRow = {
  date: string;
  label: string;
  actual: number | null;
  target: number | null;
};

export function buildMacroChartRows(
  byDate: Map<string, DailyLog>,
  weekStart: string,
  today: string,
  labelFn: (iso: string) => string,
  kind: "calories" | "protein",
): MacroChartRow[] {
  const days = eachDateInRange(weekStart, today);
  return days.map((d) => {
    const log = byDate.get(d);
    if (kind === "calories") {
      return {
        date: d,
        label: labelFn(d),
        actual: log?.calories_actual ?? null,
        target: log?.calorie_target ?? null,
      };
    }
    return {
      date: d,
      label: labelFn(d),
      actual: log?.protein_actual_g ?? null,
      target: log?.protein_target_g ?? null,
    };
  });
}

/** Compare average weight in second half vs first half of sorted-by-date logs (with weight). */
export function weightChangeSplitPeriod(logs: DailyLog[]): {
  deltaKg: number | null;
  firstAvg: number | null;
  lastAvg: number | null;
  halfSize: number;
} {
  const sorted = [...logs]
    .filter((l) => l.morning_weight_kg != null && !Number.isNaN(Number(l.morning_weight_kg)))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) {
    return { deltaKg: null, firstAvg: null, lastAvg: null, halfSize: 0 };
  }
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);
  const firstAvg = mean(firstHalf.map((l) => Number(l.morning_weight_kg)));
  const lastAvg = mean(secondHalf.map((l) => Number(l.morning_weight_kg)));
  if (firstAvg == null || lastAvg == null) {
    return { deltaKg: null, firstAvg, lastAvg, halfSize: mid };
  }
  return { deltaKg: lastAvg - firstAvg, firstAvg, lastAvg, halfSize: mid };
}

/** Adherence 0–1 for a single day (for calendar color). */
export function dayCalorieAdherence(log: DailyLog | undefined): number | null {
  if (!log) return null;
  const t = log.calorie_target;
  const a = log.calories_actual;
  if (t == null || t <= 0 || a == null) return null;
  return Math.min(1, a / t);
}
