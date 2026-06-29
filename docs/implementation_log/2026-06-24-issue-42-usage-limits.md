# 2026-06-24: Issue #42 Anonymous Usage Limits

## What changed

Added persisted anonymous-session usage limits and AI cost guardrails before
wider sharing of the deployed Classic Mode MVP.

## Implementation

- Added safe defaults of 3 game starts per day, 30 Game Director attempts per
  day, and 5 non-empty questions per game.
- Added optional server-only environment overrides for all three limits.
- Added `anonymous_sessions.ai_actions_today`.
- Added atomic `claim_anonymous_game_start` and
  `claim_anonymous_ai_action` database functions.
- Revoked both function grants from `public`, `anon`, and `authenticated`; only
  the service role may execute them.
- Reserved `ai_usage_events` before Director calls with game, provider, model,
  and purpose. Token and cost fields remain null for now.
- Added safe 429 responses for game, AI action, and per-game question limits.
- Kept deterministic advances and empty question skips outside AI usage counts.

## Concurrency and reset behavior

Each claim normalizes counters when the database date changes and locks the
anonymous-session row while checking and incrementing. Concurrent requests for
the same session therefore cannot both consume the final allowed slot.

## Verification

- `npm run typecheck`
- `npm test` (46 tests)
- `npm run build`
- Supabase migration applied to project `trust-no-bot`.
- A rolled-back SQL verification covered fourth-game rejection, daily reset,
  AI daily rejection, question rejection, and null-token usage-event metadata.
- A service-role Supabase Data API smoke allowed the first game claim, rejected
  the second at a temporary limit of 1, and removed the temporary session row.
- Supabase security/performance advisors showed no new issue #42 regression.

## Known limitations

- Clearing the anonymous cookie creates a new session and new allowance.
- Limits are not IP-, account-, or device-based.
- AI events reserve attempts before the provider call, so failed or fallback
  attempts still consume allowance. This is intentional for cost protection.
- Exact input/output token counts and estimated cost remain null.

## Next task

Merge and deploy issue #42, configure overrides only if the defaults need
tuning, and run the documented Preview 429 smoke check before wider sharing.
