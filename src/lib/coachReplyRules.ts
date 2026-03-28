import { formatNumber } from "@/lib/format";
import type { ParsedQuickLog } from "@/lib/quickLogParser";
import type { DailyLog } from "@/types/daily-log";
export type RuleReply = {
  text: string;
  chips: string[];
};

export type RuleReplyContext = {
  todayLog: DailyLog | null;
  hadHardSessionToday: boolean;
  kcalRatio: number | null;
  proteinRatio: number | null;
  weightDeltaLabel: string | null;
};

function closingLine(kind: "fuel" | "recover" | "protein" | "neutral"): string {
  switch (kind) {
    case "fuel":
      return "Main job now: get carbs in before the hard work and don’t run the session underfed.";
    case "recover":
      return "Main job now: hydrate, sleep, and don’t try to “fix” yesterday with punishment eating.";
    case "protein":
      return "Today’s target: hit your protein floor even if calories drift a little.";
    default:
      return "Stay on the plan you set — small execution beats big speeches.";
  }
}

export function buildRuleReplyAfterLog(
  parsed: ParsedQuickLog,
  _raw: string,
  ctx: RuleReplyContext,
): RuleReply {
  const chips: string[] = [];

  switch (parsed.type) {
    case "weight": {
      chips.push("Weight updated");
      const w = parsed.payload.weight_kg;
      const wStr =
        w != null ? `${formatNumber(w, { maxFractionDigits: 1 })} kg logged.` : "Weight logged.";
      let extra = "";
      if (ctx.weightDeltaLabel === "cutting effectively") {
        extra = " Trend is moving the right way — don’t get sloppy with protein.";
      } else if (ctx.weightDeltaLabel === "increasing") {
        extra = " Weight is ticking up — if that’s not the goal, tighten intake consistency, not drama.";
      } else if (ctx.weightDeltaLabel === "stable") {
        extra = " Weight looks stable — good time to judge adherence, not the scale noise.";
      }
      return {
        text: `${wStr}${extra ? ` ${extra}` : ""} ${closingLine("neutral")}`,
        chips,
      };
    }
    case "meal": {
      chips.push("Meal logged");
      const c = parsed.payload.calories;
      const p = parsed.payload.protein_g;
      const bits: string[] = [];
      if (c != null) bits.push(`${c} kcal`);
      if (p != null) bits.push(`${p} g protein`);
      let warn = "";
      if (ctx.hadHardSessionToday && (ctx.kcalRatio != null && ctx.kcalRatio < 0.55)) {
        warn =
          " Intake looks light for a hard day — add a carb anchor before or around training.";
      } else if (ctx.proteinRatio != null && ctx.proteinRatio < 0.75) {
        warn = " Protein is behind target — next meal should center protein, not excuses.";
      }
      return {
        text: `Logged${bits.length ? `: ${bits.join(", ")}` : ""}.${warn} ${ctx.hadHardSessionToday ? closingLine("fuel") : closingLine("protein")}`,
        chips,
      };
    }
    case "workout": {
      chips.push("Workout recorded");
      const dm = parsed.payload.duration_min;
      const dur = dm != null ? ` ${dm} min` : "";
      return {
        text: `Session in the book${dur}. Next nutrition move: carbs + protein in the window after, then normal meals — don’t erase it with restriction.`,
        chips,
      };
    }
    case "alcohol": {
      chips.push("Alcohol logged");
      const n = parsed.payload.drink_count ?? 1;
      return {
        text: `${n} drink${n === 1 ? "" : "s"} noted. ${closingLine("recover")}`,
        chips,
      };
    }
    case "binge": {
      chips.push("Binge flagged");
      return {
        text: `Flagged. One off-plan stretch doesn’t rewrite the block — return to baseline meals today, no compensation cardio fantasy. ${closingLine("recover")}`,
        chips,
      };
    }
    case "note":
    default: {
      chips.push("Note saved");
      return {
        text: `Noted. If that affects training or food execution, log the numbers next so I can be precise.`,
        chips,
      };
    }
  }
}

export function buildUnclearReply(): RuleReply {
  return {
    text: "Say it like a log (e.g. weight 82.5, 600 cal 40 protein) or ask a direct question. I’ll route it.",
    chips: [],
  };
}

export function buildGoalUpdateReply(): RuleReply {
  return {
    text: "Updated. Those priorities are saved — I’ll lean on them in the daily brief and answers.",
    chips: ["Goals updated"],
  };
}

export function buildQuestionFallbackReply(): RuleReply {
  return {
    text: "That needs a real answer. Add OPENAI_API_KEY for full Q&A coaching in chat; until then, use Settings for targets and the Trends page for numbers, or rephrase as a simple log line.",
    chips: [],
  };
}
