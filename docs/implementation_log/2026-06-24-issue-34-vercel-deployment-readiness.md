# 2026-06-24: Issue #34 Vercel Deployment Readiness

## What changed

Prepared the Classic Mode MVP for a controlled Vercel deployment without
performing the production deployment itself.

## Implementation

- Added `docs/deployment.md` with Vercel setup, environment ownership, local
  versus production notes, a production smoke checklist, and safety guidance.
- Documented all Supabase and OpenAI variables and clarified which values are
  browser-visible versus server-only.
- Added centralized environment parsing and clear missing-variable errors under
  `lib/env`.
- Kept environment checks lazy so `next build` does not require production
  credentials during static analysis.
- Reused the environment boundary in the Supabase and OpenAI server providers.
- Kept missing OpenAI configuration nonfatal and made the mocked-dialogue
  fallback explicit in server logs.
- Added tests for missing/blank values, safe error text, and public/server
  variable namespace boundaries.

## Safety boundary

`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `OPENAI_MODEL` remain outside
the `NEXT_PUBLIC_*` namespace and are read only by `server-only` modules. API
routes continue to return a generic 500 for unexpected errors, so detailed
configuration failures remain in server logs.

## Verification

- `npm run typecheck`
- `npm test` (39 tests)
- `npm run build` with `.env.local` temporarily absent, proving static analysis
  does not require production secrets

No production deployment or live OpenAI request was made. The deployment guide
requires a manual live OpenAI smoke test before public sharing.

## Not included

- Rate limiting or AI usage enforcement.
- Monitoring automation or CI/CD changes.
- Custom domains.
- New modes, payments, auth, multiplayer, public feed, voice, custom characters,
  or UI redesign.

## Next task

Configure the documented Vercel environment, create a controlled deployment,
run the full smoke checklist, and add the planned usage limit before wider
sharing.
