# Current State

Last updated: 2026-06-24

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
- A swappable `AIProvider`, deterministic `MockAIProvider`, and server-only `OpenAIProvider` are implemented.
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
- The Game Director uses one structured OpenAI Responses API call per day discussion or human question, with Zod validation and mocked fallback dialogue.
- Model output can provide dialogue and advisory memory/suspicion/vote data, but only validated public dialogue is currently applied.
- Unsafe questions and direct named-player role/team attribution are rejected before they reach browser-visible state, while ordinary suspicion language remains allowed.
- Issue #34 deployment readiness is implemented with lazy server environment validation, a complete Vercel setup guide, and a production smoke checklist.
- Missing Supabase runtime configuration produces clear server-side errors without exposing details through API responses; missing OpenAI configuration uses the safe mocked-dialogue fallback.
- The configured production deployment is live at `https://trust-no-bot.vercel.app` on Vercel project `trust-no-bot`.
- Issue #42 adds atomic anonymous-session limits: 3 game starts per day, 30 Game Director attempts per day, and 5 non-empty questions per game.
- Game/AI counters reset when the persisted database date changes, and AI attempts record provider/model/purpose in `ai_usage_events` before the model call.

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
- Issue #4 OpenAI Game Director implemented:
  - Server-only OpenAI Responses API provider using `OPENAI_API_KEY` and optional `OPENAI_MODEL`.
  - Strict Zod input/output schemas, compact prompts, safety checks, and deterministic fallback provider.
  - Day discussion and question response generation integrated into the persisted action route.
  - Engine accepts only validated public dialogue lines; roles, life state, votes, phases, and winners remain deterministic.
- Issue #34 Vercel deployment readiness implemented:
  - `lib/env/config.ts` and `lib/env/server.ts` centralize lazy environment validation.
  - `.env.example` documents browser-visible and server-only configuration.
  - `docs/deployment.md` covers Vercel setup, Supabase/OpenAI variables, safety checks, and the production smoke test.
  - Environment tests cover clear missing-variable errors and namespace boundaries.
- Issue #42 anonymous usage limits implemented:
  - Atomic service-role-only Supabase claim functions prevent concurrent requests from bypassing the final slot.
  - Start and action routes return safe 429 errors before creating games or calling the Game Director.
  - Environment overrides are optional; safe defaults apply when omitted.
  - Usage-limit tests cover daily reset, all exceeded limits, safe responses, and normal under-limit behavior.

## In progress

- Issue #42 is implemented locally and its migration is applied; PR review, deployment, and Preview 429 smoke testing remain.

## Next recommended issue

Review, merge, and deploy issue #42, then run the documented Preview 429 smoke check before wider sharing.

The next task must preserve anonymous-session ownership, hidden-role filtering, and the deterministic game-truth boundary.

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
- `npm test` passes with 46 engine, Game Director, environment, and usage-limit tests, including daily reset, safe 429 responses, and normal under-limit gameplay.
- `npm run build` passes without `.env.local` or production secrets and includes `/game/[gameId]` as a dynamic route.
- Environment validation tests confirm missing values are reported server-side without secret values, and server-only variables remain outside the `NEXT_PUBLIC_*` namespace.
- `npm run dev -- --port 4318` serves the API-backed browser flow.
- Live Supabase browser verification passed:
  - landing start created a persisted game and navigated to its dynamic route
  - refresh reloaded the same game and phase through the anonymous session cookie
  - advance, question, skip, and vote actions updated persisted state
  - the game reached completion and revealed every role
  - AI roles were absent before completion
  - invalid game loading rendered a retry/error state without crashing
  - desktop 1280x800 and mobile 390x844 layouts were visually checked
- Production Vercel smoke verification passed at `https://trust-no-bot.vercel.app`:
  - landing page returned 200
  - start game returned 201 and set an anonymous session cookie
  - refresh loaded the same persisted game with 200
  - phase advancement reached player questioning and voting
  - a live OpenAI request was attempted; invalid advisory memory output was rejected and mocked dialogue safely replaced it
  - voting completed a game, rendered a result, revealed all seven roles after game over, and persisted the completed state across reload
  - no hidden AI role/team fields appeared before game over
- Vercel runtime logs contained no HTTP 500 responses during the smoke window
- The issue #42 Supabase migration is applied and a rolled-back SQL verification passed game, AI action, question, daily reset, and usage-event assertions.

## Known risks or bugs

- Browser interaction coverage is currently manual; no automated component or browser test suite exists yet.
- Automated Game Director tests use mock providers; a live OpenAI response smoke test is still recommended before public deployment.
- Anonymous-cookie limits reduce accidental/database/OpenAI abuse but can be bypassed by clearing cookies; they are not IP- or identity-based rate limiting.
- AI usage events count reserved provider attempts, including failed calls that use fallback, and currently store null token/cost values.
- The live OpenAI smoke request fell back because the model returned an invalid memory update. This was safely contained, but continued fallback frequency should be monitored.
- Memory updates, suspicion deltas, and suggested votes are validated but intentionally not persisted or applied in issue #4.
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
