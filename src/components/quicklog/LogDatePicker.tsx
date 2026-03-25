"use client";

import { useRouter } from "next/navigation";

type Props = {
  value: string;
  /** Default: quick log. Use `/log/advanced` for manual edit page. */
  basePath?: string;
};

export function LogDatePicker({ value, basePath = "/log" }: Props) {
  const router = useRouter();

  return (
    <label className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Day</span>
      <input
        type="date"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v) router.push(`${basePath}?date=${v}`);
        }}
        className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/25"
      />
    </label>
  );
}
