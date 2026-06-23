# Current State

Last updated: 2026-06-23

## Current goal

Deploy a working Trust No Bot Classic Mode MVP by next week.

## Current implementation status

- Repository planning docs exist.
- GitHub issue backlog exists.
- Phase 0 app scaffold has been implemented for issue #2.
- Next.js App Router, TypeScript, Tailwind CSS, and a mobile-first UI shell are in place.
- Landing page renders the hook and starts a persisted Classic game through `POST /api/game/start`.
- `/game/[gameId]` loads the persisted visible game state and renders the Classic room, transcript, actions, voting, and result reveal.
- Deterministic mock game state remains for scaffold/tests only; the browser game route no longer reads it.
- `AIProvider` and `MockAIProvider` stubs exist, with no real OpenAI calls.
- Supabase persistence foundation has been implemented for issue #33.
- Database migrations now define games, players, messages, votes, night actions, results, anonymous sessions, and AI usage events.
- Server-only Supabase repository functions exist under `lib/db`, with route-facing game load/update helpers scoped by anonymous session ownership.
- Anonymous session cookie helpers exist under `lib/session`.
- Classic Mode deterministic game engine has been implemented for issue #3.
- Server API routes now support starting, loading, advancing, questioning, and voting in a persisted Classic game.
- Known game errors return safe client messages; unexpected API errors are logged server-side and return a generic 500 response.
- Game rule tests cover role assignment, night resolution, vote validation, elimination, win conditions, and public-state filtering.
- Night resolution and daytime voting now complete the single-player game with a Mafia win when the human is eliminated before ordinary parity, preventing dead-human active-game soft-locks.
- Seeded night targets are selected from players sorted by persisted player ID, so reload ordering cannot change deterministic actions.
- OpenAI Game Director has not been implemented yet.
- Public deployment has not been configured yet.

## Current architecture decision

Use:

- Next.js App Router for frontend and backend routes.
- TypeScript for all app/game logic.
- Supabase Postgres from the deployed MVP stage.
- OpenAI API server-side through an `AIProvider` abstraction.
- Anonymous session cookie instead of login for the first deploy.
- Deterministic game engine for all official game state.

## Deployment deadline assumption

The project is being optimized for a next-week deploy. Because of that, persistence must be implemented earlier than the original long phase plan.

Do not deploy a public version that depends only on in-memory game state.

## Active fast-track order

Use this order for the next-week MVP:

1. Next.js scaffold and basic mobile UI.
2. Supabase schema and anonymous session persistence.
3. Classic Mode deterministic game engine.
4. Game screen and state-driven UI.
5. OpenAI Game Director with validated structured output.
6. Result page and simple share text.
7. Vercel deployment, environment variables, and basic rate limits.

## Completed

- Repo created: `Sohan40/trust-no-bot`.
- Planning docs added.
- `AGENTS.md` added for Codex instructions.
- Issue backlog created.
- Persistent memory docs added.
- Issue #2 app foundation implemented:
  - `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts`, `.gitignore`
  - `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/game/page.tsx`
  - `components/game/GameShell.tsx`, `PlayerCard.tsx`, `Transcript.tsx`, `ActionPanel.tsx`
  - `lib/game/types.ts`, `lib/game/mock-state.ts`
  - `lib/ai/provider.ts`, `lib/ai/mock-provider.ts`
  - `lib/types/index.ts`
- Issue #33 Supabase persistence foundation implemented:
  - `@supabase/supabase-js` dependency added.
  - `supabase/migrations/20260623062909_issue_33_persistence.sql`
  - `lib/db/client.ts`, `lib/db/types.ts`, `lib/db/repositories.ts`
  - `lib/session/anonymous-session.ts`
  - `.env.example` updated with Supabase variables.
  - `docs/database_schema.md` updated with migration status.
  - PR #36 review fix added `loadGameStateForSession`, `updateGameForSession`, and `assertGameBelongsToSession`.
- Issue #3 Classic Mode deterministic engine and API implemented:
  - `lib/game/roles.ts`, `random.ts`, `actions.ts`, `voting.ts`, `win-conditions.ts`, `state-machine.ts`, `public-state.ts`, `persistence.ts`, and `server-persistence.ts`
  - `app/api/game/start/route.ts`
  - `app/api/game/[gameId]/route.ts`
  - `app/api/game/action/route.ts`
  - `app/api/game/vote/route.ts`
  - `lib/game/classic-engine.test.ts`
  - `vitest.config.ts`
  - `npm test` script
- Issue #38 persisted Classic UI implemented:
  - Landing `Start Game` calls `POST /api/game/start` and navigates to `/game/[gameId]`.
  - Dynamic game route loads `VisibleGameState` through `GET /api/game/[gameId]`.
  - Phase controls submit advance, question, and vote requests to the existing API routes.
  - Loading, retry, action-error, completed result, and role-reveal states are rendered.
  - AI role/team fields remain hidden in the UI until the game is completed.

## In progress

- Issue #38 persisted game UI wiring and its engine correctness review fixes are implemented and verified locally.

## Next recommended issue

Implement the OpenAI Game Director with validated structured output and safe mocked fallbacks.

The next task should replace deterministic placeholder dialogue without changing official game truth, persistence ownership, or the browser action contracts.

## Important constraints

- Do not build multiplayer yet.
- Do not build payments yet.
- Do not add login before anonymous play works.
- Do not rely on in-memory game state for public deployment.
- Do not let AI output control official game truth.
- Do not reveal secret role data in the UI before allowed reveal.
- Do not commit API keys or local secrets.

## What works locally

- `npm run typecheck` passes.
- `npm test` passes with 14 deterministic engine tests, including night/day dead-human termination and shuffled-order target stability regressions.
- `npm run build` passes and includes `/game/[gameId]` as a dynamic route.
- `npm run dev -- --port 4318` serves the API-backed browser flow.
- Live Supabase browser verification passed:
  - landing start created a persisted game and navigated to its dynamic route
  - refresh reloaded the same game and phase through the anonymous session cookie
  - advance, question, skip, and vote actions updated persisted state
  - the game reached completion and revealed every role
  - AI roles were absent before completion
  - invalid game loading rendered a retry/error state without crashing
  - desktop 1280x800 and mobile 390x844 layouts were visually checked

## Known risks or bugs

- Browser interaction coverage is currently manual; no automated component or browser test suite exists yet.
- No real OpenAI integration exists yet.
- AI dialogue is intentionally mocked with deterministic placeholder messages.
- The in-app browser surface was unavailable, so Playwright CLI provided desktop/mobile interaction and screenshot verification.
- Public browser clients must not query hidden-role tables directly; RLS is enabled and repository access uses the server-only service role key.
- Route handlers must not call service-role helpers with only a user-controlled `gameId`; use `loadGameStateForSession`, `updateGameForSession`, or `assertGameBelongsToSession`.
- Hidden AI role/team data is filtered out of API-visible state until game over.
- Stable player ID sorting is the current deterministic target-order key; a dedicated seat index remains a possible later schema improvement.
- Unexpected API failures do not expose raw environment, Supabase, Postgres, or implementation error messages to clients.

## What Codex must update after every task

Codex must update this file after every implementation task with:

- what changed
- what files were created or modified
- what works locally
- what is pending
- next recommended task
- any known risks or bugs
