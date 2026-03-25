# Hybrid Coach

A mobile-first MVP for logging daily bodyweight, calories, protein, and training (cutting, physique, Hyrox). Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (Postgres), and **Recharts**.

There is **no authentication** in this version: the app uses a fixed single-tenant `user_id` and open RLS policies suitable for a private/local build. Tighten RLS and add Supabase Auth before exposing the anon key publicly.

AI coaching is intentionally out of scope for v1.

## Features

- `daily_logs` table with open RLS for anon access (local / single-user only)
- Dashboard: today summary, macro progress, 7-day charts (when enough data), streak + 14-day strip, recent logs
- Daily log form: create or upsert by date
- History: filters (7 / 30 / all), summary stats, tap a row to edit

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## 1. Supabase setup

1. Create a project in the Supabase dashboard.
2. Open **SQL Editor** and run `supabase/schema.sql`.
   - If you previously created `daily_logs` with a foreign key to `auth.users`, run the `ALTER TABLE ... DROP CONSTRAINT` comment from that file first so inserts work without a real auth user.
3. **Security:** current policies allow anyone with your anon key to read/write all rows. Use this only for private development or behind a trusted network.

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

- `src/app/(app)/dashboard` — main dashboard
- `src/app/(app)/log` — daily log form (`?date=YYYY-MM-DD`)
- `src/app/(app)/history` — history (`?range=7|30|all`)
- `src/lib/supabase/server.ts` — server Supabase client (anon key)
- `src/lib/tenant.ts` — single-tenant `user_id` constant
- `src/components/*` — reusable UI, charts, and form
- `supabase/schema.sql` — database DDL + RLS

## Data model

Single table `daily_logs` with **unique** `(user_id, date)`. The app sets `user_id` to `HYBRID_COACH_USER_ID` or the default nil UUID. Upserts use `onConflict: user_id,date`.

## License

Private / your repo — adjust as needed.
