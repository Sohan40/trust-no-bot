# Trust No Bot

**Trust No Bot** is an AI-powered single-player-first Mafia / social deduction web game.

The core hook:

> Can you catch an AI lying?

Players enter a room with AI-controlled characters. Some characters are secretly Mafia. The human questions them, watches accusations unfold, votes carefully, and tries to survive deception.

This repo is intentionally planned phase-wise so Codex can implement it safely without guessing product direction.

## Product direction

Trust No Bot should feel like:

- Mafia / Werewolf social deduction
- a tense group chat
- Among Us-style suspicion
- AI agents with personalities, memory, and hidden motives

It should **not** feel like a generic chatbot demo.

## Current delivery goal

The current goal is to deploy a usable Classic Mode MVP by next week.

Because of that, the implementation is using a fast-track deployment plan:

1. Next.js scaffold and basic mobile UI
2. Supabase schema and anonymous session persistence
3. Classic Mode deterministic game engine
4. Game screen and state-driven UI
5. OpenAI Game Director with validated structured output
6. Result page and simple share text
7. Vercel deployment, environment variables, and basic rate limits

Do not deploy a public version that depends only on in-memory game state.

## MVP strategy

Do not start with real-time multiplayer. The first strong version is:

- 1 human player
- 6 AI players
- Classic Mafia rules
- deterministic backend game engine
- AI-generated dialogue only
- persistent game state
- shareable game results

The backend owns truth. The AI only produces dialogue, suspicion reasoning, memories, and flavor.

## Recommended stack

Initial implementation should use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or simple local UI primitives
- OpenAI API through a provider abstraction
- Supabase/Postgres for deployed MVP persistence
- Anonymous session cookie before login
- Vitest for game logic tests
- Playwright later for smoke tests

## Documentation map

Start here:

- [`AGENTS.md`](./AGENTS.md) - operating instructions for Codex and AI coding agents
- [`docs/current_state.md`](./docs/current_state.md) - current implementation status and next task
- [`docs/codex_memory.md`](./docs/codex_memory.md) - persistent project memory for Codex
- [`docs/decisions/0001-backend-choice.md`](./docs/decisions/0001-backend-choice.md) - backend architecture decision
- [`docs/decisions/0002-next-week-deployment-fast-track.md`](./docs/decisions/0002-next-week-deployment-fast-track.md) - deploy-fast decision
- [`docs/product_brief.md`](./docs/product_brief.md) - product vision and positioning
- [`docs/phasewise_plans.md`](./docs/phasewise_plans.md) - full phased build plan
- [`docs/game_rules.md`](./docs/game_rules.md) - deterministic rules and state machine
- [`docs/gameplay_modes.md`](./docs/gameplay_modes.md) - Classic, Detective, Mafia, Chaos, Daily Challenge, Multiplayer
- [`docs/ai_agents.md`](./docs/ai_agents.md) - AI character/personality/memory design
- [`docs/ai_prompting.md`](./docs/ai_prompting.md) - Game Director prompting and output schemas
- [`docs/architecture.md`](./docs/architecture.md) - app architecture
- [`docs/database_schema.md`](./docs/database_schema.md) - persistence plan
- [`docs/api_contracts.md`](./docs/api_contracts.md) - API route contracts
- [`docs/ui_ux_spec.md`](./docs/ui_ux_spec.md) - screens and UX behavior
- [`docs/safety_and_moderation.md`](./docs/safety_and_moderation.md) - safety boundaries
- [`docs/monetization.md`](./docs/monetization.md) - pricing and premium ideas
- [`docs/codex_workflow.md`](./docs/codex_workflow.md) - how to implement with Codex using issues
- [`docs/launch_plan.md`](./docs/launch_plan.md) - alpha/beta launch plan
- [`docs/deployment.md`](./docs/deployment.md) - Vercel environment setup and production smoke checklist

## Codex memory rule

Codex should not rely on chat history. Project memory lives in repo files.

Before every task, Codex must read:

1. `AGENTS.md`
2. `docs/current_state.md`
3. `docs/codex_memory.md`
4. the relevant GitHub issue

After every task, Codex must update `docs/current_state.md`.

## Issue-driven implementation

Implementation is tracked in GitHub issues. Start with:

1. Phase 0 - repository scaffold and app foundation
2. Fast-track persistence - Supabase schema and anonymous sessions
3. Phase 1 - Classic single-player AI Mafia playable loop
4. Phase 2 - OpenAI Game Director integration
5. Phase 3 - memory, suspicion, and personality system
6. Phase 4+ - additional modes after MVP deploy

Each issue should be implemented in its own branch/PR.

## Non-negotiable engineering rule

The LLM must never be the source of game truth.

The deterministic game engine decides:

- roles
- night actions
- kills
- saves
- detective results
- votes
- eliminations
- win conditions

The LLM may generate:

- dialogue
- accusations
- defenses
- suspicion reasoning
- short memory updates
- post-game summaries

## Status

Planning and persistent Codex memory are initialized. Code implementation has not started yet.
