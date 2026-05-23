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

### 4. Goal-driven execution

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

## References

- `docs/bcbs-payer-apis.md` — state-by-state BCBS API reference
- `docs/hipaa-compliance.md` — full HIPAA analysis
- GitHub milestones: MVP Launch (June 2026), Financial Layer (Q3 2026), Intelligence (Q4 2026)
