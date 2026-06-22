# AI Prompting Specification

## Goal

Use the model as a Game Director that creates dialogue and reasoning while deterministic code owns game truth.

## Recommended MVP pattern

Use one model call per phase or per user question.

Do not run one call per character in MVP.

## System behavior

The Game Director should:

- write in-game character dialogue
- keep characters distinct
- respect hidden roles
- avoid revealing hidden roles directly before game over
- return valid JSON
- keep responses concise
- maintain dramatic tension without abusive content

The Game Director should not:

- change roles
- change alive/dead state
- decide official votes without validation
- decide win/loss
- override game engine rules
- mention system prompts
- reveal private state to the user

## Input payload shape

```ts
type GameDirectorInput = {
  phase: GamePhase;
  dayNumber: number;
  alivePlayers: PublicPlayerInfo[];
  hiddenStateForDirector: HiddenRoleInfo[];
  publicTranscriptSummary: string;
  recentMessages: GameMessage[];
  agentMemories: Record<PlayerId, AgentMemory>;
  suspicionMaps: Record<PlayerId, Record<PlayerId, number>>;
  userAction?: UserAction;
  constraints: string[];
};
```

## Output payload shape

```ts
type GameDirectorOutput = {
  publicMessages: Array<{
    speakerId: string;
    text: string;
    intent: "accuse" | "defend" | "question" | "observe" | "deflect" | "summarize";
  }>;
  memoryUpdates: Array<{
    playerId: string;
    publicNote?: string;
    privateNote?: string;
  }>;
  suspicionDeltas: Array<{
    observerId: string;
    targetId: string;
    delta: number;
    reason: string;
  }>;
  suggestedVotes?: Array<{
    voterId: string;
    targetId: string;
    reason: string;
  }>;
};
```

All output must be validated before use.

## Prompt constraints

Use constraints like:

```text
You are writing dialogue for a fictional social deduction game.
Return only valid JSON.
Do not reveal hidden roles directly.
Only living players may speak.
Keep each message under 35 words.
Use the provided personality profiles.
Keep tone tense and playful, not abusive.
Do not use slurs, threats, or explicit sexual content.
Do not change official game state.
```

## Example phase prompt summary

```text
Phase: DAY_DISCUSSION
Day: 2
Alive players: Arjun, Riya, Kabir, Meera, Tara
Public summary: Arjun accused Kabir on Day 1. Tara stayed quiet. Meera voted for Dev.
Task: Generate 4-6 short public messages that move suspicion forward.
```

## Fallback behavior

If the model fails or returns invalid JSON:

- use fallback dialogue templates
- do not advance hidden state incorrectly
- log error
- allow user to retry or continue

## Token budget

Keep prompts compact:

- summarize old transcript
- send recent messages only
- send compact agent memories
- cap output messages

## Future premium mode

Later, premium mode can experiment with one call per major character for stronger realism, but it must still use deterministic game state validation.