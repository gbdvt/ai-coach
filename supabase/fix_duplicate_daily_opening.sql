-- Run once if you already have multiple "Daily brief" rows per day.
-- Then the partial unique index in schema.sql can be applied safely.

with ranked as (
  select id,
    row_number() over (
      partition by user_id, log_date
      order by created_at asc
    ) as rn
  from public.coach_chat_messages
  where coalesce(meta->>'kind', '') = 'daily_opening'
)
delete from public.coach_chat_messages c
where c.id in (select id from ranked where rn > 1);

create unique index if not exists coach_chat_daily_opening_one_per_day
  on public.coach_chat_messages (user_id, log_date)
  where coalesce(meta->>'kind', '') = 'daily_opening';
