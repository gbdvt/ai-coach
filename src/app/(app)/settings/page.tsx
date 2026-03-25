import { saveCoachSettings } from "@/app/(app)/settings/actions";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { DEFAULT_CALORIE_TARGET, DEFAULT_PROTEIN_TARGET_G } from "@/lib/defaults";
import { createClient } from "@/lib/supabase/server";
import { SINGLE_TENANT_USER_ID } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("coach_settings")
    .select("default_calorie_target, default_protein_target_g")
    .eq("user_id", SINGLE_TENANT_USER_ID)
    .maybeSingle();

  const c = data?.default_calorie_target ?? DEFAULT_CALORIE_TARGET;
  const p = data?.default_protein_target_g ?? DEFAULT_PROTEIN_TARGET_G;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-zinc-400">
          Default macro targets apply to every day (dashboard adherence, charts, and manual saves).
        </p>
      </div>

      <DashboardCard title="Macro targets">
        <form action={saveCoachSettings} className="max-w-md space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">Default calorie target</span>
            <input
              name="default_calorie_target"
              type="number"
              required
              min={500}
              max={20000}
              defaultValue={c}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/25"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">Default protein target (g)</span>
            <input
              name="default_protein_target_g"
              type="number"
              required
              min={20}
              max={500}
              defaultValue={p}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/25"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950"
          >
            Save targets
          </button>
        </form>
      </DashboardCard>
    </div>
  );
}
