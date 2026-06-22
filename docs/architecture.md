# Architecture

## Core principle

Separate the deterministic game engine from AI dialogue generation and UI rendering.

```text
UI -> API route / action -> game engine -> AI Game Director -> validated output -> game state update -> UI
```

The game engine must be runnable without React and without the AI provider.

## Suggested app structure

```text
app/
  page.tsx
  game/page.tsx
  results/[gameId]/page.tsx
  api/
    game/
      start/route.ts
      action/route.ts
      respond/route.ts
      vote/route.ts

components/
  game/
    GameShell.tsx
    PlayerCard.tsx
    Transcript.tsx
    ActionPanel.tsx
    VotePanel.tsx
    RoleReveal.tsx
  results/
    ResultSummary.tsx
    ShareCard.tsx

lib/
  game/
    types.ts
    state-machine.ts
    roles.ts
    actions.ts
    voting.ts
    win-conditions.ts
    agents.ts
    memory.ts
    suspicion.ts
    results.ts
  ai/
    provider.ts
    mock-provider.ts
    openai-provider.ts
    game-director.ts
    prompts.ts
    schemas.ts
  db/
    client.ts
    repositories.ts
  safety/
    input-filter.ts
    output-filter.ts
```

## Game engine responsibilities

The game engine owns:

- creating games
- assigning roles
- validating actions
- resolving night actions
- collecting votes
- eliminating players
- checking wins
- creating event logs

It should expose pure functions where possible.

## AI layer responsibilities

The AI layer owns:

- creating public dialogue
- updating compact memory notes
- suggesting AI votes
- producing result explanations

The AI layer should return structured data only.

## UI responsibilities

The UI owns:

- showing current phase
- showing alive/dead players
- showing transcript
- collecting user action
- showing private clues
- showing results

The UI must not compute core game truth independently.

## Persistence strategy

Phase 0-2 can use local/in-memory state.

Phase 8 should add database persistence:

- games
- game_players
- game_messages
- game_votes
- night_actions
- game_results
- anonymous_sessions

## Provider abstraction

Define:

```ts
interface AIProvider {
  generateStructured<TInput, TOutput>(input: TInput, schemaName: string): Promise<TOutput>;
}
```

Implement:

- `MockAIProvider` for tests and early phases
- `OpenAIProvider` for production

## API design rule

API routes should call services, not contain all logic inline.

Bad:

```text
route.ts has 500 lines of game logic
```

Good:

```text
route.ts validates request -> calls game service -> returns response
```

## Cost control

MVP should use one Game Director call per phase or important user question.

Avoid one-call-per-agent until premium/advanced mode.

## Error handling

If AI fails:

- show fallback generic character responses
- allow game to continue
- log error
- never corrupt game state

If state transition fails:

- reject action
- return clear error
- do not advance phase

## Testing architecture

Core game tests should not require:

- browser
- database
- OpenAI key
- network

Use mock provider and deterministic seeds.