import type { LogEventPayload, LogEventRow, LogEventType } from "@/types/log-event";

export function toLogEventRow(r: {
  id: string;
  user_id: string;
  log_date: string;
  event_type: string;
  raw_text: string;
  payload: unknown;
  created_at: string;
  updated_at: string;
}): LogEventRow {
  return {
    id: r.id,
    user_id: r.user_id,
    log_date: r.log_date,
    event_type: r.event_type as LogEventType,
    raw_text: r.raw_text,
    payload: (r.payload ?? {}) as LogEventPayload,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}
