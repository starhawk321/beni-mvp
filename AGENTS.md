# Project Instructions

## Behavioral guidelines

These reduce common coding mistakes. They bias toward caution over speed — use judgment on trivial tasks.

### 1. Think before coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity first

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical changes

Touch only what you must. Clean up only your own mess.

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

Test: Every changed line should trace directly to the user's request.

### 4. Commit messages are documentation

Write the *why* and the *lesson*, not just the *what*.

- Bug fixes: explain what was wrong, the root cause, and the constraint someone reading `git log` six months from now needs to know.
- Don't restate the diff. The diff is in the diff.
- Capture the discovery — if it took an hour to figure out, the lesson belongs in the commit body.
- Reference issues with `#NN` so context survives across compactions.

Good: `Fix BCBS auth/token URLs — SMART config shows the correct endpoints are on interop-preview, not preview-api`
Bad: `Update BCBS URLs`

### 5. Goal-driven execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria enable independent looping. Weak criteria ("make it work") require constant clarification.

---

## Stack

- Next.js App Router — **breaking changes from training data; read `node_modules/next/dist/docs/` before writing**
- Supabase (auth, profiles, fhir_tokens, `<payer>_oauth_state` per payer)
- Vercel deploy: `main` → benihealth.app (stealth landing), `dev` → preview URL (full app)
- Active MVP branch: `advantage` (off `dev`)

## Current product direction

Béni is the financial layer for healthcare — bill inbox + AI claims audit + drafted appeal letters. Billing-focused wedge, healthcare-finance-broad destination.

The two problems we solve:
1. **"I don't know what I actually owe"** → unified bill inbox + EOB-to-bill reconciliation (daily-use surface)
2. **"I don't know if my insurer screwed me"** → AI claims audit + drafted appeal letters (episodic moment-of-magic)

On `advantage`, old route surfaces (`/home`, `/plans`, `/claims`, `/records`) remain on disk but are disconnected from nav. They're reference material for the new inbox/findings surfaces being built around them. Don't re-link them in nav.

See `docs/strategy.md` for the 8-week MVP plan, TAM picture, feature-by-feature FHIR dependency, and what was ruled out.

## Ephemeral FHIR architecture (HIPAA stance)

- Béni is NOT a HIPAA Business Associate — user-directed OAuth access
- Béni DOES fall under FTC Health Breach Notification Rule (2024)
- See `docs/hipaa-compliance.md` for full analysis
- Database holds only: encrypted OAuth tokens, encrypted `patient_id`, profile (name/email)
- Health records, claims, EOBs are fetched live and discarded — never persisted

## Critical security rules

- `FHIR_TOKEN_ENCRYPTION_KEY` lives in Vercel env vars only, never source
- `patient_id` MUST be encrypted before storage (HIPAA identifier)
- `DEBUG_ENABLED` for Preview/dev only, NEVER Production
- Service role keys never use `NEXT_PUBLIC_` prefix
- Flag any feature that would persist PHI

## Payer integration pattern

- Routes: `app/api/fhir/<payer>/{authorize,callback}/route.ts`
- Fetch helpers: `lib/fhir/client.ts` (one set per payer)
- Token refresh: `lib/fhir/token.ts`
- Aggregation: `lib/fhir/multi-payer.ts`
- Token table key: `(user_id, payer)` — supports multiple insurers per user
- Each new payer needs: `<payer>_oauth_state` table with RLS, Vercel env vars (preview + prod), callback URL registered in payer portal

## Known gotchas

- OAuth redirect URI must match in three places: Vercel env var, our code, payer portal allowed list
- Env var changes don't take effect until next deployment
- Cookies from previous OAuth attempts can cause `invalid_client` — force fresh sandbox login when debugging
- Supabase `.upsert()` doesn't throw on RLS errors — check the `error` field on the response
- Cigna's token endpoint returns malformed HTTP headers — must use `insecureHTTPParser: true`
- Aetna sandbox rejects ALL query params on FHIR resource calls (including `_count`). Use bare endpoint URLs (`Coverage`, not `Coverage?patient=X`). Patient context is bound to the OAuth token.
- Aetna prepends `OperationOutcome` as `entry[0]` of every Bundle response — filter Bundle entries by `resourceType` before reading the first one. See `lib/fhir/multi-payer.ts`.
- Aetna sandbox `subscriberId` may be the literal string `'masked'`; fall back to `identifier[0].value` for member ID.

## References

- `docs/strategy.md` — current product direction, 8-week MVP plan, TAM, what was ruled out
- `docs/bcbs-payer-apis.md` — state-by-state BCBS API reference
- `docs/hipaa-compliance.md` — full HIPAA analysis
- GitHub milestones (to be created on `advantage`):
  - Closed Beta MVP — inbox + audit + appeals (8 weeks)
  - Billing Expansion — charity care, negotiation, Rx (post-beta)
  - Commercial Unlock — Cigna commercial via Patient Access goes live Jan 1, 2027
  - 2027 API Wave — prior auth, provider access, payer-to-payer (CMS-0057-F)
