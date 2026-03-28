import type { CoachProfile } from "@/lib/coachSettings";
import type { DailyLog } from "@/types/daily-log";

type Props = {
  profile: CoachProfile;
  todayLog: DailyLog | null;
  today: string;
};

export function CoachPreviewCard({ profile, todayLog, today }: Props) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-zinc-900/60 to-emerald-500/5 p-4 ring-1 ring-cyan-500/15">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/90">
            Hybrid Coach
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">{profile.displayName}</h2>
          <p className="text-xs text-zinc-500">{today} · operating view</p>
        </div>
        <div className="text-right text-[10px] text-zinc-500">
          {profile.phaseNote ? (
            <p className="max-w-[200px] text-zinc-400">{profile.phaseNote}</p>
          ) : (
            <p>Set phase in Settings</p>
          )}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Priority label="Training priority" text={profile.trainingFocus || "Define in Settings or chat: training focus: …"} />
        <Priority label="Nutrition priority" text={profile.nutritionFocus || "Define in Settings or chat: nutrition focus: …"} />
      </div>
      {todayLog?.binge_flag ? (
        <p className="mt-2 text-xs font-medium text-amber-300/90">Today flagged off-plan — coach thread has the reset stance.</p>
      ) : null}
    </div>
  );
}

function Priority({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-black/20 px-3 py-2 ring-1 ring-zinc-800/60">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm text-zinc-200">{text}</p>
    </div>
  );
}
