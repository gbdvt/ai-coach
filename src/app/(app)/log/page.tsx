import Link from "next/link";
import { DailyLogForm } from "@/components/log/DailyLogForm";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { formatLocalDate } from "@/lib/dates";
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

  const { data: row, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .eq("date", selectedDate)
    .maybeSingle();

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
        Could not load this log: {error.message}
      </div>
    );
  }

  const initial = row as DailyLog | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Daily log</h1>
          <p className="text-sm text-zinc-400">
            {selectedDate === today ? "Today" : selectedDate}
            {initial ? " · editing" : " · new entry"}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          ← Dashboard
        </Link>
      </div>

      <DashboardCard>
        <DailyLogForm
          key={`${selectedDate}-${initial?.id ?? "new"}`}
          initial={initial}
          selectedDate={selectedDate}
        />
      </DashboardCard>
    </div>
  );
}
