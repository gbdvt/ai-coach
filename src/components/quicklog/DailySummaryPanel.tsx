import type { DailyLog } from "@/types/daily-log";
import { formatInt, formatNumber } from "@/lib/format";

type Props = {
  log: DailyLog | null;
  targetsLabel: string;
};

export function DailySummaryPanel({ log, targetsLabel }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/35 p-4 ring-1 ring-zinc-800/50">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Day summary
        </h2>
        <p className="text-[10px] text-zinc-600">{targetsLabel}</p>
      </div>
      <p className="mb-3 text-[11px] text-zinc-600">
        Totals are built from your quick log (and stay in sync with History charts).
      </p>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-950/60 px-3 py-2 ring-1 ring-zinc-800/70">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Calories</dt>
          <dd className="text-base font-semibold tabular-nums text-zinc-100">
            {formatInt(log?.calories_actual)}
            {log?.calorie_target != null ? (
              <span className="text-sm font-normal text-zinc-500">
                {" "}
                / {formatInt(log.calorie_target)}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-950/60 px-3 py-2 ring-1 ring-zinc-800/70">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Protein</dt>
          <dd className="text-base font-semibold tabular-nums text-zinc-100">
            {log?.protein_actual_g != null ? (
              <>
                {formatInt(log.protein_actual_g)}
                {log?.protein_target_g != null ? (
                  <span className="text-sm font-normal text-zinc-500">
                    {" "}
                    / {formatInt(log.protein_target_g)} g
                  </span>
                ) : (
                  <span className="text-sm font-normal text-zinc-500"> g</span>
                )}
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-950/60 px-3 py-2 ring-1 ring-zinc-800/70">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Weight</dt>
          <dd className="text-base font-semibold tabular-nums text-zinc-100">
            {formatNumber(log?.morning_weight_kg, { maxFractionDigits: 1 })}
            {log?.morning_weight_kg != null ? " kg" : ""}
          </dd>
        </div>
        <div className="col-span-2 rounded-xl bg-zinc-950/60 px-3 py-2 ring-1 ring-zinc-800/70 sm:col-span-2">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Training</dt>
          <dd className="text-sm text-zinc-200">
            {log?.training_type?.trim() || log?.training_notes?.trim() ? (
              <>
                {log.training_type?.trim() ? (
                  <span className="font-medium">{log.training_type}</span>
                ) : null}
                {log.training_duration_min != null ? (
                  <span className="text-zinc-500"> · {log.training_duration_min} min</span>
                ) : null}
                {log.training_notes?.trim() ? (
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{log.training_notes}</p>
                ) : null}
              </>
            ) : (
              <span className="text-zinc-500">—</span>
            )}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-950/60 px-3 py-2 ring-1 ring-zinc-800/70">
          <dt className="text-[10px] font-medium uppercase text-zinc-500">Alcohol</dt>
          <dd className="text-base font-semibold tabular-nums text-zinc-100">
            {log?.alcohol_drinks != null && log.alcohol_drinks > 0
              ? `${log.alcohol_drinks} drink${log.alcohol_drinks === 1 ? "" : "s"}`
              : "—"}
          </dd>
        </div>
        {(log?.binge_flag || (log?.notes?.trim() ?? "").length > 0) && (
          <div className="col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 sm:col-span-3">
            {log?.binge_flag ? (
              <p className="text-xs font-semibold text-amber-200">Binge / off-plan flagged</p>
            ) : null}
            {log?.notes?.trim() ? (
              <p className="mt-1 text-xs text-zinc-400">{log.notes}</p>
            ) : null}
          </div>
        )}
      </dl>
    </div>
  );
}
