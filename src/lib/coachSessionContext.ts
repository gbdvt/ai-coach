import {
  compareWeightWeeks,
  logsByDate,
  macroAdherencePercent,
} from "@/lib/analytics";
import { addDays } from "@/lib/dates";
import type { CoachProfile } from "@/lib/coachSettings";
import { fetchCoachProfile } from "@/lib/coachSettings";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { OpeningContext } from "@/lib/dailyOpening";
import type { DailyLog } from "@/types/daily-log";
import type { RuleReplyContext } from "@/lib/coachReplyRules";

export async function loadRuleReplyContext(today: string): Promise<RuleReplyContext> {
  const supabase = createClient();
  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .eq("date", today)
    .maybeSingle();

  const tlog = log as DailyLog | null;
  const hadHardSessionToday = Boolean(
    tlog?.training_type?.trim() || (tlog?.training_duration_min ?? 0) > 0,
  );

  const ct = tlog?.calorie_target;
  const ca = tlog?.calories_actual;
  const kcalRatio = ct != null && ct > 0 && ca != null ? ca / ct : null;

  const pt = tlog?.protein_target_g;
  const pa = tlog?.protein_actual_g;
  const proteinRatio = pt != null && pt > 0 && pa != null ? pa / pt : null;

  const fetchStart = addDays(today, -13);
  const { data: twoWeek } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .gte("date", fetchStart)
    .lte("date", today)
    .order("date", { ascending: true });

  const byDate = logsByDate((twoWeek ?? []) as DailyLog[]);
  const w = compareWeightWeeks(byDate, today);

  return {
    todayLog: tlog,
    hadHardSessionToday,
    kcalRatio,
    proteinRatio,
    weightDeltaLabel: w.label,
  };
}

export async function loadOpeningContext(today: string): Promise<OpeningContext> {
  const supabase = createClient();
  const profile = await fetchCoachProfile();

  const fetchStart = addDays(today, -13);
  const [{ data: todayLog }, { data: twoWeek }, { data: yLog }, { data: recent }] =
    await Promise.all([
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .gte("date", fetchStart)
        .lte("date", today)
        .order("date", { ascending: true }),
      supabase
        .from("daily_logs")
        .select("alcohol_drinks, binge_flag")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .eq("date", addDays(today, -1))
        .maybeSingle(),
      supabase
        .from("daily_logs")
        .select("binge_flag, date")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .gte("date", addDays(today, -4))
        .lte("date", today)
        .order("date", { ascending: false }),
    ]);

  const tlog = todayLog as DailyLog | null;
  const byDate = logsByDate((twoWeek ?? []) as DailyLog[]);
  const w = compareWeightWeeks(byDate, today);
  const kcal = macroAdherencePercent(byDate, today, "calories");
  const prot = macroAdherencePercent(byDate, today, "protein");

  const hadWorkoutToday = Boolean(
    tlog?.training_type?.trim() || (tlog?.training_duration_min ?? 0) > 0,
  );

  const hadAlcoholYesterday = ((yLog as { alcohol_drinks?: number } | null)?.alcohol_drinks ?? 0) > 0;

  const hadBingeRecently = Boolean(
    tlog?.binge_flag ||
      (recent as { binge_flag?: boolean }[] | null)?.some((r) => r.binge_flag),
  );

  return {
    profile,
    today,
    todayLog: tlog,
    weightLabel: w.label,
    weightDeltaKg: w.deltaKg,
    kcalAdherencePct: kcal.percent,
    proteinAdherencePct: prot.percent,
    hadWorkoutToday,
    hadAlcoholYesterday,
    hadBingeRecently,
  };
}

/** For coachLlm.ts CoachLlmContext */
export async function buildCoachLlmContext(
  today: string,
  profile: CoachProfile,
): Promise<import("@/lib/coachLlm").CoachLlmContext> {
  const supabase = createClient();
  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .eq("date", today)
    .maybeSingle();

  const tlog = log as DailyLog | null;
  const parts: string[] = [];
  if (tlog) {
    if (tlog.morning_weight_kg != null) parts.push(`Weight today: ${tlog.morning_weight_kg} kg`);
    if (tlog.calories_actual != null) parts.push(`Kcal in: ${tlog.calories_actual}`);
    if (tlog.protein_actual_g != null) parts.push(`Protein in: ${tlog.protein_actual_g} g`);
    if (tlog.training_type) parts.push(`Training: ${tlog.training_type}`);
    if ((tlog.alcohol_drinks ?? 0) > 0) parts.push(`Alcohol drinks: ${tlog.alcohol_drinks}`);
    if (tlog.binge_flag) parts.push("Binge flagged today.");
  } else {
    parts.push("No structured day row yet.");
  }

  const fetchStart = addDays(today, -13);
  const { data: twoWeek } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .gte("date", fetchStart)
    .lte("date", today);

  const byDate = logsByDate((twoWeek ?? []) as DailyLog[]);
  const w = compareWeightWeeks(byDate, today);
  const trendSnippet =
    w.label != null
      ? `Weight vs prior week: ${w.label}${w.deltaKg != null ? ` (~${w.deltaKg > 0 ? "+" : ""}${w.deltaKg.toFixed(1)} kg).` : "."}`
      : "Not enough weight data for a clean week-vs-week read.";

  return {
    today,
    displayName: profile.displayName,
    calorieTarget: profile.calorieTarget,
    proteinTargetG: profile.proteinTargetG,
    trainingFocus: profile.trainingFocus,
    nutritionFocus: profile.nutritionFocus,
    phaseNote: profile.phaseNote,
    todaySummary: parts.join(" | ") || "Empty day log.",
    trendSnippet,
  };
}
