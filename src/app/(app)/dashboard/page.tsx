import Link from "next/link";
import { CaloriesMacroChart } from "@/components/charts/CaloriesMacroChart";
import { ProteinMacroChart } from "@/components/charts/ProteinMacroChart";
import { WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { DayStrip } from "@/components/dashboard/DayStrip";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { TodayProgressShell } from "@/components/dashboard/TodayProgressShell";
import { LogListCard } from "@/components/history/LogListCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { GuidanceEmpty } from "@/components/ui/GuidanceEmpty";
import { StatPill } from "@/components/ui/StatPill";
import {
  buildMacroChartRows,
  buildWeightChartRows,
  compareWeightWeeks,
  logsByDate,
  macroAdherencePercent,
  trainingConsistencyLabel,
  trainingDaysInLast7,
  weightLabelTone,
} from "@/lib/analytics";
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
  const fetchStart = addDays(today, -13);

  const [{ data: todayLog, error: todayErr }, { data: twoWeekRows, error: weekErr }, { data: recentRows }, { data: dateOnlyRows }] =
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
        .gte("date", fetchStart)
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

  const fourteenLogs = (twoWeekRows ?? []) as DailyLog[];
  const byDate = logsByDate(fourteenLogs);
  const recent = (recentRows ?? []) as DailyLog[];
  const logDates = new Set((dateOnlyRows ?? []).map((r) => r.date as string));
  const streak = logStreak(logDates, today);

  const weightWeeks = compareWeightWeeks(byDate, today);
  const kcalAdherence = macroAdherencePercent(byDate, today, "calories");
  const protAdherence = macroAdherencePercent(byDate, today, "protein");
  const trained7 = trainingDaysInLast7(byDate, today);
  const trainLabel = trainingConsistencyLabel(trained7);

  const weightRows = buildWeightChartRows(byDate, weekStart, today, shortWeekday);
  const calorieRows = buildMacroChartRows(byDate, weekStart, today, shortWeekday, "calories");
  const proteinRows = buildMacroChartRows(byDate, weekStart, today, shortWeekday, "protein");

  const stripStart = addDays(today, -13);
  const stripDays = eachDateInRange(stripStart, today).map((iso) => ({
    date: iso,
    label: shortWeekday(iso).slice(0, 1),
    logged: logDates.has(iso),
    isToday: iso === today,
  }));

  const tlog = todayLog as DailyLog | null;
  const hasTodayProgress = Boolean(
    tlog &&
      (tlog.morning_weight_kg != null ||
        tlog.calories_actual != null ||
        tlog.protein_actual_g != null ||
        (tlog.training_type?.trim() ?? "") !== "" ||
        (tlog.training_duration_min ?? 0) > 0),
  );

  const weightInsightValue =
    weightWeeks.currentAvg != null
      ? `${formatNumber(weightWeeks.currentAvg, { maxFractionDigits: 1 })} kg`
      : "—";
  const weightInsightSub =
    weightWeeks.deltaKg != null
      ? `${weightWeeks.deltaKg <= 0 ? "" : "+"}${formatNumber(weightWeeks.deltaKg, { maxFractionDigits: 1 })} kg vs prior week`
      : weightWeeks.currentDaysWithWeight < 2 && weightWeeks.prevDaysWithWeight < 2
        ? "Log at least 2 days in each week to compare."
        : "Your progress will appear here.";

  const kcalInsightValue =
    kcalAdherence.percent != null ? `${kcalAdherence.percent}%` : "—";
  const kcalInsightSub =
    kcalAdherence.percent != null && kcalAdherence.avgActual != null && kcalAdherence.avgTarget != null
      ? `Avg ${Math.round(kcalAdherence.avgActual)} / ${Math.round(kcalAdherence.avgTarget)} kcal (${kcalAdherence.daysCounted}d)`
      : "Log calorie target and actuals to see adherence.";

  const protInsightValue =
    protAdherence.percent != null ? `${protAdherence.percent}%` : "—";
  const protInsightSub =
    protAdherence.percent != null && protAdherence.avgActual != null && protAdherence.avgTarget != null
      ? `Avg ${Math.round(protAdherence.avgActual)} / ${Math.round(protAdherence.avgTarget)} g (${protAdherence.daysCounted}d)`
      : "Log protein target and actuals to see adherence.";

  const weightChartHasData = weightRows.some((r) => r.weight != null);
  const macroPoints = (rows: typeof calorieRows) =>
    rows.filter((r) => r.actual != null || r.target != null).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-zinc-400">Today · {today}</p>
        </div>
        <Link
          href={`/log?date=${today}`}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md shadow-emerald-500/15 transition hover:opacity-95 active:scale-[0.98]"
        >
          {tlog ? "Edit today" : "Log today"}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InsightCard
          title="Weight trend"
          value={weightInsightValue}
          sub={weightInsightSub}
          badge={weightWeeks.label ?? undefined}
          badgeTone={weightLabelTone(weightWeeks.label)}
          animationClass="animate-fade-in"
        />
        <InsightCard
          title="Calorie adherence (7d)"
          value={kcalInsightValue}
          sub={kcalInsightSub}
          animationClass="animate-fade-in-delay"
        />
        <InsightCard
          title="Protein adherence (7d)"
          value={protInsightValue}
          sub={protInsightSub}
          animationClass="animate-fade-in"
        />
        <InsightCard
          title="Training (7d)"
          value={`${trained7} / 7 days`}
          sub="Sessions logged this week"
          badge={trainLabel}
          badgeTone={trainLabel === "consistent" ? "positive" : "warn"}
          animationClass="animate-fade-in-delay"
        />
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

      <TodayProgressShell isToday hasAnyProgress={hasTodayProgress}>
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
      </TodayProgressShell>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard title="Morning weight">
          <p className="text-3xl font-bold tabular-nums text-white">
            {formatNumber(tlog?.morning_weight_kg ?? null, { maxFractionDigits: 1 })}
            {tlog?.morning_weight_kg != null ? <span className="text-lg text-zinc-500"> kg</span> : null}
          </p>
          {!tlog?.morning_weight_kg ? (
            <p className="mt-2 text-sm text-zinc-500">Not logged yet — add it on the log page.</p>
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

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardCard title="Weight (7d)">
          {weightChartHasData ? (
            <WeightTrendChart data={weightRows} />
          ) : (
            <GuidanceEmpty
              lines={[
                "Log at least 2 days to see trends.",
                "Your progress will appear here.",
              ]}
            />
          )}
        </DashboardCard>
        <DashboardCard title="Calories (7d)">
          {macroPoints(calorieRows) >= 1 ? (
            <CaloriesMacroChart data={calorieRows} allowSparse />
          ) : (
            <GuidanceEmpty
              lines={[
                "Log targets and actual calories across the week.",
                "Charts stay clean and easy to read on mobile.",
              ]}
            />
          )}
        </DashboardCard>
        <DashboardCard title="Protein (7d)">
          {macroPoints(proteinRows) >= 1 ? (
            <ProteinMacroChart data={proteinRows} allowSparse />
          ) : (
            <GuidanceEmpty
              lines={[
                "Log protein targets and actuals to see bars vs line.",
                "Small daily entries add up fast.",
              ]}
            />
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
          <GuidanceEmpty
            title="No entries yet"
            lines={["Start with today — your dashboard will light up.", "Log at least 2 days to see trends."]}
          />
        ) : (
          <ul className="space-y-3">
            {recent.map((log) => (
              <li key={log.id}>
                <LogListCard log={log} isToday={log.date === today} />
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
