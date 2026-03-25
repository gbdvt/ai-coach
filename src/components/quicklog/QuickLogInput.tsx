"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitQuickLog } from "@/app/(app)/log/eventActions";

const EXAMPLES = [
  "weight 87.9",
  "800 cal chicken rice 55 protein",
  "hyrox intervals 4 x 1k",
  "3 beers",
  "binged tonight",
  "training in 1h",
];

type Props = {
  logDate: string;
};

export function QuickLogInput({ logDate }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const line = text.trim();
    if (!line || pending) return;

    startTransition(async () => {
      const res = await submitQuickLog(logDate, line);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setText("");
      toast.success("Logged ✅");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label className="sr-only" htmlFor={`quick-log-${logDate}`}>
        Quick log
      </label>
      <div className="relative">
        <input
          id={`quick-log-${logDate}`}
          type="text"
          autoComplete="off"
          placeholder="Type what happened…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
          className="w-full rounded-2xl border border-zinc-700/90 bg-zinc-950/90 py-3.5 pl-4 pr-14 text-[15px] text-zinc-100 shadow-inner outline-none ring-1 ring-zinc-800/80 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-emerald-500/25"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-bold text-zinc-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {pending ? "…" : "Add"}
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-600">
        Try:{" "}
        {EXAMPLES.map((ex, i) => (
          <span key={ex}>
            <button
              type="button"
              className="text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-emerald-400/90"
              onClick={() => setText(ex)}
            >
              {ex}
            </button>
            {i < EXAMPLES.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </form>
  );
}
