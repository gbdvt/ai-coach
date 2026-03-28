import type { WeightTrendLabel } from "@/lib/analytics";
import type { CoachProfile } from "@/lib/coachSettings";
import type { DailyLog } from "@/types/daily-log";

export type OpeningContext = {
  profile: CoachProfile;
  today: string;
  todayLog: DailyLog | null;
  weightLabel: WeightTrendLabel | null;
  weightDeltaKg: number | null;
  kcalAdherencePct: number | null;
  proteinAdherencePct: number | null;
  hadWorkoutToday: boolean;
  hadAlcoholYesterday: boolean;
  hadBingeRecently: boolean;
};

function trendSentence(label: WeightTrendLabel | null, delta: number | null): string {
  if (label === "cutting effectively") {
    return "Weight trend is moving in the right direction for a cut.";
  }
  if (label === "increasing") {
    return "Weight is creeping up versus the prior week — check intake noise before you panic.";
  }
  if (label === "stable") {
    return "Weight looks stable week over week.";
  }
  if (delta != null) {
    return `Weight delta vs last week is about ${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg — interpret with salt and consistency.`;
  }
  return "Log a few morning weights this week so we can read trend, not vibes.";
}

export function buildDailyOpeningMessage(ctx: OpeningContext): string {
  const { profile, kcalAdherencePct, proteinAdherencePct } = ctx;
  const name = profile.displayName || "Athlete";

  const trend = trendSentence(ctx.weightLabel, ctx.weightDeltaKg);

  const train =
    profile.trainingFocus?.trim() ||
    (ctx.hadWorkoutToday
      ? "You already have work logged today — protect output with fuel."
      : "Key training: whatever hard session is on the plan today, treat it like the main event.");

  const nutrition =
    profile.nutritionFocus?.trim() ||
    (proteinAdherencePct != null && proteinAdherencePct < 85
      ? "Pull protein back to target before you chase more cardio."
      : kcalAdherencePct != null && kcalAdherencePct < 80
        ? "Don’t underfuel around hard work — anchor carbs before key sessions."
        : "Hit your protein floor and keep meals boringly consistent.");

  let caution = "";
  if (ctx.hadBingeRecently) {
    caution = " Watch-out: recent binge — no hero fasting; return to normal structure.";
  } else if (ctx.hadAlcoholYesterday) {
    caution = " Watch-out: alcohol in the last day or two — hydrate, sleep, don’t stack another blowout.";
  } else if (ctx.todayLog?.binge_flag) {
    caution = " Watch-out: today is flagged off-plan — reset with the next meal, not guilt reps.";
  } else {
    caution = " Watch-out: don’t let low steps or bad sleep pretend to be a nutrition problem.";
  }

  const phase = profile.phaseNote?.trim()
    ? ` ${profile.phaseNote.trim()}`
    : "";

  const closing =
    "Today’s execution target: one hard thing done clean, macros within range, no drama.";

  return `Hey ${name} — ${trend}${phase}\n\nTraining priority: ${train}\n\nNutrition priority: ${nutrition}\n\n${caution}\n\n${closing}`;
}
