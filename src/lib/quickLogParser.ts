import type { LogEventPayload, LogEventType } from "@/types/log-event";

export type ParsedQuickLog = {
  type: LogEventType;
  payload: LogEventPayload;
};

/**
 * Rule-based quick log parser. When unclear, returns a `note` event.
 */
export function parseQuickLog(input: string): ParsedQuickLog {
  const t = input.trim();
  if (!t) {
    return { type: "note", payload: { note_text: "" } };
  }
  const lower = t.toLowerCase();

  if (/\b(binge|binged|binged\s+tonight|off\s*plan)\b/i.test(t)) {
    return { type: "binge", payload: { note_text: t } };
  }

  const beerMatch = lower.match(/(\d+)\s*(beers?|drinks?)\b/);
  if (beerMatch) {
    return {
      type: "alcohol",
      payload: { drink_count: parseInt(beerMatch[1], 10), note_text: t },
    };
  }
  if (/\b(\d+)\s*x\s*beer/.test(lower)) {
    const m = lower.match(/(\d+)\s*x\s*beer/);
    if (m) {
      return {
        type: "alcohol",
        payload: { drink_count: parseInt(m[1], 10), note_text: t },
      };
    }
  }
  if (/\b(a beer|one beer|single beer)\b/.test(lower)) {
    return { type: "alcohol", payload: { drink_count: 1, note_text: t } };
  }

  const weightPrefix = t.match(/\bweight\s+(\d+\.?\d*)\b/i);
  if (weightPrefix) {
    return {
      type: "weight",
      payload: { weight_kg: parseFloat(weightPrefix[1]) },
    };
  }
  const kgOnly = t.match(/^(\d+\.?\d*)\s*kg\s*$/i);
  if (kgOnly) {
    return { type: "weight", payload: { weight_kg: parseFloat(kgOnly[1]) } };
  }
  if (/^\d+\.?\d*\s*$/.test(t) && t.length <= 6) {
    return { type: "weight", payload: { weight_kg: parseFloat(t.trim()) } };
  }

  const calMatch = t.match(/(\d+)\s*(?:cal|calories?|kcal)\b/i);
  if (calMatch) {
    const calories = parseInt(calMatch[1], 10);
    let protein_g: number | undefined;
    const p1 = t.match(/(\d+)\s*(?:g\s*)?(?:protein|prot)\b/i);
    const p2 = t.match(/\b(\d+)\s*p\b(?!\w)/i);
    if (p1) protein_g = parseInt(p1[1], 10);
    else if (p2) protein_g = parseInt(p2[1], 10);
    const meal_label = t
      .replace(/\d+\s*(?:cal|calories?|kcal)\b[^]*$/i, "")
      .replace(/\d+\s*(?:g\s*)?(?:protein|prot)\b[^]*$/i, "")
      .replace(/\b\d+\s*p\b(?!\w)[^]*$/i, "")
      .trim();
    return {
      type: "meal",
      payload: {
        calories,
        protein_g,
        meal_label: meal_label || undefined,
      },
    };
  }

  const workoutHint =
    /hyrox|workout|training|interval|intervals|\brun\b|\blift|jog|session|\bwod\b|erg|bike|swim|\d+\s*x\s*\d|\d+\s*min\b|\d+\s*h\b|in\s+1\s*h/i;
  if (workoutHint.test(t)) {
    const dm = t.match(/(\d+)\s*min\b/i);
    const hm = t.match(/(\d+)\s*h\b/i);
    let duration_min: number | undefined;
    if (dm) duration_min = parseInt(dm[1], 10);
    else if (hm) duration_min = parseInt(hm[1], 10) * 60;
    return {
      type: "workout",
      payload: { workout_summary: t, duration_min },
    };
  }

  return { type: "note", payload: { note_text: t } };
}
