import Link from "next/link";
import type { DailyLog } from "@/types/daily-log";
import { formatInt, formatNumber } from "@/lib/format";

type Props = {
  log: DailyLog;
};

export function LogListCard({ log }: Props) {
  const training =
    log.training_type?.trim() ||
    (log.training_duration_min != null ? `${log.training_duration_min} min` : null);

  return (
    <Link
      href={`/log?date=${log.date}`}
      className="block rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-4 transition hover:border-emerald-500/30 hover:bg-zinc-900/55"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{log.date}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {training ? `Training · ${training}` : "No training logged"}
          </p>
        </div>
        {log.binge_flag ? (
          <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
            Off plan
          </span>
        ) : null}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-950/50 py-2 ring-1 ring-zinc-800/60">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Wt</dt>
          <dd className="text-sm font-semibold tabular-nums text-zinc-100">
            {formatNumber(log.morning_weight_kg, { maxFractionDigits: 1 })}
            {log.morning_weight_kg != null ? " kg" : ""}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-950/50 py-2 ring-1 ring-zinc-800/60">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Kcal</dt>
          <dd className="text-sm font-semibold tabular-nums text-zinc-100">
            {formatInt(log.calories_actual)}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-950/50 py-2 ring-1 ring-zinc-800/60">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Pro</dt>
          <dd className="text-sm font-semibold tabular-nums text-zinc-100">
            {formatInt(log.protein_actual_g)} g
          </dd>
        </div>
        <div className="col-span-3 rounded-lg bg-zinc-950/50 py-2 ring-1 ring-zinc-800/60 sm:col-span-1">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Steps</dt>
          <dd className="text-sm font-semibold tabular-nums text-zinc-100">
            {formatInt(log.steps)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
