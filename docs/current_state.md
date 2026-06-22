# Current State

Last updated: 2026-06-22

## Current goal

Deploy a working Trust No Bot Classic Mode MVP by next week.

## Current implementation status

- Repository planning docs exist.
- GitHub issue backlog exists.
- Code scaffold has not started yet.
- Supabase persistence has not been implemented yet.
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

## In progress

- Preparing repo for Codex implementation before local clone.

## Next recommended issue

Start with GitHub issue #2, but adapt it to the next-week deploy plan:

- scaffold Next.js app
- create basic UI shell
- create game types and mock state
- also create/keep docs current

Then immediately add a Supabase persistence issue/PR before OpenAI integration.

## Important constraints

- Do not build multiplayer yet.
- Do not build payments yet.
- Do not add login before anonymous play works.
- Do not rely on in-memory game state for public deployment.
- Do not let AI output control official game truth.
- Do not reveal secret role data in the UI before allowed reveal.
- Do not commit API keys or local secrets.

## What Codex must update after every task

Codex must update this file after every implementation task with:

- what changed
- what files were created or modified
- what works locally
- what is pending
- next recommended task
- any known risks or bugs