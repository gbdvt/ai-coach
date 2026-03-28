"use server";

import { revalidatePath } from "next/cache";
import { coachLlmAnswer } from "@/lib/coachLlm";
import {
  buildGoalUpdateReply,
  buildQuestionFallbackReply,
  buildRuleReplyAfterLog,
  buildUnclearReply,
} from "@/lib/coachReplyRules";
import { fetchCoachProfile } from "@/lib/coachSettings";
import { buildCoachLlmContext, loadRuleReplyContext } from "@/lib/coachSessionContext";
import { parseGoalUpdateLine } from "@/lib/goalUpdateParse";
import {
  classifyCoachMessage,
  shouldPersistAsLogEvent,
} from "@/lib/messageClassifier";
import { parseQuickLog } from "@/lib/quickLogParser";
import { syncDailyLogForDate } from "@/app/(app)/log/eventActions";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import { formatLocalDate } from "@/lib/dates";
import type { ChatMessageMeta } from "@/types/chat";

export type SendCoachMessageResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendCoachMessage(text: string): Promise<SendCoachMessageResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Empty message." };

  const today = formatLocalDate(new Date());
  const supabase = createClient();
  const classification = classifyCoachMessage(trimmed);

  const { error: uErr } = await supabase.from("coach_chat_messages").insert({
    user_id: SINGLE_TENANT_USER_ID,
    log_date: today,
    role: "user",
    content: trimmed,
    meta: {
      kind: "user",
      classification,
    } satisfies ChatMessageMeta,
  });

  if (uErr) return { ok: false, error: uErr.message };

  let assistantContent = "";
  const meta: ChatMessageMeta = {
    kind: "coach_reply",
    classification,
    used_llm: false,
    chips: [],
  };

  if (classification === "goal_update") {
    const patch = parseGoalUpdateLine(trimmed);
    if (patch) {
      const profileRow = await fetchCoachProfile();
      const { error: gErr } = await supabase.from("coach_settings").upsert(
        {
          user_id: SINGLE_TENANT_USER_ID,
          default_calorie_target: profileRow.calorieTarget,
          default_protein_target_g: profileRow.proteinTargetG,
          display_name: profileRow.displayName,
          training_focus: profileRow.trainingFocus,
          nutrition_focus: profileRow.nutritionFocus,
          phase_note: profileRow.phaseNote,
          ...patch,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (gErr) {
        assistantContent = `Couldn’t save that: ${gErr.message}`;
      } else {
        const r = buildGoalUpdateReply();
        assistantContent = r.text;
        meta.chips = r.chips;
      }
    } else {
      assistantContent =
        'Use a clear line like `training focus: Hyrox intervals Tue/Thu` or `nutrition focus: protein at breakfast`.';
    }
  } else if (classification === "log" && shouldPersistAsLogEvent(trimmed, classification)) {
    const parsed = parseQuickLog(trimmed);
    const { error: evErr } = await supabase.from("log_events").insert({
      user_id: SINGLE_TENANT_USER_ID,
      log_date: today,
      event_type: parsed.type,
      raw_text: trimmed,
      payload: parsed.payload,
    });

    if (evErr) {
      assistantContent = `Log didn’t save: ${evErr.message}. Check that log_events exists (run latest schema.sql).`;
    } else {
      const syncRes = await syncDailyLogForDate(today);
      if (!syncRes.ok) {
        assistantContent = `Logged, but day summary sync failed: ${syncRes.error}`;
      } else {
        const ctx = await loadRuleReplyContext(today);
        const r = buildRuleReplyAfterLog(parsed, trimmed, ctx);
        assistantContent = r.text;
        meta.chips = r.chips;
        meta.event_type = parsed.type;
      }
    }
  } else if (classification === "question") {
    const profile = await fetchCoachProfile();
    const llmCtx = await buildCoachLlmContext(today, profile);
    const ans = await coachLlmAnswer(trimmed, llmCtx);
    meta.used_llm = Boolean(ans);
    assistantContent = ans ?? buildQuestionFallbackReply().text;
  } else {
    const r = buildUnclearReply();
    assistantContent = r.text;
  }

  const { error: aErr } = await supabase.from("coach_chat_messages").insert({
    user_id: SINGLE_TENANT_USER_ID,
    log_date: today,
    role: "assistant",
    content: assistantContent,
    meta,
  });

  if (aErr) return { ok: false, error: aErr.message };

  revalidatePath("/coach");
  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/history");
  return { ok: true };
}
