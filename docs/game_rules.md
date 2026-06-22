# Game Rules Specification

The game engine must be deterministic. The AI model may generate dialogue, but it must not decide the true outcome of rules.

## Core entities

### Player

A player has:

- id
- display name
- isHuman
- role
- alive/dead state
- personality profile
- memory summary
- suspicion map

### Role

Initial roles:

- Mafia
- Detective
- Doctor
- Villager

Future roles:

- Jester
- Lawyer
- Influencer
- Ghost
- Framer

### Phase

Recommended phases:

```text
LOBBY
ROLE_REVEAL
NIGHT_ACTIONS
NIGHT_RESOLUTION
DAY_DISCUSSION
PLAYER_QUESTION
AI_RESPONSES
VOTING
ELIMINATION
WIN_CHECK
GAME_OVER
```

## Classic Mode setup

Initial MVP:

- 1 human
- 6 AI players
- 1 Mafia
- 1 Detective
- 1 Doctor
- 4 Villagers

For the first implementation, human can default to Villager in Classic Mode. Later, allow random human role or selectable modes.

## Night phase

During night:

- Mafia chooses an alive non-Mafia target.
- Doctor chooses an alive target to protect.
- Detective chooses an alive target to inspect.

For AI-controlled actions, deterministic helper logic can choose targets before the Game Director produces narrative.

## Night resolution

Rules:

- If Mafia target equals Doctor protected target, nobody dies.
- Otherwise Mafia target dies.
- Detective receives private result: Mafia or Not Mafia.
- Dead players cannot act.
- Dead players cannot be targeted unless a future role explicitly allows it.

## Day discussion

The Game Director generates public messages from alive players only.

The model may use:

- public transcript
- public behavior
- hidden roles where needed for role-consistent speech
- private memories
- suspicion scores

The model must not reveal hidden roles directly before game over.

## Player question

The human can ask a question to:

- one specific player
- all players
- a subset of players later

The Game Director responds through the relevant AI characters.

## Voting

Rules:

- Only alive players vote.
- Each alive player gets one vote unless a special role changes this.
- Human vote is selected in UI.
- AI votes can be suggested by AI output but must be validated by deterministic code.
- Ties can be handled by one of these MVP choices:
  - no elimination on tie
  - revote
  - random among tied players using game seed

Recommended MVP: no elimination on tie.

## Elimination

The player with most votes is eliminated.

Reveal rule options:

- Beginner: reveal eliminated role.
- Normal: reveal only at game over.
- Debug: always reveal.

Recommended MVP: reveal at game over, with optional dev toggle.

## Win conditions

Villagers win when all Mafia players are eliminated.

Mafia wins when Mafia count is greater than or equal to non-Mafia alive count.

Jester future rule: Jester wins if voted out.

## State transition guardrails

Reject invalid actions:

- voting outside voting phase
- voting for dead players
- night action outside night phase
- targeting invalid players
- acting as dead player
- moving phases out of order

## Testing checklist

Test:

- role assignment count
- no duplicate player ids
- Mafia target selection
- Doctor save prevents kill
- Detective gets correct private result
- dead players cannot vote
- tie vote behavior
- villagers win
- mafia win
- game over freezes state changes

## Engineering warning

If a model response says someone died, changed roles, or won, treat it as flavor only unless deterministic code confirms it.