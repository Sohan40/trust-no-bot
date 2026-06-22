# ADR 0002: Next-week Deployment Fast Track

Date: 2026-06-22

## Status

Accepted

## Decision

Because the goal is to deploy a usable MVP by next week, persistence moves earlier than the original long roadmap.

The original phase plan allowed local/in-memory state for early phases. That is acceptable for local prototyping, but not for a public deploy.

For the deployed MVP, use Supabase Postgres from the start of real gameplay.

## Fast-track order

1. Scaffold Next.js app.
2. Add Supabase schema and anonymous session persistence.
3. Implement Classic Mode deterministic game engine.
4. Build game UI.
5. Add OpenAI Game Director.
6. Add result page and basic sharing.
7. Deploy to Vercel.
8. Add basic rate limits and cost logging.

## Why

The game has important state:

- current phase
- player roles
- alive/inactive status
- messages
- votes
- night actions
- result reveal

If this exists only in memory, users can lose games on refresh or serverless restarts.

## Consequences

Positive:

- deployable MVP is more reliable
- result pages can work
- games can resume after refresh
- usage limits can be enforced

Negative:

- database work must happen earlier
- Phase 0/1 implementation has more setup than a throwaway prototype

## Rule for Codex

Codex may use mock/local state only for initial scaffold, but must not treat that as deploy-ready.

Before public deployment, game state must be stored in Supabase or equivalent persistent storage.