"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { sendCoachMessage } from "@/app/(app)/coach/actions";
import type { ChatMessageRow } from "@/types/chat";
import type { CoachProfile } from "@/lib/coachSettings";

const SUGGESTED = [
  "weight 87.9",
  "800 cal chicken rice 55 protein",
  "hyrox intervals 4 x 1k",
  "3 beers",
  "what should I eat before a hard session?",
  "training focus: key intervals Tue/Thu",
];

type Props = {
  messages: ChatMessageRow[];
  today: string;
  profile: CoachProfile;
  lastChips: string[];
};

export function CoachClient({ messages, today, profile, lastChips }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const line = text.trim();
    if (!line || pending) return;

    startTransition(async () => {
      const res = await sendCoachMessage(line);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-[50vh] flex-col">
      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setText(s)}
            className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-left text-xs text-zinc-400 transition hover:border-emerald-500/30 hover:text-zinc-200"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-3 sm:p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No thread yet — open again after applying schema, or send a message to start.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed sm:max-w-[85%] ${
                  m.role === "user"
                    ? "bg-emerald-600/25 text-emerald-50 ring-1 ring-emerald-500/25"
                    : "bg-zinc-900/90 text-zinc-100 ring-1 ring-zinc-700/80"
                }`}
              >
                {m.role === "assistant" && (m.meta as { kind?: string })?.kind === "daily_opening" ? (
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-cyan-400/90">
                    Daily brief
                  </span>
                ) : null}
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" &&
                (m.meta as { used_llm?: boolean })?.used_llm === true ? (
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-600">Coach · LLM</p>
                ) : null}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {lastChips.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {lastChips.map((c) => (
            <span
              key={c}
              className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-500/20"
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Log in plain language or ask a sharp question…"
            disabled={pending}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 py-3 pl-4 pr-24 text-sm text-zinc-100 outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-emerald-500/30"
          />
          <button
            type="button"
            disabled
            title="Voice coming soon"
            className="absolute right-14 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-600"
            aria-label="Voice input unavailable"
          >
            <span className="text-base">🎙</span>
          </button>
        </div>
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="shrink-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-bold text-zinc-950 disabled:opacity-40"
        >
          {pending ? "…" : "Send"}
        </button>
      </form>

      <p className="mt-2 text-center text-[10px] text-zinc-600">
        {today} · Targets {profile.calorieTarget} kcal / {profile.proteinTargetG} g protein ·{" "}
        <a href="/settings" className="text-zinc-500 underline">
          Settings
        </a>
      </p>
    </div>
  );
}
