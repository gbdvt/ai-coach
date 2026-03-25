import Link from "next/link";
import type { DailyLog } from "@/types/daily-log";
import { formatInt, formatNumber } from "@/lib/format";

type Props = {
  log: DailyLog;
  /** Highlight row when this is “today” */
  isToday?: boolean;
};

function MacroCell({
  label,
  actual,
  target,
  unit,
}: {
  label: string;
  actual: number | null;
  target: number | null;
  unit: string;
}) {
  const hasPair = target != null && target > 0 && actual != null;
  return (
    <div className="rounded-lg bg-zinc-950/50 py-2 ring-1 ring-zinc-800/60">
      <p className="text-[10px] font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">
        {hasPair ? (
          <>
            {formatInt(actual)}
            <span className="text-zinc-500"> / {formatInt(target)}</span>
            {unit ? <span className="text-xs text-zinc-500">{unit}</span> : null}
          </>
        ) : (
          <>
            {formatInt(actual)}
            {unit ? <span className="text-xs text-zinc-500">{unit}</span> : null}
          </>
        )}
      </p>
    </div>
  );
}

export function LogListCard({ log, isToday }: Props) {
  const training =
    log.training_type?.trim() ||
    (log.training_duration_min != null ? `${log.training_duration_min} min` : null);

  const alcohol = log.alcohol_drinks != null && log.alcohol_drinks > 0;

  return (
    <Link
      href={`/log?date=${log.date}`}
      className={`block rounded-2xl border p-4 transition duration-200 hover:border-emerald-500/35 hover:bg-zinc-900/55 ${
        isToday
          ? "border-cyan-500/35 bg-gradient-to-br from-cyan-500/5 to-zinc-900/40 ring-1 ring-cyan-500/20"
          : "border-zinc-800/80 bg-zinc-900/35"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-zinc-100">
            {log.date}
            {isToday ? (
              <span className="ml-2 rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                Today
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {training ? training : "No training logged"}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {log.binge_flag ? (
            <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300 ring-1 ring-amber-500/25">
              Binge
            </span>
          ) : null}
          {alcohol ? (
            <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-300 ring-1 ring-rose-500/25">
              Alcohol {log.alcohol_drinks}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-950/50 py-2 ring-1 ring-zinc-800/60">
          <p className="text-[10px] font-medium uppercase text-zinc-500">Weight</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">
            {formatNumber(log.morning_weight_kg, { maxFractionDigits: 1 })}
            {log.morning_weight_kg != null ? " kg" : ""}
          </p>
        </div>
        <MacroCell
          label="Calories"
          actual={log.calories_actual}
          target={log.calorie_target}
          unit=""
        />
        <MacroCell
          label="Protein"
          actual={log.protein_actual_g}
          target={log.protein_target_g}
          unit=" g"
        />
        <div className="rounded-lg bg-zinc-950/50 py-2 ring-1 ring-zinc-800/60">
          <p className="text-[10px] font-medium uppercase text-zinc-500">Steps</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">
            {formatInt(log.steps)}
          </p>
        </div>
      </div>
    </Link>
  );
}
