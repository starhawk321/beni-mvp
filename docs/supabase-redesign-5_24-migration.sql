-- Beni dashboard redesign 5/24 — Phase 0 schema migration
-- Run in Supabase SQL Editor on dev project first, then prod when ready.
--
-- Adds two columns:
--   1. profiles.connection_skipped — flips when user picks "see sample
--      dashboard" instead of connecting an insurer. Drives mock-data path
--      and the persistent disclaimer bar.
--   2. <payer>_oauth_state.flow_intent — preserves "first" vs "add" context
--      through the OAuth round-trip so the callback knows where to send
--      the user (interstitial → dashboard vs settings).
--
-- Safe to re-run: all changes use IF NOT EXISTS / DEFAULT.

-- ── profiles.connection_skipped ────────────────────────────────────────
alter table profiles
  add column if not exists connection_skipped boolean not null default false;

-- ── flow_intent on per-payer oauth_state tables ────────────────────────
-- Values: 'first' (first-time onboarding) | 'add' (from Settings)

alter table cms_oauth_state
  add column if not exists flow_intent text not null default 'first';

alter table cigna_oauth_state
  add column if not exists flow_intent text not null default 'first';

alter table bcbs_oauth_state
  add column if not exists flow_intent text not null default 'first';

-- Optional constraint to catch typos at write time
alter table cms_oauth_state
  drop constraint if exists cms_oauth_state_flow_intent_check;
alter table cms_oauth_state
  add constraint cms_oauth_state_flow_intent_check
  check (flow_intent in ('first', 'add'));

alter table cigna_oauth_state
  drop constraint if exists cigna_oauth_state_flow_intent_check;
alter table cigna_oauth_state
  add constraint cigna_oauth_state_flow_intent_check
  check (flow_intent in ('first', 'add'));

alter table bcbs_oauth_state
  drop constraint if exists bcbs_oauth_state_flow_intent_check;
alter table bcbs_oauth_state
  add constraint bcbs_oauth_state_flow_intent_check
  check (flow_intent in ('first', 'add'));
