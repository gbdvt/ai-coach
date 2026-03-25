import Link from "next/link";
import { DailyLogForm } from "@/components/log/DailyLogForm";
import { LogDatePicker } from "@/components/quicklog/LogDatePicker";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { fetchTargets } from "@/lib/coachSettings";
import { formatLocalDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";
import type { DailyLog } from "@/types/daily-log";

export const dynamic = "force-dynamic";

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

type SearchParams = { date?: string | string[] };

export default async function AdvancedLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = createClient();
  const sp = await searchParams;
  const raw = sp.date;
  const dateParam = Array.isArray(raw) ? raw[0] : raw;
  const today = formatLocalDate(new Date());
  const selectedDate =
    dateParam && typeof dateParam === "string" && isIsoDate(dateParam) ? dateParam : today;

  const [{ data: row, error }, targets] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", SINGLE_TENANT_USER_ID)
      .eq("date", selectedDate)
      .maybeSingle(),
    fetchTargets(),
  ]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
        Could not load: {error.message}
      </div>
    );
  }

  const initial = row as DailyLog | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Manual edit day</h1>
          <p className="text-sm text-zinc-400">
            Override fields directly. Quick log events still drive most totals when you add new entries
            for this date.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LogDatePicker value={selectedDate} basePath="/log/advanced" />
          <Link
            href={`/log?date=${selectedDate}`}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            ← Quick log
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300">
            Dashboard
          </Link>
        </div>
      </div>

      <DashboardCard title={`${selectedDate === today ? "Today" : selectedDate}`}>
        <DailyLogForm
          key={`${selectedDate}-${initial?.id ?? "new"}`}
          initial={initial}
          selectedDate={selectedDate}
          defaultCalorieTarget={targets.calorieTarget}
          defaultProteinTargetG={targets.proteinTargetG}
        />
      </DashboardCard>
    </div>
  );
}
