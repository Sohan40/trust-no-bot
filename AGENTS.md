# AGENTS.md

This file is for Codex and other AI coding agents working on Trust No Bot.

## Product summary

Trust No Bot is a single-player-first AI Mafia/social deduction web game. The user plays against AI characters with hidden roles. The fun comes from suspicion, lying, memory, accusations, and voting.

The first product goal is not multiplayer. The first product goal is a replayable single-player game where one human plays with AI agents.

## Read before coding

Before implementing any issue, read:

1. `README.md`
2. `docs/product_brief.md`
3. `docs/phasewise_plans.md`
4. `docs/game_rules.md`
5. `docs/architecture.md`
6. The specific GitHub issue being implemented

For AI-related work, also read:

- `docs/ai_agents.md`
- `docs/ai_prompting.md`
- `docs/safety_and_moderation.md`

For database/API work, also read:

- `docs/database_schema.md`
- `docs/api_contracts.md`

For UI work, also read:

- `docs/ui_ux_spec.md`

## Implementation principles

### 1. Deterministic engine owns game truth

Never let an LLM decide real game state.

Code owns:

- role assignment
- alive/dead state
- night actions
- doctor saves
- detective results
- votes
- eliminations
- win conditions
- mode rules

LLM owns:

- public dialogue
- character flavor
- suspicion reasoning
- short memory updates
- post-game explanation

### 2. Build phase-wise

Do not jump ahead. If implementing Phase 0, do not build Phase 5 features. Keep changes scoped to the issue.

### 3. Prefer small, testable modules

Core game code should be easy to test without React.

Recommended structure:

```text
lib/game/
  types.ts
  roles.ts
  state-machine.ts
  actions.ts
  voting.ts
  win-conditions.ts
  agents.ts
  memory.ts
  suspicion.ts

lib/ai/
  provider.ts
  mock-provider.ts
  openai-provider.ts
  game-director.ts
  prompts.ts
  schemas.ts
```

### 4. Keep the AI provider swappable

Use an `AIProvider` interface. Start with OpenAI, but do not hard-code OpenAI into game logic.

### 5. Validate model output

All model responses must be schema-validated before use. Invalid model output should fail gracefully with fallback messages, not crash the game.

### 6. Keep prompts compact

Do not send full transcripts forever. Use compact summaries:

- public transcript summary
- latest 10-20 messages
- player memory notes
- suspicion map
- current phase
- hidden state where necessary

### 7. Safety is part of product quality

The game can be dramatic, suspicious, sarcastic, and funny. It must not become a harassment or abuse generator.

Avoid:

- slurs
- hate
- sexual content involving minors
- doxxing
- threats
- self-harm encouragement
- real-world criminal planning
- targeted harassment of real people

### 8. Mobile-first UI

Most users will try this on mobile. The game screen must work on a phone.

### 9. No secret leakage

Before game over, the UI must never reveal hidden roles except to the appropriate player/action result. AI dialogue must not accidentally expose hidden roles.

### 10. Add tests for rule changes

Any change to roles, actions, voting, or win conditions must include tests.

## Branch/PR workflow

For each GitHub issue:

1. Create a branch named `phase-X-short-description` or `issue-N-short-description`.
2. Implement only that issue's scope.
3. Update docs if behavior changes.
4. Add/adjust tests.
5. Open a PR referencing the issue.

## Definition of done

A task is done only when:

- it implements the issue scope
- it does not break earlier phases
- TypeScript passes
- tests pass or new tests are added where relevant
- docs are updated if architecture/rules/API changed
- hidden role secrecy is preserved
- no API keys or secrets are committed

## Do not do this

- Do not build real-time multiplayer first.
- Do not use one LLM call per character in the MVP unless explicitly asked.
- Do not let LLM output mutate game truth directly.
- Do not store huge raw prompts unnecessarily.
- Do not implement payments before the core game is fun.
- Do not add complex auth before anonymous play works.
- Do not overbuild admin tools before public features exist.