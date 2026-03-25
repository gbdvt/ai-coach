-- Hybrid Coach: daily_logs (no auth MVP)
-- Run in Supabase SQL Editor. Anon key is used from the app; RLS is open — OK for local/single-user only.
--
-- If the table was created earlier with user_id → auth.users, drop that FK so the
-- single-tenant UUID (see src/lib/tenant.ts) can be used without a real auth user.
do $hc$
begin
  if to_regclass('public.daily_logs') is not null then
    alter table public.daily_logs drop constraint if exists daily_logs_user_id_fkey;
  end if;
end;
$hc$;

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

-- Default macro targets (single row per tenant; app merges into daily_logs on sync)
create table if not exists public.coach_settings (
  user_id uuid not null primary key,
  default_calorie_target integer not null default 2200,
  default_protein_target_g integer not null default 160,
  updated_at timestamptz not null default now()
);

alter table public.coach_settings enable row level security;

drop policy if exists "coach_settings_all" on public.coach_settings;

create policy "coach_settings_all" on public.coach_settings for all using (true) with check (true);

-- Quick-log events (natural language capture); `daily_logs` is derived via app sync
create table if not exists public.log_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  log_date date not null,
  event_type text not null,
  raw_text text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint log_events_type_check check (
    event_type in (
      'weight',
      'meal',
      'workout',
      'alcohol',
      'note',
      'binge'
    )
  )
);

create index if not exists log_events_user_date_created_idx
  on public.log_events (user_id, log_date, created_at);

alter table public.log_events enable row level security;

drop policy if exists "log_events_select" on public.log_events;
drop policy if exists "log_events_insert" on public.log_events;
drop policy if exists "log_events_update" on public.log_events;
drop policy if exists "log_events_delete" on public.log_events;

create policy "log_events_select" on public.log_events for select using (true);
create policy "log_events_insert" on public.log_events for insert with check (true);
create policy "log_events_update" on public.log_events for update using (true) with check (true);
create policy "log_events_delete" on public.log_events for delete using (true);

create or replace function public.set_log_events_updated_at()
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

drop trigger if exists log_events_set_updated_at on public.log_events;

create trigger log_events_set_updated_at
  before update on public.log_events
  for each row
  execute function public.set_log_events_updated_at();

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
