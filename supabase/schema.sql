-- Hybrid Coach: daily_logs (no auth MVP)
-- Run in Supabase SQL Editor. Anon key is used from the app; RLS is open — OK for local/single-user only.

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  date date not null,
  morning_weight_kg numeric,
  calorie_target integer,
  calories_actual integer,
  protein_target_g integer,
  protein_actual_g integer,
  training_type text,
  training_duration_min integer,
  training_notes text,
  steps integer,
  alcohol_drinks integer,
  binge_flag boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- If you already created the table with a foreign key to auth.users, run:
-- alter table public.daily_logs drop constraint if exists daily_logs_user_id_fkey;

create index if not exists daily_logs_user_id_date_idx on public.daily_logs (user_id, date desc);

alter table public.daily_logs enable row level security;

drop policy if exists "Users select own daily_logs" on public.daily_logs;
drop policy if exists "Users insert own daily_logs" on public.daily_logs;
drop policy if exists "Users update own daily_logs" on public.daily_logs;
drop policy if exists "Users delete own daily_logs" on public.daily_logs;
drop policy if exists "daily_logs_select" on public.daily_logs;
drop policy if exists "daily_logs_insert" on public.daily_logs;
drop policy if exists "daily_logs_update" on public.daily_logs;
drop policy if exists "daily_logs_delete" on public.daily_logs;

create policy "daily_logs_select" on public.daily_logs for select using (true);
create policy "daily_logs_insert" on public.daily_logs for insert with check (true);
create policy "daily_logs_update" on public.daily_logs for update using (true) with check (true);
create policy "daily_logs_delete" on public.daily_logs for delete using (true);

create or replace function public.set_daily_logs_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists daily_logs_set_updated_at on public.daily_logs;

create trigger daily_logs_set_updated_at
  before update on public.daily_logs
  for each row
  execute function public.set_daily_logs_updated_at();
