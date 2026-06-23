# 2026-06-23: Issue #3 Classic Mode Deterministic Engine

## What changed

Implemented the Classic Mode deterministic game loop and thin API routes on top of Supabase persistence.

## Files added or changed

- `lib/game/random.ts`
- `lib/game/roles.ts`
- `lib/game/actions.ts`
- `lib/game/voting.ts`
- `lib/game/win-conditions.ts`
- `lib/game/state-machine.ts`
- `lib/game/public-state.ts`
- `lib/game/persistence.ts`
- `lib/game/server-persistence.ts`
- `lib/game/classic-engine.test.ts`
- `app/api/game/start/route.ts`
- `app/api/game/[gameId]/route.ts`
- `app/api/game/action/route.ts`
- `app/api/game/vote/route.ts`
- `lib/db/repositories.ts`
- `lib/session/anonymous-session.ts`
- `lib/game/types.ts`
- `lib/game/mock-state.ts`
- `package.json`
- `package-lock.json`
- `vitest.config.ts`
- `docs/current_state.md`

## Engine scope

- Assigns Classic Mode roles deterministically:
  - 1 human Villager
  - 1 Mafia
  - 1 Detective
  - 1 Doctor
  - 3 AI Villagers
- Resolves deterministic night actions.
- Applies doctor saves and night kills.
- Stores detective checks as private recipient-scoped messages.
- Validates voting phase, alive voters, and alive targets.
- Resolves votes with no elimination on tie.
- Applies eliminations.
- Checks village and Mafia win conditions.
- Filters API-visible game state so AI roles and teams are hidden until game over.

## API scope

Added:

- `POST /api/game/start`
- `GET /api/game/[gameId]`
- `POST /api/game/action`
- `POST /api/game/vote`

Routes use anonymous sessions and session-scoped repository access. Game rows are loaded with `loadGameStateForSession`, updated with `updateGameForSession`, and player-alive updates assert ownership before writing.

Known ownership and game-rule errors return safe client responses. Unexpected errors are logged server-side and return a generic `INTERNAL_SERVER_ERROR` response without exposing internal error messages.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run build`

## Not included

- OpenAI Game Director.
- Payments.
- Login/auth.
- Multiplayer.
- Public feed.
- Voice.
- Custom characters.
- React UI wiring to the new API routes.

## Next task

Connect the `/game` UI to the persisted API routes and render state-driven phase controls, voting, and game-over role reveal.
