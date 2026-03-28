import { parseQuickLog } from "@/lib/quickLogParser";

export type CoachMessageClassification = "log" | "question" | "goal_update" | "unclear";

function isQuestion(t: string): boolean {
  const s = t.trim();
  if (/\?/.test(s)) return true;
  return /^(what|how|why|when|where|should i|could i|would i|can i|is it|am i|do i|tell me|explain)\b/i.test(
    s,
  );
}

function isGoalUpdate(t: string): boolean {
  return (
    /^(goal|training focus|nutrition focus|phase)\s*:/i.test(t.trim()) ||
    /^set\s+(my\s+)?(goal|focus)\b/i.test(t.trim())
  );
}

const SHORT_ACK = /^(ok|okay|thanks|thank you|cool|nice|got it|yep|yes|no)\.?$/i;

/**
 * Classify inbound coach chat. Logging tries structured parse first; free-text notes can still log.
 */
export function classifyCoachMessage(text: string): CoachMessageClassification {
  const raw = text.trim();
  if (!raw) return "unclear";

  if (isGoalUpdate(raw)) return "goal_update";
  if (isQuestion(raw)) return "question";

  const parsed = parseQuickLog(raw);
  if (parsed.type !== "note") return "log";

  if (SHORT_ACK.test(raw)) return "unclear";

  // Substantive note → store as log event
  if (raw.length >= 8) return "log";

  return "unclear";
}

/** True if this text should create a `log_events` row (including note-type logs). */
export function shouldPersistAsLogEvent(
  text: string,
  classification: CoachMessageClassification,
): boolean {
  if (classification !== "log") return false;
  const parsed = parseQuickLog(text.trim());
  if (parsed.type !== "note") return true;
  return text.trim().length >= 8;
}
