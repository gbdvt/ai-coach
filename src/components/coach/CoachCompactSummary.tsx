import { formatInt, formatNumber } from "@/lib/format";
import type { CoachProfile } from "@/lib/coachSettings";
import type { DailyLog } from "@/types/daily-log";

type Props = {
  log: DailyLog | null;
  profile: CoachProfile;
};

export function CoachCompactSummary({ log, profile }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <Cell label="Weight" value={formatNumber(log?.morning_weight_kg, { maxFractionDigits: 1 })} suffix="kg" />
      <Cell
        label="Calories"
        value={formatInt(log?.calories_actual)}
        suffix={log?.calorie_target != null ? `/ ${formatInt(log.calorie_target)}` : `/ ${profile.calorieTarget}`}
      />
      <Cell
        label="Protein"
        value={formatInt(log?.protein_actual_g)}
        suffix={
          log?.protein_target_g != null
            ? ` / ${formatInt(log.protein_target_g)} g`
            : ` / ${profile.proteinTargetG} g`
        }
      />
      <Cell
        label="Training"
        value={log?.training_type?.trim() ? log.training_type.slice(0, 18) + (log.training_type.length > 18 ? "…" : "") : "—"}
        suffix={log?.training_duration_min != null ? `${log.training_duration_min}m` : ""}
      />
      <Cell
        label="Alcohol"
        value={
          log?.alcohol_drinks != null && log.alcohol_drinks > 0 ? String(log.alcohol_drinks) : "—"
        }
        suffix="drinks"
      />
      <Cell
        label="Key targets"
        value={`${formatInt(profile.calorieTarget)} kcal`}
        suffix={`· ${formatInt(profile.proteinTargetG)} g protein`}
      />
    </div>
  );
}

function Cell({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-2 py-2 ring-1 ring-zinc-800/50">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="truncate text-sm font-semibold tabular-nums text-zinc-100">
        {value}
        {suffix ? <span className="font-normal text-zinc-500"> {suffix}</span> : null}
      </p>
    </div>
  );
}
