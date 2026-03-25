import type { LogEventRow } from "@/types/log-event";
import { formatNumber } from "@/lib/format";

const icons: Record<LogEventRow["event_type"], string> = {
  weight: "⚖️",
  meal: "🍽",
  workout: "🏋️",
  alcohol: "🍺",
  note: "📝",
  binge: "⚠️",
};

export function eventIcon(type: LogEventRow["event_type"]): string {
  return icons[type];
}

export function summarizeEvent(e: LogEventRow): string {
  switch (e.event_type) {
    case "weight":
      return e.payload.weight_kg != null
        ? `${formatNumber(e.payload.weight_kg, { maxFractionDigits: 1 })} kg`
        : e.raw_text;
    case "meal": {
      const c = e.payload.calories;
      const p = e.payload.protein_g;
      const bits: string[] = [];
      if (c != null) bits.push(`${c} kcal`);
      if (p != null) bits.push(`${p} g protein`);
      const tail = e.payload.meal_label?.trim();
      return [bits.join(" · "), tail].filter(Boolean).join(" — ") || e.raw_text;
    }
    case "workout":
      return e.payload.workout_summary || e.raw_text;
    case "alcohol": {
      const n = e.payload.drink_count ?? 1;
      return `${n} drink${n === 1 ? "" : "s"}`;
    }
    case "binge":
      return "Off-plan / binge";
    case "note":
    default:
      return e.payload.note_text || e.raw_text;
  }
}

export function eventTypeLabel(type: LogEventRow["event_type"]): string {
  const labels: Record<LogEventRow["event_type"], string> = {
    weight: "Weight",
    meal: "Meal",
    workout: "Workout",
    alcohol: "Alcohol",
    note: "Note",
    binge: "Binge",
  };
  return labels[type];
}
