# 2026-06-23: Issue #33 Supabase Persistence Foundation

## What changed

Added the persistence foundation required before public deployment.

## Files added or changed

- `supabase/migrations/20260623062909_issue_33_persistence.sql`
- `.gitignore`
- `lib/db/client.ts`
- `lib/db/types.ts`
- `lib/db/repositories.ts`
- `lib/session/anonymous-session.ts`
- `.env.example`
- `package.json`
- `package-lock.json`
- `docs/current_state.md`
- `docs/database_schema.md`

## Database scope

The migration creates:

- `anonymous_sessions`
- `games`
- `game_players`
- `game_messages`
- `game_votes`
- `night_actions`
- `game_results`
- `ai_usage_events`

RLS is enabled on all public tables. No anon/authenticated policies are added yet because hidden role data must stay server-side for the MVP.

## Code scope

- Added a server-only Supabase service client.
- Added repository helpers for sessions, games, players, messages, votes, night actions, results, AI usage events, and aggregate game loading.
- Added anonymous session cookie helpers using an HTTP-only cookie.

## Verification

- `npm run typecheck`

## Not included

- OpenAI integration.
- Full game loop.
- Payments.
- Login/auth.
- Multiplayer.
- Public feed.
- Admin dashboard.

## Next task

Implement the Classic Mode deterministic game engine and thin API routes that call these repositories while filtering hidden role data before any client response.
