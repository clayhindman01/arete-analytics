-- Run this once in the Supabase SQL editor.
-- The dashboard expects this exact table shape.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_name text not null,
  properties jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_user_created
  on public.analytics_events(user_id, created_at);

create index if not exists idx_analytics_events_name_created
  on public.analytics_events(event_name, created_at);

alter table public.analytics_events enable row level security;

-- Replace the UUID below with your own admin/auth user UUID.
-- The dashboard uses the publishable/anon key, so RLS is important.
create policy "Admin can read analytics"
on public.analytics_events
for select
to authenticated
using (
  auth.uid() = '00000000-0000-0000-0000-000000000000'
);

-- Your mobile app needs to insert events.
-- This allows an authenticated user to insert only events attributed to themselves.
create policy "Users can insert their own analytics"
on public.analytics_events
for insert
to authenticated
with check (
  auth.uid() = user_id
);
