-- Aetna payer integration — run in Supabase SQL Editor.
-- Switched to PKCE-based flow (per Aetna's "Token Generation Process Using PKCE"
-- doc) — non-PKCE flow hit a 400/null sandbox-wide failure in the post-login
-- IDology step. PKCE may take a different code path through Aetna's identity
-- subsystem. State table now stores code_verifier alongside state + flow_intent.

-- OAuth state table (temporary, cleared after callback)
create table if not exists public.aetna_oauth_state (
  user_id       uuid references auth.users(id) on delete cascade not null primary key,
  state         text not null,
  code_verifier text,
  flow_intent   text not null default 'first',
  created_at    timestamptz not null default now(),
  constraint aetna_oauth_state_flow_intent_check check (flow_intent in ('first', 'add'))
);

-- If the table was created before PKCE was added, add the column idempotently:
alter table public.aetna_oauth_state add column if not exists code_verifier text;

alter table public.aetna_oauth_state enable row level security;

drop policy if exists "Users manage own oauth state" on public.aetna_oauth_state;
create policy "Users manage own oauth state"
  on public.aetna_oauth_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Note: fhir_tokens already keys on (user_id, payer), so no schema change is
-- needed there — Aetna tokens land in the existing table with payer = 'aetna'.
