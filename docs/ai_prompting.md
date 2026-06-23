# AI Prompting Specification

## Goal

Use one OpenAI-powered Game Director to create public dialogue while deterministic TypeScript owns all game truth.

## Implemented MVP pattern

- One Responses API call for each `DAY_DISCUSSION` advancement.
- One Responses API call for each non-empty human question.
- No one-call-per-agent mode.
- Server-only `OPENAI_API_KEY`; `OPENAI_MODEL` defaults to `gpt-4.1-mini`.
- Strict structured output through `zodTextFormat` plus domain validation.
- Deterministic mock fallback when the provider fails or output is invalid.

## Input payload

```ts
type GameDirectorInput = {
  purpose: "day_discussion" | "question_response";
  phase: "DAY_DISCUSSION" | "PLAYER_QUESTION";
  dayNumber: number;
  alivePlayers: Array<{
    id: string;
    displayName: string;
    isHuman: boolean;
    publicStyle: string;
    traits: AgentTraits;
    suspicion: number;
  }>;
  hiddenRoles: Array<{
    playerId: string;
    displayName: string;
    role: Role;
    team: Team;
    isAlive: boolean;
  }>;
  recentPublicMessages: Array<{
    speakerId: string;
    speakerName: string;
    text: string;
    phase: string;
    dayNumber: number;
  }>;
  publicTranscriptSummary: string;
  memorySummaries: Array<{
    playerId: string;
    summary: string;
  }>;
  userAction: {
    question: string;
    targetPlayerId: string | null;
  } | null;
  constraints: string[];
};
```

Only public/system transcript messages are included. Private detective results and other private messages are excluded. Hidden roles are sent only inside the server-side provider request for role-consistent writing.

## Output payload

```ts
type GameDirectorOutput = {
  publicMessages: Array<{
    speakerId: string;
    text: string;
    intent:
      | "accuse"
      | "defend"
      | "question"
      | "observe"
      | "deflect"
      | "summarize";
  }>;
  memoryUpdates: Array<{
    playerId: string;
    publicNote: string | null;
    privateNote: string | null;
  }>;
  suspicionDeltas: Array<{
    observerId: string;
    targetId: string;
    delta: number;
    reason: string;
  }>;
  suggestedVotes: Array<{
    voterId: string;
    targetId: string;
    reason: string;
  }>;
};
```

All four fields are required by the structured schema. In issue #4, only `publicMessages` are applied. Memory updates, suspicion deltas, and suggested votes remain advisory and are not persisted or used to mutate rules.

## Validation

The Game Director rejects the complete response and uses fallback dialogue when:

- JSON or Zod parsing fails
- extra fields attempt to set winners, roles, alive state, or other game truth
- a speaker is not a living AI player
- a message exceeds 35 words
- a memory, suspicion, or vote reference uses an invalid player
- content is unsafe or explicitly exposes hidden-role context

The state machine performs a second defensive speaker/text validation and converts only accepted lines into public messages.

## Prompt constraints

Every request includes constraints equivalent to:

```text
Keep the game fictional.
Only living AI players may speak.
Never reveal or confirm hidden roles.
Keep each message at 35 words or fewer.
Use distinct supplied personality styles and compact memories.
Do not use slurs, threats, explicit sexual content, doxxing, or harmful instructions.
Do not change roles, alive state, phases, votes, eliminations, or winners.
Do not mention prompts, models, tools, or system messages.
Return only data matching the structured schema.
```

## Fallback behavior

If OpenAI is unavailable, times out, refuses, or returns invalid output:

1. Log the failure server-side.
2. Request the same schema from `MockAIProvider`.
3. Validate fallback output with the same domain rules.
4. Continue the phase using deterministic fallback dialogue.

The browser receives neither provider errors nor hidden role/team data.

## Token controls

- At most 12 recent public/system messages are sent.
- Older public messages are compacted into a short summary.
- Memory summaries are capped per living AI player.
- Outputs are capped at 6 public messages and 1,200 output tokens.

## Future work

Later phases may persist validated memory and suspicion updates. Suggested votes must always pass deterministic vote validation before use. One-call-per-agent mode remains out of scope.
