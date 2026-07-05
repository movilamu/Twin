-- Run this in the Supabase SQL Editor.
-- If you already ran the earlier version of this file, run the DROP
-- statements first, then the rest, to migrate to per-user RLS.

drop policy if exists "Allow anon insert on households" on households;
drop policy if exists "Allow anon select on households" on households;
drop policy if exists "Allow anon insert on resilience_scores" on resilience_scores;
drop policy if exists "Allow anon select on resilience_scores" on resilience_scores;

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  address text not null,
  region text not null,
  composition jsonb not null,
  home jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists resilience_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  household_address text not null,
  score jsonb not null,
  generated_at timestamptz not null default now()
);

-- Backfill user_id column if the table already existed without it.
alter table households add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table resilience_scores add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table households enable row level security;
alter table resilience_scores enable row level security;

-- Each signed-in user can only see and write their own rows.
create policy "Users manage their own households"
  on households for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own resilience scores"
  on resilience_scores for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enable magic-link email auth in Supabase: Authentication > Providers > Email
-- (enabled by default). No further config needed for signInWithOtp to work.
