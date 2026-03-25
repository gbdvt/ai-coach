"use client";

import type { ReactNode } from "react";

type Props = {
  isToday: boolean;
  hasAnyProgress: boolean;
  children: ReactNode;
};

/** Subtle highlight when today has logged data. */
export function TodayProgressShell({ isToday, hasAnyProgress, children }: Props) {
  return (
    <div
      className={`rounded-2xl transition-all duration-500 ${
        isToday && hasAnyProgress
          ? "bg-gradient-to-br from-emerald-500/10 via-zinc-900/30 to-cyan-500/5 p-1 ring-1 ring-emerald-500/25"
          : ""
      }`}
    >
      <div className={isToday && hasAnyProgress ? "rounded-[14px] bg-zinc-950/40 p-1" : ""}>
        {children}
      </div>
    </div>
  );
}
