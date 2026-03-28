"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";

function strField(formData: FormData, key: string, maxLen: number): string {
  const raw = formData.get(key);
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, maxLen);
}

export async function saveCoachSettings(formData: FormData): Promise<void> {
  const calorieRaw = formData.get("default_calorie_target");
  const proteinRaw = formData.get("default_protein_target_g");
  const c = typeof calorieRaw === "string" ? parseInt(calorieRaw, 10) : NaN;
  const p = typeof proteinRaw === "string" ? parseInt(proteinRaw, 10) : NaN;

  if (!Number.isFinite(c) || c < 500 || c > 20000) {
    throw new Error("Calorie target should be between 500 and 20000.");
  }
  if (!Number.isFinite(p) || p < 20 || p > 500) {
    throw new Error("Protein target should be between 20 and 500 g.");
  }

  const displayName = strField(formData, "display_name", 80) || "Athlete";
  const trainingFocus = strField(formData, "training_focus", 500);
  const nutritionFocus = strField(formData, "nutrition_focus", 500);
  const phaseNote = strField(formData, "phase_note", 500);

  const supabase = createClient();
  const { error } = await supabase.from("coach_settings").upsert(
    {
      user_id: SINGLE_TENANT_USER_ID,
      default_calorie_target: c,
      default_protein_target_g: p,
      display_name: displayName,
      training_focus: trainingFocus,
      nutrition_focus: nutritionFocus,
      phase_note: phaseNote,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(error.message);

  const { error: logErr } = await supabase
    .from("daily_logs")
    .update({
      calorie_target: c,
      protein_target_g: p,
    })
    .eq("user_id", SINGLE_TENANT_USER_ID);

  if (logErr) throw new Error(logErr.message);

  revalidatePath("/coach");
  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/history");
  revalidatePath("/settings");
}
