"use server";

import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { DailyLogUpsert } from "@/types/daily-log";

export type SaveLogResult = { ok: true } | { ok: false; error: string };

export async function upsertDailyLog(
  payload: Omit<DailyLogUpsert, "user_id">,
): Promise<SaveLogResult> {
  const supabase = createClient();

  const row: DailyLogUpsert = {
    ...payload,
    user_id: SINGLE_TENANT_USER_ID,
  };

  const { error } = await supabase.from("daily_logs").upsert(row, {
    onConflict: "user_id,date",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
