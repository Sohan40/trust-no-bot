# ADR 0001: Backend Choice

Date: 2026-06-22

## Status

Accepted

## Decision

Use Next.js App Router with API routes/server actions as the backend for the MVP.

Use Supabase Postgres for persistence once the app is prepared for public deployment.

Use OpenAI server-side through a provider abstraction.

Do not create a separate Express, FastAPI, or microservice backend for the MVP.

## Context

Trust No Bot needs:

- game state transitions
- persistent sessions
- AI dialogue generation
- result pages
- simple deployment

A separate backend would add complexity before the product is validated.

Next.js API routes are enough for the first deployed MVP.

## Consequences

Positive:

- faster to ship
- simpler deployment on Vercel
- easier for Codex to work in one repo
- no extra backend hosting
- frontend/backend types can be shared

Negative:

- long-running real-time multiplayer will need later architecture work
- serverless constraints must be respected
- database persistence must be clean because process memory is unreliable

## Implementation notes

- Keep route handlers thin.
- Put game logic in `lib/game`.
- Put AI provider logic in `lib/ai`.
- Put database access in `lib/db`.
- Do not store official game state only in memory for deployed usage.