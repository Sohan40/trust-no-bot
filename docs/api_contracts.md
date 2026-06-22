# API Contracts

This document describes planned API routes. Exact implementation may change, but keep contracts documented.

## POST /api/game/start

Starts a new game.

Request:

```json
{
  "mode": "classic",
  "difficulty": "normal",
  "theme": "classic"
}
```

Response:

```json
{
  "gameId": "uuid",
  "phase": "ROLE_REVEAL",
  "humanPlayerId": "uuid",
  "publicPlayers": [],
  "privateInfo": {
    "role": "Villager"
  }
}
```

## GET /api/game/:gameId

Returns current visible game state.

Response:

```json
{
  "game": {},
  "publicPlayers": [],
  "messages": [],
  "availableActions": [],
  "privateInfo": {}
}
```

## POST /api/game/action

Submits a phase action.

Examples:

- choose a night action target
- ask a question
- advance discussion

Request:

```json
{
  "gameId": "uuid",
  "actionType": "ASK_QUESTION",
  "payload": {
    "targetPlayerId": "uuid",
    "question": "Why did you vote for Tara?"
  }
}
```

Response:

```json
{
  "game": {},
  "newMessages": [],
  "availableActions": []
}
```

## POST /api/game/vote

Submits human vote.

Request:

```json
{
  "gameId": "uuid",
  "targetPlayerId": "uuid"
}
```

Response:

```json
{
  "voteAccepted": true,
  "phase": "ELIMINATION"
}
```

## POST /api/game/respond

Server-side route or service for generating AI dialogue.

Request:

```json
{
  "gameId": "uuid",
  "purpose": "DAY_DISCUSSION"
}
```

Response:

```json
{
  "messages": [],
  "memoryUpdatesApplied": true,
  "suspicionUpdatesApplied": true
}
```

## GET /api/results/:gameId

Returns game-over result.

Response:

```json
{
  "gameId": "uuid",
  "winner": "villagers",
  "roles": [],
  "summary": "...",
  "stats": {},
  "shareText": "..."
}
```

## API rules

- Client must not receive secret role data before allowed reveal.
- Client must not submit actions for AI players.
- API must validate current phase before accepting action.
- API must reject actions for inactive players.
- API must not trust client-provided role/team data.
- API should return clear error codes for invalid actions.

## Error response shape

```json
{
  "error": {
    "code": "INVALID_PHASE",
    "message": "Voting is not available during this phase."
  }
}
```

## Future auth

Early MVP can use anonymous session cookies.

Do not require login for first play.