type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function StatPill({ label, value, hint }: Props) {
  return (
    <div className="rounded-xl bg-zinc-950/60 px-3 py-2 ring-1 ring-zinc-800/80">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums text-zinc-100">{value}</p>
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
