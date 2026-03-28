export type ChatMessageMeta = {
  kind?: "daily_opening" | "user" | "coach_reply";
  classification?: "log" | "question" | "goal_update" | "unclear";
  used_llm?: boolean;
  chips?: string[];
  event_type?: string;
};

export type ChatMessageRow = {
  id: string;
  user_id: string;
  log_date: string;
  role: "user" | "assistant";
  content: string;
  meta: ChatMessageMeta;
  created_at: string;
};
