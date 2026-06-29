# Issue #44: Preview UI Port

Date: 2026-06-29

## Summary

Ported the `trust-no-bot-preview-44` visual direction into the real Next.js app
without replacing the persisted Supabase/OpenAI game flow.

## Changes

- Added dark interrogation-room design tokens, scanlines, amber/danger glow
  utilities, and small motion helpers in `app/globals.css`.
- Rebuilt the landing page around the preview's `trust_no_bot.exe` brand, Room
  7 badge, amber Start Game CTA, and role summary cards.
- Added a confidential role reveal card that advances through the existing
  server-backed `ADVANCE_PHASE` action.
- Restyled the game room with a sticky phase header, horizontal player rail,
  transcript bubble system, desktop side panel, and mobile sticky action panel.
- Replaced inline voting with a red danger-modal/bottom-sheet treatment that
  still submits votes through `POST /api/game/vote`.
- Added preview-style completed-game cards, role reveal grid, share card, and a
  real share/copy client button.
- Added `lucide-react` for iconography matching the preview direction.

## Preserved Boundaries

- Backend game logic changed only for the initial post-role-reveal phase:
  `ROLE_REVEAL` now enters `DAY_DISCUSSION` instead of `NIGHT_ACTIONS`.
- No API routes changed.
- No database migrations changed.
- No OpenAI prompts or usage-limit logic changed.
- Hidden role/team fields are still rendered only when present in
  `VisibleGameState`, which means AI roles stay hidden before game over.

## Follow-Up Gameplay Fix

After manual review, the remodeled UI made a pre-existing rough path obvious:
entering the room advanced to `NIGHT_ACTIONS`, so the first visible action was
`Resolve Night`. If the deterministic Mafia target was the human, the MVP
dead-human terminal rule ended the game before the player could ask or vote.

To keep the single-player MVP playable, `ROLE_REVEAL` now advances to
`DAY_DISCUSSION`. The first room action is discussion/questioning, while later
night phases and the dead-human terminal rule still work as before.

## Follow-Up Chat Pacing Fix

After manual review against the preview, discussion still felt like a batch
report because the API response was rendered all at once. `Transcript` now keeps
the full persisted message array as source of truth but reveals newly arrived
messages one at a time. Pending advance/question/vote actions show a
typing/counting indicator until the server response lands, and queued discussion
or question lines then appear with short per-message delays.

## Validation

- `npm run typecheck`
- `npm test` (46 tests)
- `npm run build`
- `npm test -- lib/game/classic-engine.test.ts` after the follow-up gameplay fix
- Local browser smoke on `http://localhost:4318`:
  - started persisted games through the real Start Game API
  - advanced through role reveal and night resolution
  - verified question input and red vote modal submit through real API actions
  - completed a real game and saw the result/role reveal
  - verified API-visible AI `role`/`team` are absent before game over and present
    after game over
  - verified the same-session game-start limit renders the safe 429 copy

## Known Follow-Up

- Add automated component or visual regression coverage later if the UI starts
  changing frequently.
- Run the production deployment smoke checklist after PR merge and Vercel
  production deployment.
