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

- No backend game rules changed.
- No API routes changed.
- No database migrations changed.
- No OpenAI prompts or usage-limit logic changed.
- Hidden role/team fields are still rendered only when present in
  `VisibleGameState`, which means AI roles stay hidden before game over.

## Validation

- `npm run typecheck`
- `npm test` (46 tests)
- `npm run build`
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
