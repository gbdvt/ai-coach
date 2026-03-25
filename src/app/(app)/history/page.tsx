import Link from "next/link";
import { HistoryCalendarStrip } from "@/components/history/HistoryCalendarStrip";
import { LogListCard } from "@/components/history/LogListCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { GuidanceEmpty } from "@/components/ui/GuidanceEmpty";
import { StatPill } from "@/components/ui/StatPill";
import {
  dayCalorieAdherence,
  logsByDate,
  weightChangeSplitPeriod,
} from "@/lib/analytics";
import { addDays, eachDateInRange, formatLocalDate } from "@/lib/dates";
import { formatInt, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import {
  averageCalories,
  averageProtein,
  averageWeight,
  trainingDaysCount,
} from "@/lib/stats";
import type { DailyLog } from "@/types/daily-log";

export const dynamic = "force-dynamic";

type Range = "7" | "14" | "30" | "all";

type SearchParams = { range?: string | string[] };

function parseRange(raw: string | undefined): Range {
  if (raw === "14" || raw === "30" || raw === "all") return raw;
  return "7";
}

function cutoffForRange(range: Range, today: string): string | null {
  if (range === "7") return addDays(today, -6);
  if (range === "14") return addDays(today, -13);
  if (range === "30") return addDays(today, -29);
  return null;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = createClient();
  const sp = await searchParams;
  const raw = sp.range;
  const r = Array.isArray(raw) ? raw[0] : raw;
  const range = parseRange(r);
  const today = formatLocalDate(new Date());
  const thirtyStart = addDays(today, -29);

  const { data: monthRows, error: monthErr } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .gte("date", thirtyStart)
    .lte("date", today)
    .order("date", { ascending: true });

  if (monthErr) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
        Could not load history: {monthErr.message}
      </div>
    );
  }

  let allLogs: DailyLog[] = [];
  if (range === "all") {
    const { data: full, error: fullErr } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", SINGLE_TENANT_USER_ID)
      .order("date", { ascending: false });

    if (fullErr) {
      return (
        <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
          Could not load full history: {fullErr.message}
        </div>
      );
    }
    allLogs = (full ?? []) as DailyLog[];
  }

  const monthLogs = (monthRows ?? []) as DailyLog[];
  const stripByDate = logsByDate(monthLogs);

  const cutoff = cutoffForRange(range, today);
  let logs: DailyLog[];
  if (range === "all") {
    logs = allLogs;
  } else {
    logs = monthLogs.filter((l) => cutoff && l.date >= cutoff);
  }

  logs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  const aw = averageWeight(logs);
  const ac = averageCalories(logs);
  const ap = averageProtein(logs);
  const td = trainingDaysCount(logs);
  const weightTrend = weightChangeSplitPeriod(logs);

  const stripDays = eachDateInRange(thirtyStart, today).map((iso) => {
    const log = stripByDate.get(iso);
    return {
      date: iso,
      logged: !!log,
      adherence: dayCalorieAdherence(log),
    };
  });

  const tabs: { id: Range; label: string; href: string }[] = [
    { id: "7", label: "7d", href: "/history" },
    { id: "14", label: "14d", href: "/history?range=14" },
    { id: "30", label: "30d", href: "/history?range=30" },
    { id: "all", label: "All", href: "/history?range=all" },
  ];

  const weightDeltaStr =
    weightTrend.deltaKg != null
      ? `${weightTrend.deltaKg > 0 ? "+" : ""}${formatNumber(weightTrend.deltaKg, { maxFractionDigits: 1 })} kg`
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">History</h1>
          <p className="text-sm text-zinc-400">Trends, calendar, and edits</p>
        </div>
        <Link
          href={`/log?date=${today}`}
          className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
        >
          Log today
        </Link>
      </div>

      <div className="flex gap-1 rounded-xl bg-zinc-950/80 p-1 ring-1 ring-zinc-800">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition sm:text-sm ${
              range === t.id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DashboardCard title="Last 30 days">
        <p className="mb-2 text-xs text-zinc-500">
          Squares: darker = lower calorie adherence vs target. Outline = today.
        </p>
        <HistoryCalendarStrip days={stripDays} today={today} />
      </DashboardCard>

      <DashboardCard title="Trend summary">
        {logs.length === 0 ? (
          <GuidanceEmpty
            lines={[
              "No logs in this range yet.",
              "Your progress will appear here once you log.",
            ]}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            <StatPill
              label="Avg weight"
              value={
                aw != null
                  ? `${formatNumber(aw, { maxFractionDigits: 1 })} kg`
                  : "—"
              }
            />
            <StatPill
              label="Weight shift"
              value={weightDeltaStr}
              hint="Later half vs earlier (period)"
            />
            <StatPill
              label="Avg calories"
              value={ac != null ? formatInt(ac) : "—"}
            />
            <StatPill
              label="Avg protein"
              value={ap != null ? `${formatInt(ap)} g` : "—"}
            />
            <StatPill label="Training days" value={String(td)} />
          </div>
        )}
      </DashboardCard>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <DashboardCard>
            <GuidanceEmpty
              lines={[
                "Log at least 2 days to see trends on the dashboard.",
                "Pick a day on the calendar above to add an entry.",
              ]}
            />
          </DashboardCard>
        ) : (
          logs.map((log) => (
            <LogListCard key={log.id} log={log} isToday={log.date === today} />
          ))
        )}
      </div>
    </div>
  );
}
