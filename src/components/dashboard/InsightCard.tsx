type Props = {
  title: string;
  value: string;
  sub?: string;
  /** Short status line, e.g. "cutting effectively" */
  badge?: string;
  badgeTone?: "positive" | "neutral" | "warn";
  animationClass?: string;
};

const toneClass = {
  positive: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  neutral: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  warn: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
};

export function InsightCard({
  title,
  value,
  sub,
  badge,
  badgeTone = "neutral",
  animationClass = "animate-fade-in",
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 ring-1 ring-zinc-800/40 transition duration-300 ${animationClass}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-1.5 text-lg font-bold tabular-nums tracking-tight text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-400">{sub}</p> : null}
      {badge ? (
        <p
          className={`mt-2 inline-block rounded-lg px-2 py-1 text-[11px] font-semibold ring-1 ${toneClass[badgeTone]}`}
        >
          {badge}
        </p>
      ) : null}
    </div>
  );
}
