"use server";

import { revalidatePath } from "next/cache";
import { fetchTargets } from "@/lib/coachSettings";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { DailyLogUpsert } from "@/types/daily-log";

export type SaveLogResult = { ok: true } | { ok: false; error: string };

/** Advanced / manual day edit: targets always come from coach settings, not the form. */
export async function upsertDailyLog(
  payload: Omit<DailyLogUpsert, "user_id" | "calorie_target" | "protein_target_g">,
): Promise<SaveLogResult> {
  const supabase = createClient();
  const targets = await fetchTargets();

  const row: DailyLogUpsert = {
    ...payload,
    user_id: SINGLE_TENANT_USER_ID,
    calorie_target: targets.calorieTarget,
    protein_target_g: targets.proteinTargetG,
  };

  const { error } = await supabase.from("daily_logs").upsert(row, {
    onConflict: "user_id,date",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/history");
  return { ok: true };
}
