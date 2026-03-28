import { cache } from "react";
import { buildDailyOpeningMessage } from "@/lib/dailyOpening";
import { loadOpeningContext } from "@/lib/coachSessionContext";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { ChatMessageMeta } from "@/types/chat";

/**
 * Ensures one assistant "daily_opening" row for (user, today).
 * - React `cache()` dedupes concurrent calls within the same request.
 * - DB partial unique index dedupes across parallel HTTP requests (dev prefetch, etc.).
 */
export const ensureDailyCoachOpening = cache(async function ensureDailyCoachOpening(
  today: string,
): Promise<void> {
  const supabase = createClient();

  const { data: existing, error: exErr } = await supabase
    .from("coach_chat_messages")
    .select("id")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .eq("log_date", today)
    .contains("meta", { kind: "daily_opening" })
    .limit(1)
    .maybeSingle();

  if (exErr) return;
  if (existing) return;

  const ctx = await loadOpeningContext(today);
  const content = buildDailyOpeningMessage(ctx);

  const { error: insErr } = await supabase.from("coach_chat_messages").insert({
    user_id: SINGLE_TENANT_USER_ID,
    log_date: today,
    role: "assistant",
    content,
    meta: { kind: "daily_opening" } satisfies ChatMessageMeta,
  });

  // Concurrent insert: unique index wins; treat as success.
  if (insErr?.code === "23505") return;
});
