# Current State

Last updated: 2026-06-23

## Current goal

Deploy a working Trust No Bot Classic Mode MVP by next week.

## Current implementation status

- Repository planning docs exist.
- GitHub issue backlog exists.
- Phase 0 app scaffold has been implemented for issue #2.
- Next.js App Router, TypeScript, Tailwind CSS, and a mobile-first UI shell are in place.
- Landing page renders the hook and links to `/game`.
- `/game` renders a static Classic Mode room shell with public player cards, transcript, action panel, and vote preview.
- Deterministic mock game state exists for scaffold/demo rendering only.
- `AIProvider` and `MockAIProvider` stubs exist, with no real OpenAI calls.
- Supabase persistence foundation has been implemented for issue #33.
- Database migrations now define games, players, messages, votes, night actions, results, anonymous sessions, and AI usage events.
- Server-only Supabase repository functions exist under `lib/db`.
- Anonymous session cookie helpers exist under `lib/session`.
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

## In progress

- Preparing the issue #33 persistence PR.

## Next recommended issue

Implement the Classic Mode deterministic game engine and thin API routes that use the new Supabase repositories.

The next task should connect game creation/loading to persistence while preserving:

- TypeScript game logic as the source of rules.
- Server-side filtering so hidden roles do not leak to the browser.
- Anonymous session ownership checks before loading a game.

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
- `npm run build` passes.
- `npm run dev -- --port 4317` starts successfully when run outside the restricted process sandbox.
- Production server smoke check after a clean build:
  - `/` returned 200 and included `Can you catch an AI lying?`
  - `/game` returned 200 and included `Classic Room` and `Transcript`
- Issue #33 additions typecheck locally.

## Known risks or bugs

- Current UI still reads mock local state and is not wired to Supabase yet.
- No Supabase project credentials are present locally, so live database migration/application was not executed in this workspace.
- No real game engine, API routes, voting resolution, night actions, or win conditions exist yet.
- No real OpenAI integration exists yet.
- The in-app browser connector failed in this environment with a sandbox metadata error, so final visual verification used HTTP smoke checks instead.
- Public browser clients must not query hidden-role tables directly; RLS is enabled and repository access uses the server-only service role key.

## What Codex must update after every task

Codex must update this file after every implementation task with:

- what changed
- what files were created or modified
- what works locally
- what is pending
- next recommended task
- any known risks or bugs
