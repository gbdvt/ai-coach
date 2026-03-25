"use client";

import Link from "next/link";

export type CalendarSquare = {
  date: string;
  logged: boolean;
  /** 0–1 calorie adherence when target set */
  adherence: number | null;
};

type Props = {
  days: CalendarSquare[];
  today: string;
};

/** Last N days as squares: intensity from calorie adherence when logged. */
export function HistoryCalendarStrip({ days, today }: Props) {
  return (
    <div className="flex flex-wrap gap-1 sm:flex-nowrap sm:overflow-x-auto sm:pb-1 sm:[-ms-overflow-style:none] sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden">
      {days.map((d) => {
        const isToday = d.date === today;
        const baseRing = isToday ? "ring-2 ring-cyan-400/70" : "ring-1";

        if (!d.logged) {
          return (
            <Link
              key={d.date}
              href={`/log?date=${d.date}`}
              title={d.date}
              className={`flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-950/90 text-[10px] font-semibold tabular-nums text-zinc-600 ring-zinc-800/60 transition hover:text-zinc-400 ${baseRing}`}
            >
              {d.date.slice(8, 10)}
            </Link>
          );
        }

        if (d.adherence != null) {
          const a = d.adherence;
          const style = { backgroundColor: `rgba(16, 185, 129, ${0.2 + a * 0.65})` };
          return (
            <Link
              key={d.date}
              href={`/log?date=${d.date}`}
              title={`${d.date} · ${Math.round(a * 100)}% kcal adherence`}
              style={style}
              className={`flex size-8 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums text-emerald-50 ring-emerald-500/35 transition hover:ring-emerald-400/50 ${baseRing}`}
            >
              {d.date.slice(8, 10)}
            </Link>
          );
        }

        return (
          <Link
            key={d.date}
            href={`/log?date=${d.date}`}
            title={d.date}
            className={`flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-600/35 text-[10px] font-semibold tabular-nums text-emerald-100 ring-emerald-500/40 transition hover:bg-emerald-600/45 ${baseRing}`}
          >
            {d.date.slice(8, 10)}
          </Link>
        );
      })}
    </div>
  );
}
