import { DEFAULT_CALORIE_TARGET, DEFAULT_PROTEIN_TARGET_G } from "@/lib/defaults";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { TargetConfig } from "@/lib/syncDailyLogFromEvents";

export async function fetchTargets(): Promise<TargetConfig> {
  const supabase = createClient();
  const { data } = await supabase
    .from("coach_settings")
    .select("default_calorie_target, default_protein_target_g")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .maybeSingle();

  return {
    calorieTarget: data?.default_calorie_target ?? DEFAULT_CALORIE_TARGET,
    proteinTargetG: data?.default_protein_target_g ?? DEFAULT_PROTEIN_TARGET_G,
  };
}
