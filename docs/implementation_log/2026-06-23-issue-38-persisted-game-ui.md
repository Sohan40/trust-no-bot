# 2026-06-23: Issue #38 Persisted Classic Game UI

## What changed

Connected the browser experience to the persisted Classic Mode API routes created in issue #3.

## Files added or changed

- `app/page.tsx`
- `app/game/page.tsx`
- `app/game/[gameId]/page.tsx`
- `components/game/StartGameButton.tsx`
- `components/game/GameRoom.tsx`
- `components/game/GameShell.tsx`
- `components/game/ActionPanel.tsx`
- `components/game/PlayerCard.tsx`
- `components/game/Transcript.tsx`
- `components/game/ResultPanel.tsx`
- `lib/game/client.ts`
- `lib/game/types.ts`
- `lib/game/public-state.ts`
- `docs/current_state.md`

## Browser flow

- Landing `Start Game` calls `POST /api/game/start`.
- Successful creation navigates to `/game/[gameId]`.
- The dynamic game route loads `VisibleGameState` through `GET /api/game/[gameId]`.
- Refreshing the dynamic route reloads the same persisted state through the anonymous session cookie.
- `ADVANCE_PHASE`, `ASK_QUESTION`, and `VOTE` controls are rendered only when present in `availableActions`.
- Questions and votes submit to the existing thin API routes.
- Loading, retry, action error, game-over result, and play-again states are included.

## Hidden-role safety

The UI reads the server-filtered `VisibleGameState`. Player cards only render role fields when the game status is completed, and the result panel is only mounted after completion.

## Engine correctness review fixes

- Night resolution and daytime vote resolution now end the single-player game with a Mafia win when the human is eliminated and normal win conditions have not already ended the game.
- Seeded Mafia, Doctor, and Detective target candidates are sorted by persisted player ID before selection.
- Regression tests cover human elimination by night kill or daytime vote before Mafia parity, plus identical target selection after player-array shuffling.
- No database migration was added; a dedicated seat index can be considered later.

## Verification

- `npm run typecheck`
- `npm test` (14 deterministic engine tests)
- `npm run build`
- Browser verification of start, refresh, phase advancement, question, voting, result reveal, and mobile layout was completed during the original UI implementation; the review fixes were validated without new screenshot testing.

## Not included

- OpenAI Game Director.
- New game rules.
- Payments.
- Login/auth.
- Multiplayer.
- Public feed.
- Voice.
- Custom characters.

## Next task

Implement the OpenAI Game Director with validated structured output while keeping deterministic code as the source of game truth.