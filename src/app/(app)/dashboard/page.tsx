import Link from "next/link";
import { CaloriesTrendChart } from "@/components/charts/CaloriesTrendChart";
import { WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { DayStrip } from "@/components/dashboard/DayStrip";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { LogListCard } from "@/components/history/LogListCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { StatPill } from "@/components/ui/StatPill";
import { addDays, eachDateInRange, formatLocalDate } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { logStreak } from "@/lib/stats";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { DailyLog } from "@/types/daily-log";

export const dynamic = "force-dynamic";

function shortWeekday(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: "short" });
}

export default async function DashboardPage() {
  const supabase = createClient();
  const today = formatLocalDate(new Date());
  const weekStart = addDays(today, -6);

  const [{ data: todayLog, error: todayErr }, { data: weekRows, error: weekErr }, { data: recentRows }, { data: dateOnlyRows }] =
    await Promise.all([
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .eq("date", today)
        .maybeSingle(),
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .gte("date", weekStart)
        .lte("date", today)
        .order("date", { ascending: true }),
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .order("date", { ascending: false })
        .limit(5),
      supabase
        .from("daily_logs")
        .select("date")
        .eq("user_id", SINGLE_TENANT_USER_ID)
        .order("date", { ascending: false })
        .limit(400),
    ]);

  if (todayErr || weekErr) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
        Could not load logs. Check your Supabase table and environment variables.
      </div>
    );
  }

  const weekLogs = (weekRows ?? []) as DailyLog[];
  const recent = (recentRows ?? []) as DailyLog[];
  const logDates = new Set((dateOnlyRows ?? []).map((r) => r.date as string));
  const streak = logStreak(logDates, today);

  const weightChartData = weekLogs
    .filter((l) => l.morning_weight_kg != null)
    .map((l) => ({
      date: l.date,
      label: shortWeekday(l.date),
      weight: Number(l.morning_weight_kg),
    }));

  const calorieChartData = weekLogs
    .filter((l) => l.calories_actual != null)
    .map((l) => ({
      date: l.date,
      label: shortWeekday(l.date),
      calories: l.calories_actual as number,
    }));

  const stripStart = addDays(today, -13);
  const stripDays = eachDateInRange(stripStart, today).map((iso) => ({
    date: iso,
    label: shortWeekday(iso).slice(0, 1),
    logged: logDates.has(iso),
  }));

  const tlog = todayLog as DailyLog | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-zinc-400">Today · {today}</p>
        </div>
        <Link
          href={`/log?date=${today}`}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md shadow-emerald-500/15"
        >
          {tlog ? "Edit today" : "Log today"}
        </Link>
      </div>

      <DashboardCard title="Streak & consistency">
        <div className="flex flex-wrap items-center gap-3">
          <StatPill
            label="Current streak"
            value={`${streak}d`}
            hint="Consecutive days with a log"
          />
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Last 14 days
            </p>
            <DayStrip days={stripDays} />
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Today · calories">
          <ProgressBar
            label="Calories"
            current={tlog?.calories_actual ?? null}
            target={tlog?.calorie_target ?? null}
          />
        </DashboardCard>
        <DashboardCard title="Today · protein">
          <ProgressBar
            label="Protein"
            current={tlog?.protein_actual_g ?? null}
            target={tlog?.protein_target_g ?? null}
            unit="g"
          />
        </DashboardCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard title="Morning weight">
          <p className="text-3xl font-bold tabular-nums text-white">
            {formatNumber(tlog?.morning_weight_kg ?? null, { maxFractionDigits: 1 })}
            {tlog?.morning_weight_kg != null ? <span className="text-lg text-zinc-500"> kg</span> : null}
          </p>
          {!tlog?.morning_weight_kg ? (
            <p className="mt-2 text-sm text-zinc-500">Not logged yet.</p>
          ) : null}
        </DashboardCard>
        <DashboardCard title="Training">
          {tlog?.training_type?.trim() || (tlog?.training_duration_min ?? 0) > 0 ? (
            <>
              <p className="text-lg font-semibold text-white">
                {tlog?.training_type?.trim() || "Session"}
              </p>
              {tlog?.training_duration_min != null ? (
                <p className="mt-1 text-sm text-zinc-400">
                  {tlog.training_duration_min} minutes
                </p>
              ) : null}
              {tlog?.training_notes ? (
                <p className="mt-2 line-clamp-3 text-sm text-zinc-500">{tlog.training_notes}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-zinc-500">No training logged for today.</p>
          )}
        </DashboardCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="7-day weight">
          {weightChartData.length >= 2 ? (
            <WeightTrendChart data={weightChartData} />
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">
              Log weight on at least two days this week to see the trend.
            </p>
          )}
        </DashboardCard>
        <DashboardCard title="7-day calories">
          {calorieChartData.length >= 2 ? (
            <CaloriesTrendChart data={calorieChartData} />
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">
              Log calories on at least two days this week to see the chart.
            </p>
          )}
        </DashboardCard>
      </div>

      <DashboardCard
        title="Recent logs"
        action={
          <Link href="/history" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">No logs yet. Start with today.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((log) => (
              <li key={log.id}>
                <LogListCard log={log} />
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      {weekLogs.length < 3 ? (
        <p className="text-center text-xs text-zinc-600">
          Tip: logging most days this week makes trends much more useful.
        </p>
      ) : null}
    </div>
  );
}
