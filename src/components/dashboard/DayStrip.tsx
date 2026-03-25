"use client";

import Link from "next/link";

export type DayStripItem = { date: string; label: string; logged: boolean };

type Props = {
  days: DayStripItem[];
};

/** Compact horizontal strip: last N days, highlight days with a log. */
export function DayStrip({ days }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((d) => (
        <Link
          key={d.date}
          href={`/log?date=${d.date}`}
          className={`flex min-w-[2.25rem] flex-col items-center rounded-lg px-1 py-2 text-center transition ring-1 ${
            d.logged
              ? "bg-emerald-500/15 ring-emerald-500/40 text-emerald-200"
              : "bg-zinc-950/50 ring-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span className="text-[9px] font-medium uppercase tracking-tight">
            {d.label}
          </span>
          <span className="mt-1 text-xs font-semibold tabular-nums text-zinc-200">
            {d.date.slice(8, 10)}
          </span>
        </Link>
      ))}
    </div>
  );
}
