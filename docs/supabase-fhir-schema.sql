-- Run this in Supabase SQL Editor

-- Add pending_conflicts column to profiles
alter table public.profiles
  add column if not exists pending_conflicts jsonb;

-- 1. Add selected_insurer to profiles
alter table public.profiles
  add column if not exists selected_insurer text;

-- 2. FHIR coverage table
create table if not exists public.fhir_coverage (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  insurer_name    text,
  plan_name       text,
  plan_type       text,
  subscriber_id   text,
  period_start    date,
  period_end      date,
  status          text,
  raw             jsonb,
  synced_at       timestamptz not null default now()
);

alter table public.fhir_coverage enable row level security;

create policy "Users see own coverage"
  on public.fhir_coverage for all
  using (auth.uid() = user_id);

-- 3. FHIR claims table
create table if not exists public.fhir_claims (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  eob_id          text,
  insurer_name    text,
  claim_type      text,
  service_date    date,
  provider        text,
  amount_charged  numeric(10,2),
  amount_paid     numeric(10,2),
  amount_patient  numeric(10,2),
  status          text,
  raw             jsonb,
  synced_at       timestamptz not null default now()
);

alter table public.fhir_claims enable row level security;

create policy "Users see own claims"
  on public.fhir_claims for all
  using (auth.uid() = user_id);

-- 4. Indexes for fast lookups
create index if not exists fhir_coverage_user_id on public.fhir_coverage(user_id);
create index if not exists fhir_claims_user_id   on public.fhir_claims(user_id);
create index if not exists fhir_claims_date      on public.fhir_claims(user_id, service_date desc);
