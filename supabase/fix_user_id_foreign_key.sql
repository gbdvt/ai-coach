-- Run this once in Supabase → SQL Editor if you see:
-- "violates foreign key constraint daily_logs_user_id_fkey"
--
-- The app uses a fixed tenant UUID that is not a row in auth.users.

alter table public.daily_logs
  drop constraint if exists daily_logs_user_id_fkey;
