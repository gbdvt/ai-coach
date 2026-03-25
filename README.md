# Hybrid Coach

A mobile-first MVP for logging daily bodyweight, calories, protein, and training (cutting, physique, Hyrox). Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (Postgres), and **Recharts**.

There is **no authentication** in this version: the app uses a fixed single-tenant `user_id` and open RLS policies suitable for a private/local build. Tighten RLS and add Supabase Auth before exposing the anon key publicly.

AI coaching is intentionally out of scope for v1.

## Features

- **Quick log**: natural-language lines (weight, meals with kcal/protein, workouts, alcohol, binge, notes) stored in `log_events` and merged into `daily_logs` for charts/history
- **Targets**: defaults from `coach_settings` (or code fallbacks); edit under **Settings** — not re-entered every day
- `daily_logs` + `log_events` + `coach_settings` with open RLS (local / single-user only)
- Dashboard: quick capture for today, insights, macro progress, charts, streak strip, recent logs
- **Log** page: quick log + feed + day summary; **Manual edit** (`/log/advanced`) for structured overrides
- History: filters, calendar strip, summary stats

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## 1. Supabase setup

1. Create a project in the Supabase dashboard.
2. Open **SQL Editor** and run `supabase/schema.sql` (creates/updates `daily_logs`, `log_events`, `coach_settings`; drops `daily_logs_user_id_fkey` when the table already exists).
3. If you still see **`daily_logs_user_id_fkey`** errors, run `supabase/fix_user_id_foreign_key.sql` once, or manually:  
   `alter table public.daily_logs drop constraint if exists daily_logs_user_id_fkey;`
4. **Security:** current policies allow anyone with your anon key to read/write all rows. Use this only for private development or behind a trusted network.

## 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional: `HYBRID_COACH_USER_ID` (UUID) to scope logs to a different tenant id (must stay consistent with existing rows).

## 3. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you land on `/dashboard`.

## 4. Production build

```bash
npm run build
npm start
```

## Project structure (high level)

- `src/app/(app)/dashboard` — dashboard + today quick capture
- `src/app/(app)/log` — quick log hub (`?date=YYYY-MM-DD`)
- `src/app/(app)/log/advanced` — manual day edit (structured fields)
- `src/app/(app)/settings` — default calorie / protein targets
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
