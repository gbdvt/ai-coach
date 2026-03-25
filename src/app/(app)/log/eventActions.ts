"use server";

import { revalidatePath } from "next/cache";
import { fetchTargets } from "@/lib/coachSettings";
import { toLogEventRow } from "@/lib/mapLogEvent";
import { parseQuickLog } from "@/lib/quickLogParser";
import { buildDailyLogFromEvents } from "@/lib/syncDailyLogFromEvents";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { DailyLog } from "@/types/daily-log";
export type EventActionResult = { ok: true } | { ok: false; error: string };

export async function syncDailyLogForDate(logDate: string): Promise<EventActionResult> {
  const supabase = createClient();
  const { data: rawEvents, error: evErr } = await supabase
    .from("log_events")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .eq("log_date", logDate)
    .order("created_at", { ascending: true });

  if (evErr) return { ok: false, error: evErr.message };

  const { data: existingRow, error: exErr } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .eq("date", logDate)
    .maybeSingle();

  if (exErr) return { ok: false, error: exErr.message };

  const events = (rawEvents ?? []).map(toLogEventRow);
  const existing = existingRow as DailyLog | null;
  if (events.length === 0 && !existing) {
    return { ok: true };
  }

  const targets = await fetchTargets();
  const row = buildDailyLogFromEvents(events, existing, SINGLE_TENANT_USER_ID, logDate, targets);

  const { error: upErr } = await supabase.from("daily_logs").upsert(row, {
    onConflict: "user_id,date",
  });

  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/history");
  return { ok: true };
}

export async function submitQuickLog(logDate: string, text: string): Promise<EventActionResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Empty input." };

  const supabase = createClient();
  const parsed = parseQuickLog(trimmed);

  const { error } = await supabase.from("log_events").insert({
    user_id: SINGLE_TENANT_USER_ID,
    log_date: logDate,
    event_type: parsed.type,
    raw_text: trimmed,
    payload: parsed.payload,
  });

  if (error) return { ok: false, error: error.message };
  return syncDailyLogForDate(logDate);
}

export async function deleteLogEvent(eventId: string, logDate: string): Promise<EventActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("log_events").delete().eq("id", eventId);
  if (error) return { ok: false, error: error.message };
  return syncDailyLogForDate(logDate);
}

export async function updateLogEvent(
  eventId: string,
  logDate: string,
  text: string,
): Promise<EventActionResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Empty text." };

  const parsed = parseQuickLog(trimmed);
  const supabase = createClient();
  const { error } = await supabase
    .from("log_events")
    .update({
      event_type: parsed.type,
      raw_text: trimmed,
      payload: parsed.payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) return { ok: false, error: error.message };
  return syncDailyLogForDate(logDate);
}
