import type { ChatMessageMeta, ChatMessageRow } from "@/types/chat";

export function toChatMessageRow(r: {
  id: string;
  user_id: string;
  log_date: string;
  role: string;
  content: string;
  meta: unknown;
  created_at: string;
}): ChatMessageRow {
  return {
    id: r.id,
    user_id: r.user_id,
    log_date: r.log_date,
    role: r.role as "user" | "assistant",
    content: r.content,
    meta: (r.meta ?? {}) as ChatMessageMeta,
    created_at: r.created_at,
  };
}
