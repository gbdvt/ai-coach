"use client";

type Props = {
  label: string;
  current: number | null;
  target: number | null;
  unit?: string;
};

export function ProgressBar({ label, current, target, unit = "" }: Props) {
  const c = current ?? 0;
  const t = target ?? 0;
  const pct = t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0;
  const indeterminate = target == null || target <= 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        <span className="text-sm tabular-nums text-zinc-400">
          {current != null ? `${current.toLocaleString()}${unit ? ` ${unit}` : ""}` : "—"}
          {target != null && target > 0
            ? ` / ${target.toLocaleString()}${unit ? ` ${unit}` : ""}`
            : null}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 ${
            indeterminate ? "w-0 opacity-40" : ""
          }`}
          style={{ width: indeterminate ? undefined : `${pct}%` }}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {!indeterminate ? (
        <p className="text-right text-xs text-zinc-500">{pct}% of target</p>
      ) : (
        <p className="text-right text-xs text-zinc-500">Set a target to track</p>
      )}
    </div>
  );
}
