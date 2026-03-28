import { DEFAULT_CALORIE_TARGET, DEFAULT_PROTEIN_TARGET_G } from "@/lib/defaults";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { TargetConfig } from "@/lib/syncDailyLogFromEvents";

export type CoachProfile = {
  displayName: string;
  calorieTarget: number;
  proteinTargetG: number;
  trainingFocus: string;
  nutritionFocus: string;
  phaseNote: string;
};

export async function fetchCoachProfile(): Promise<CoachProfile> {
  const supabase = createClient();
  const { data } = await supabase
    .from("coach_settings")
    .select(
      "display_name, default_calorie_target, default_protein_target_g, training_focus, nutrition_focus, phase_note",
    )
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .maybeSingle();

  return {
    displayName: (data?.display_name as string | null)?.trim() || "Athlete",
    calorieTarget: data?.default_calorie_target ?? DEFAULT_CALORIE_TARGET,
    proteinTargetG: data?.default_protein_target_g ?? DEFAULT_PROTEIN_TARGET_G,
    trainingFocus: (data?.training_focus as string | null)?.trim() || "",
    nutritionFocus: (data?.nutrition_focus as string | null)?.trim() || "",
    phaseNote: (data?.phase_note as string | null)?.trim() || "",
  };
}

export async function fetchTargets(): Promise<TargetConfig> {
  const p = await fetchCoachProfile();
  return { calorieTarget: p.calorieTarget, proteinTargetG: p.proteinTargetG };
}
