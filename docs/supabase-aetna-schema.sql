-- Aetna payer integration — run in Supabase SQL Editor.
-- Mirrors the bcbs_oauth_state shape: state + flow_intent, no PKCE (Aetna sandbox
-- uses plain authorization code + Basic auth, no code_verifier).

-- OAuth state table (temporary, cleared after callback)
create table if not exists public.aetna_oauth_state (
  user_id      uuid references auth.users(id) on delete cascade not null primary key,
  state        text not null,
  flow_intent  text not null default 'first',
  created_at   timestamptz not null default now(),
  constraint aetna_oauth_state_flow_intent_check check (flow_intent in ('first', 'add'))
);

alter table public.aetna_oauth_state enable row level security;

create policy "Users manage own oauth state"
  on public.aetna_oauth_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Note: fhir_tokens already keys on (user_id, payer), so no schema change is
-- needed there — Aetna tokens land in the existing table with payer = 'aetna'.
