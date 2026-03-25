"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { upsertDailyLog } from "@/app/(app)/log/actions";
import type { DailyLog } from "@/types/daily-log";

type Props = {
  initial: DailyLog | null;
  selectedDate: string;
  /** Shown read-only; saved targets come from Settings via server action */
  defaultCalorieTarget: number;
  defaultProteinTargetG: number;
};

function numOrNull(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function intOrNull(s: string): number | null {
  const n = numOrNull(s);
  if (n === null) return null;
  return Math.round(n);
}

export function DailyLogForm({
  initial,
  selectedDate,
  defaultCalorieTarget,
  defaultProteinTargetG,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const defaults = useMemo(
    () => ({
      morning_weight_kg: initial?.morning_weight_kg?.toString() ?? "",
      calories_actual: initial?.calories_actual?.toString() ?? "",
      protein_actual_g: initial?.protein_actual_g?.toString() ?? "",
      training_type: initial?.training_type ?? "",
      training_duration_min: initial?.training_duration_min?.toString() ?? "",
      training_notes: initial?.training_notes ?? "",
      steps: initial?.steps?.toString() ?? "",
      alcohol_drinks: initial?.alcohol_drinks?.toString() ?? "",
      binge_flag: initial?.binge_flag ?? false,
      notes: initial?.notes ?? "",
    }),
    [initial],
  );

  const [form, setForm] = useState(defaults);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await upsertDailyLog({
        date: selectedDate,
        morning_weight_kg: numOrNull(form.morning_weight_kg),
        calories_actual: intOrNull(form.calories_actual),
        protein_actual_g: intOrNull(form.protein_actual_g),
        training_type: form.training_type.trim() || null,
        training_duration_min: intOrNull(form.training_duration_min),
        training_notes: form.training_notes.trim() || null,
        steps: intOrNull(form.steps),
        alcohol_drinks: intOrNull(form.alcohol_drinks),
        binge_flag: form.binge_flag,
        notes: form.notes.trim() || null,
      });

      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Day saved ✅");
      router.refresh();
    });
  }

  const field =
    "w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-400">
        <span className="font-medium text-zinc-300">Macro targets</span> come from{" "}
        <Link href="/settings" className="text-emerald-400 hover:underline">
          Settings
        </Link>
        : {defaultCalorieTarget} kcal · {defaultProteinTargetG} g protein (applied on save).
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">Date</span>
          <input type="date" className={field} value={selectedDate} readOnly aria-readonly />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">Morning weight (kg)</span>
          <input
            inputMode="decimal"
            className={field}
            placeholder="e.g. 78.4"
            value={form.morning_weight_kg}
            onChange={(e) => update("morning_weight_kg", e.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">Steps</span>
          <input
            inputMode="numeric"
            className={field}
            placeholder="e.g. 10000"
            value={form.steps}
            onChange={(e) => update("steps", e.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">Calories (actual)</span>
          <input
            inputMode="numeric"
            className={field}
            value={form.calories_actual}
            onChange={(e) => update("calories_actual", e.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">Protein actual (g)</span>
          <input
            inputMode="numeric"
            className={field}
            value={form.protein_actual_g}
            onChange={(e) => update("protein_actual_g", e.target.value)}
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-zinc-400">Training type</span>
          <input
            className={field}
            placeholder="Hyrox, run, lift…"
            value={form.training_type}
            onChange={(e) => update("training_type", e.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">Training duration (min)</span>
          <input
            inputMode="numeric"
            className={field}
            value={form.training_duration_min}
            onChange={(e) => update("training_duration_min", e.target.value)}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-zinc-400">Alcohol (drinks)</span>
          <input
            inputMode="numeric"
            className={field}
            value={form.alcohol_drinks}
            onChange={(e) => update("alcohol_drinks", e.target.value)}
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-zinc-400">Training notes</span>
          <textarea
            rows={2}
            className={`${field} min-h-[4rem] resize-y`}
            value={form.training_notes}
            onChange={(e) => update("training_notes", e.target.value)}
          />
        </label>

        <label className="flex items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            className="size-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/30"
            checked={form.binge_flag}
            onChange={(e) => update("binge_flag", e.target.checked)}
          />
          <span className="text-sm text-zinc-300">Binge / off-plan day</span>
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-zinc-400">Notes</span>
          <textarea
            rows={3}
            className={`${field} min-h-[5rem] resize-y`}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/10 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save manual overrides"}
      </button>
    </form>
  );
}
