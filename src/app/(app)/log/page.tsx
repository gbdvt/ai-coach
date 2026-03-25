import Link from "next/link";
import { LogDayPanel } from "@/components/quicklog/LogDayPanel";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { fetchTargets } from "@/lib/coachSettings";
import { formatLocalDate } from "@/lib/dates";
import { toLogEventRow } from "@/lib/mapLogEvent";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { DailyLog } from "@/types/daily-log";

export const dynamic = "force-dynamic";

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

type SearchParams = { date?: string | string[] };

export default async function LogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = createClient();
  const sp = await searchParams;
  const raw = sp.date;
  const dateParam = Array.isArray(raw) ? raw[0] : raw;
  const today = formatLocalDate(new Date());
  const selectedDate =
    dateParam && typeof dateParam === "string" && isIsoDate(dateParam) ? dateParam : today;

  const [{ data: row, error: logErr }, { data: rawEvents, error: evErr }, targets] =
    await Promise.all([
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .eq("date", selectedDate)
        .maybeSingle(),
      supabase
        .from("log_events")
        .select("*")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .eq("log_date", selectedDate)
        .order("created_at", { ascending: true }),
      fetchTargets(),
    ]);

  if (logErr) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
        Could not load day summary: {logErr.message}
      </div>
    );
  }

  if (evErr) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-100">
          <p className="font-medium">Quick log needs the new database tables.</p>
          <p className="mt-2 text-amber-200/90">
            Run the latest <code className="rounded bg-black/30 px-1">supabase/schema.sql</code> in the
            SQL Editor (tables <code className="rounded bg-black/30 px-1">log_events</code> and{" "}
            <code className="rounded bg-black/30 px-1">coach_settings</code>).
          </p>
          <p className="mt-2 text-xs text-amber-200/70">{evErr.message}</p>
        </div>
        <Link
          href={`/log/advanced?date=${selectedDate}`}
          className="text-sm text-emerald-400 hover:underline"
        >
          Open manual edit →
        </Link>
      </div>
    );
  }

  const events = (rawEvents ?? []).map(toLogEventRow);
  const dailyLog = row as DailyLog | null;

  return (
    <DashboardCard>
      <LogDayPanel
        variant="page"
        logDate={selectedDate}
        events={events}
        dailyLog={dailyLog}
        calorieTarget={targets.calorieTarget}
        proteinTargetG={targets.proteinTargetG}
      />
    </DashboardCard>
  );
}
