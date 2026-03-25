import { DEFAULT_CALORIE_TARGET, DEFAULT_PROTEIN_TARGET_G } from "@/lib/defaults";
import type { DailyLog } from "@/types/daily-log";
import type { LogEventRow } from "@/types/log-event";

export type TargetConfig = {
  calorieTarget: number;
  proteinTargetG: number;
};

/**
 * Merges quick-log events into a `daily_logs` row. Only overwrites a field when
 * matching events exist (or always sets targets from settings). Preserves e.g.
 * `steps` and manual-only fields when no events touch them.
 */
export function buildDailyLogFromEvents(
  events: LogEventRow[],
  existing: DailyLog | null,
  userId: string,
  date: string,
  targets: TargetConfig,
): Omit<DailyLog, "id" | "created_at" | "updated_at"> & { id?: string } {
  const meals = events.filter((e) => e.event_type === "meal");
  let calories_actual = existing?.calories_actual ?? null;
  let protein_actual_g = existing?.protein_actual_g ?? null;
  if (meals.length > 0) {
    calories_actual = meals.reduce((s, e) => s + (e.payload.calories ?? 0), 0);
    protein_actual_g = meals.reduce((s, e) => s + (e.payload.protein_g ?? 0), 0);
  }

  let morning_weight_kg = existing?.morning_weight_kg ?? null;
  const weights = events.filter((e) => e.event_type === "weight");
  if (weights.length > 0) {
    const last = weights[weights.length - 1];
    morning_weight_kg =
      last.payload.weight_kg != null ? last.payload.weight_kg : morning_weight_kg;
  }

  const wos = events.filter((e) => e.event_type === "workout");
  let training_type = existing?.training_type ?? null;
  let training_duration_min = existing?.training_duration_min ?? null;
  let training_notes = existing?.training_notes ?? null;
  if (wos.length > 0) {
    training_type = wos
      .map((w) => (w.payload.workout_summary || w.raw_text).slice(0, 60))
      .join(" · ")
      .slice(0, 200);
    training_notes = wos.map((w) => w.raw_text).join("\n");
    const durs = wos
      .map((w) => w.payload.duration_min)
      .filter((x): x is number => x != null && !Number.isNaN(x));
    if (durs.length > 0) {
      training_duration_min = durs.reduce((a, b) => a + b, 0);
    }
  }

  const alc = events.filter((e) => e.event_type === "alcohol");
  let alcohol_drinks = existing?.alcohol_drinks ?? null;
  if (alc.length > 0) {
    alcohol_drinks = alc.reduce((s, e) => s + (e.payload.drink_count ?? 1), 0);
  }

  const binge_flag = events.some((e) => e.event_type === "binge");

  const noteLines = events
    .filter((e) => e.event_type === "note")
    .map((e) => e.payload.note_text || e.raw_text);
  let notes = existing?.notes ?? null;
  if (noteLines.length > 0) {
    notes = noteLines.join("\n");
  }

  const calorie_target = targets.calorieTarget ?? DEFAULT_CALORIE_TARGET;
  const protein_target_g = targets.proteinTargetG ?? DEFAULT_PROTEIN_TARGET_G;

  return {
    user_id: userId,
    date,
    morning_weight_kg,
    calorie_target,
    calories_actual,
    protein_target_g,
    protein_actual_g,
    training_type,
    training_duration_min,
    training_notes,
    steps: existing?.steps ?? null,
    alcohol_drinks,
    binge_flag,
    notes,
    ...(existing?.id ? { id: existing.id } : {}),
  };
}
