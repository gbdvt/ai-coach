"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteLogEvent, updateLogEvent } from "@/app/(app)/log/eventActions";
import { eventIcon, eventTypeLabel, summarizeEvent } from "@/lib/eventDisplay";
import type { LogEventRow } from "@/types/log-event";

type Props = {
  logDate: string;
  events: LogEventRow[];
  isToday?: boolean;
};

export function EventFeed({ logDate, events, isToday = true }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [pending, startTransition] = useTransition();

  function startEdit(e: LogEventRow) {
    setEditingId(e.id);
    setEditText(e.raw_text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function saveEdit(id: string) {
    const t = editText.trim();
    if (!t) return;
    startTransition(async () => {
      const res = await updateLogEvent(id, logDate, t);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Updated");
      cancelEdit();
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Remove this entry?")) return;
    startTransition(async () => {
      const res = await deleteLogEvent(id, logDate);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Removed");
      router.refresh();
    });
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800/90 bg-zinc-950/30 py-8 text-center text-sm text-zinc-500">
        {isToday
          ? "Nothing logged yet — add a line above."
          : "No entries this day — add one above or pick another date."}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {events.map((e) => (
        <li
          key={e.id}
          className="flex gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 transition hover:border-zinc-700/80"
        >
          <span className="select-none text-lg leading-none" aria-hidden>
            {eventIcon(e.event_type)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {eventTypeLabel(e.event_type)}
            </p>
            {editingId === e.id ? (
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={editText}
                  onChange={(ev) => setEditText(ev.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500/40"
                  disabled={pending}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => saveEdit(e.id)}
                    className="rounded-lg bg-emerald-600/90 px-2 py-1 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="truncate text-sm font-medium text-zinc-100">{summarizeEvent(e)}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{e.raw_text}</p>
              </>
            )}
          </div>
          {editingId !== e.id ? (
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
              <button
                type="button"
                onClick={() => startEdit(e)}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-300"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="text-xs font-medium text-zinc-600 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
