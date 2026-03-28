# Hybrid Coach

A mobile-first MVP for logging daily bodyweight, calories, protein, and training (cutting, physique, Hyrox). Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (Postgres), and **Recharts**.

There is **no authentication** in this version: the app uses a fixed single-tenant `user_id` and open RLS policies suitable for a private/local build. Tighten RLS and add Supabase Auth before exposing the anon key publicly.

## Features

- **Coach (home)**: proactive daily brief, chat-first logging, rule-based replies for obvious logs; optional **OpenAI** for coaching questions only (`OPENAI_API_KEY`)
- **Quick log**: same natural-language lines in chat or on **Log** — stored in `log_events` and merged into `daily_logs`
- **Profile**: name, training/nutrition focus, phase note, and macro targets in **Settings** (feeds the daily opening + preview card)
- `daily_logs` + `log_events` + `coach_settings` + `coach_chat_messages` with open RLS (local / single-user only)
- **Dashboard**: trends, quick capture, charts — supporting view after Coach
- **Log** page: quick log + feed + day summary; **Manual edit** (`/log/advanced`) for structured overrides
- History: filters, calendar strip, summary stats

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## 1. Supabase setup

1. Create a project in the Supabase dashboard.
2. Open **SQL Editor** and run `supabase/schema.sql` (creates/updates `daily_logs`, `log_events`, `coach_settings`, `coach_chat_messages`; drops `daily_logs_user_id_fkey` when the table already exists). The script dedupes extra **Daily brief** rows and adds a partial unique index so only one opening exists per day.
3. If you already had duplicate daily briefs before updating schema, you can also run `supabase/fix_duplicate_daily_opening.sql` once.
4. If you still see **`daily_logs_user_id_fkey`** errors, run `supabase/fix_user_id_foreign_key.sql` once, or manually:  
   `alter table public.daily_logs drop constraint if exists daily_logs_user_id_fkey;`
5. **Security:** current policies allow anyone with your anon key to read/write all rows. Use this only for private development or behind a trusted network.

## 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional: `HYBRID_COACH_USER_ID` (UUID) to scope logs to a different tenant id (must stay consistent with existing rows).

Optional: `OPENAI_API_KEY` for LLM answers to **questions** in Coach chat; `COACH_OPENAI_MODEL` defaults to `gpt-4o-mini`. Without a key, the app still logs via rules and uses short fallbacks for questions.

## 3. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you land on **`/coach`** (Dashboard remains under **Trends** / nav).

## 4. Production build

```bash
npm run build
npm start
```

## Project structure (high level)

- `src/app/(app)/coach` — main experience: daily brief, chat logging, day strip
- `src/app/(app)/dashboard` — dashboard + today quick capture
- `src/app/(app)/log` — quick log hub (`?date=YYYY-MM-DD`)
- `src/app/(app)/log/advanced` — manual day edit (structured fields)
- `src/app/(app)/settings` — profile + macro targets
- `src/app/(app)/history` — history (`?range=…`)
- `src/lib/quickLogParser.ts` — rule-based parser for quick log lines
- `src/lib/syncDailyLogFromEvents.ts` — merge events → `daily_logs` row
- `src/lib/supabase/server.ts` — server Supabase client (anon key)
- `src/lib/tenant.ts` — single-tenant `user_id` constant
- `supabase/schema.sql` — database DDL + RLS

## Data model

Single table `daily_logs` with **unique** `(user_id, date)`. The app sets `user_id` to `HYBRID_COACH_USER_ID` or the default nil UUID. Upserts use `onConflict: user_id,date`.

## License

Private / your repo — adjust as needed.
