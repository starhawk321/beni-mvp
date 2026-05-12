-- Run in Supabase SQL Editor

-- OAuth state table (temporary, cleared after callback)
create table if not exists public.cms_oauth_state (
  user_id      uuid references auth.users(id) on delete cascade not null primary key,
  state        text not null,
  code_verifier text not null,
  created_at   timestamptz not null default now()
);
alter table public.cms_oauth_state enable row level security;
create policy "Users manage own oauth state"
  on public.cms_oauth_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- FHIR token storage
create table if not exists public.fhir_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  payer        text not null,
  access_token text not null,
  patient_id   text,
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  unique (user_id, payer)
);
alter table public.fhir_tokens enable row level security;
create policy "Users manage own tokens"
  on public.fhir_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
