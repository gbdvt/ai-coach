import Link from "next/link";
import { CoachClient } from "@/components/coach/CoachClient";
import { CoachCompactSummary } from "@/components/coach/CoachCompactSummary";
import { CoachPreviewCard } from "@/components/coach/CoachPreviewCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { ensureDailyCoachOpening } from "@/lib/coachChatSeed";
import { fetchCoachProfile } from "@/lib/coachSettings";
import { formatLocalDate } from "@/lib/dates";
import { toChatMessageRow } from "@/lib/mapChatMessage";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { DailyLog } from "@/types/daily-log";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const today = formatLocalDate(new Date());
  const supabase = createClient();

  const [, logResult, profile] = await Promise.all([
    ensureDailyCoachOpening(today).catch(() => undefined),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", SINGLE_TENANT_USER_ID)
      .eq("date", today)
      .maybeSingle(),
    fetchCoachProfile(),
  ]);

  const dailyLog = (logResult.data ?? null) as DailyLog | null;

  const { data: msgs, error: msgErr } = await supabase
    .from("coach_chat_messages")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .eq("log_date", today)
    .order("created_at", { ascending: true });

  const messages = (msgs ?? []).map(toChatMessageRow);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const lastChips = lastAssistant?.meta?.chips ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Today</h1>
          <p className="text-sm text-zinc-400">Coach thread · log and ask in one place</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
          >
            Trends
          </Link>
          <Link
            href={`/log?date=${today}`}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
          >
            Event list
          </Link>
        </div>
      </div>

      {msgErr ? (
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/25 p-4 text-sm text-amber-100">
          Coach chat needs <code className="rounded bg-black/30 px-1">coach_chat_messages</code>. Run the
          latest <code className="rounded bg-black/30 px-1">supabase/schema.sql</code>.
          <p className="mt-2 text-xs opacity-80">{msgErr.message}</p>
        </div>
      ) : null}

      <CoachPreviewCard profile={profile} todayLog={dailyLog} today={today} />

      <DashboardCard title="Today · live summary">
        <CoachCompactSummary log={dailyLog} profile={profile} />
      </DashboardCard>

      <DashboardCard title="Conversation">
        <CoachClient
          messages={messages}
          today={today}
          profile={profile}
          lastChips={lastChips}
        />
      </DashboardCard>

      <div className="flex justify-center border-t border-zinc-800/80 pt-4">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-emerald-400">
          Full dashboard & charts →
        </Link>
      </div>
    </div>
  );
}
