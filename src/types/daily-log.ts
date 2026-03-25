/** Row shape for `public.daily_logs` (matches Supabase). */
export type DailyLog = {
  id: string;
  user_id: string;
  date: string;
  morning_weight_kg: number | null;
  calorie_target: number | null;
  calories_actual: number | null;
  protein_target_g: number | null;
  protein_actual_g: number | null;
  training_type: string | null;
  training_duration_min: number | null;
  training_notes: string | null;
  steps: number | null;
  alcohol_drinks: number | null;
  binge_flag: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Payload for insert/upsert (omit id and timestamps). */
export type DailyLogUpsert = Omit<
  DailyLog,
  "id" | "created_at" | "updated_at"
> & { id?: string };
