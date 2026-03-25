export type LogEventType =
  | "weight"
  | "meal"
  | "workout"
  | "alcohol"
  | "note"
  | "binge";

export type LogEventPayload = {
  weight_kg?: number;
  calories?: number;
  protein_g?: number;
  meal_label?: string;
  workout_summary?: string;
  duration_min?: number;
  drink_count?: number;
  note_text?: string;
};

export type LogEventRow = {
  id: string;
  user_id: string;
  log_date: string;
  event_type: LogEventType;
  raw_text: string;
  payload: LogEventPayload;
  created_at: string;
  updated_at: string;
};
