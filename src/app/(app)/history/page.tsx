import Link from "next/link";
import { LogListCard } from "@/components/history/LogListCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { StatPill } from "@/components/ui/StatPill";
import { addDays, formatLocalDate } from "@/lib/dates";
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

type Range = "7" | "30" | "all";

type SearchParams = { range?: string | string[] };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = createClient();
  const sp = await searchParams;
  const raw = sp.range;
  const r = Array.isArray(raw) ? raw[0] : raw;
  const range: Range = r === "30" || r === "all" ? r : "7";
  const today = formatLocalDate(new Date());

  let query = supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .order("date", { ascending: false });

  if (range === "7") {
    query = query.gte("date", addDays(today, -6));
  } else if (range === "30") {
    query = query.gte("date", addDays(today, -29));
  }

  const { data: rows, error } = await query;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
        Could not load history: {error.message}
      </div>
    );
  }

  const logs = (rows ?? []) as DailyLog[];

  const aw = averageWeight(logs);
  const ac = averageCalories(logs);
  const ap = averageProtein(logs);
  const td = trainingDaysCount(logs);

  const tabs: { id: Range; label: string }[] = [
    { id: "7", label: "7 days" },
    { id: "30", label: "30 days" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">History</h1>
          <p className="text-sm text-zinc-400">Review and edit past logs</p>
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
            href={t.id === "7" ? "/history" : `/history?range=${t.id}`}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
              range === t.id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DashboardCard title="Summary">
        {logs.length === 0 ? (
          <p className="text-sm text-zinc-500">No logs in this range yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill
              label="Avg weight"
              value={
                aw != null
                  ? `${formatNumber(aw, { maxFractionDigits: 1 })} kg`
                  : "—"
              }
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
            <p className="text-center text-sm text-zinc-500">
              Start logging from the dashboard to build your history.
            </p>
          </DashboardCard>
        ) : (
          logs.map((log) => <LogListCard key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}
