import Link from "next/link";
import { DailySummaryPanel } from "@/components/quicklog/DailySummaryPanel";
import { EventFeed } from "@/components/quicklog/EventFeed";
import { LogDatePicker } from "@/components/quicklog/LogDatePicker";
import { QuickLogInput } from "@/components/quicklog/QuickLogInput";
import { formatLocalDate } from "@/lib/dates";
import type { DailyLog } from "@/types/daily-log";
import type { LogEventRow } from "@/types/log-event";

type Props = {
  logDate: string;
  events: LogEventRow[];
  dailyLog: DailyLog | null;
  calorieTarget: number;
  proteinTargetG: number;
  /** Full log page vs embedded dashboard strip */
  variant?: "page" | "dashboard";
};

export function LogDayPanel({
  logDate,
  events,
  dailyLog,
  calorieTarget,
  proteinTargetG,
  variant = "page",
}: Props) {
  const today = formatLocalDate(new Date());
  const targetsLabel = `Targets: ${calorieTarget} kcal · ${proteinTargetG} g protein`;
  const isToday = logDate === today;

  return (
    <div className="space-y-5">
      {variant === "page" ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Log</h1>
            <p className="text-sm text-zinc-400">
              {isToday ? "Today" : logDate} · quick capture first
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LogDatePicker value={logDate} />
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          {isToday
            ? "Type what happened — totals and charts update automatically."
            : `Viewing ${logDate}. Change day on the full log page.`}
        </p>
      )}

      <QuickLogInput logDate={logDate} />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {isToday ? "Today’s entries" : "Entries"}
        </h3>
        <EventFeed logDate={logDate} events={events} isToday={isToday} />
      </div>

      <DailySummaryPanel log={dailyLog} targetsLabel={targetsLabel} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-4">
        <Link
          href="/settings"
          className="text-xs text-zinc-600 hover:text-zinc-400"
        >
          Targets &amp; settings
        </Link>
        <Link
          href={`/log/advanced?date=${logDate}`}
          className="text-sm font-medium text-emerald-400/90 hover:text-emerald-300"
        >
          Manual edit day →
        </Link>
      </div>
    </div>
  );
}
