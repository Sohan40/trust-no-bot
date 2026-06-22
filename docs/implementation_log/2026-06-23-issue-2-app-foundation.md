# 2026-06-23: Issue #2 App Foundation

## What changed

Implemented the Phase 0 app scaffold for Trust No Bot.

## Files added

- `.gitignore`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.ts`
- `postcss.config.mjs`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/game/page.tsx`
- `components/game/GameShell.tsx`
- `components/game/PlayerCard.tsx`
- `components/game/Transcript.tsx`
- `components/game/ActionPanel.tsx`
- `lib/game/types.ts`
- `lib/game/mock-state.ts`
- `lib/ai/provider.ts`
- `lib/ai/mock-provider.ts`
- `lib/types/index.ts`

## What works

- Landing page renders the hook: `Can you catch an AI lying?`
- Start Game navigates to `/game`.
- `/game` renders a mobile-first static Classic Mode shell with player cards, transcript, action panel, and vote preview.
- Game types and deterministic mock state exist for scaffold rendering.
- AI provider interface and mock provider stub exist without real OpenAI calls.

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run dev -- --port 4317` started successfully outside the restricted process sandbox.
- Clean production server smoke check returned 200 for `/` and `/game`.

## Scope intentionally not included

- Supabase persistence.
- Authentication.
- Real OpenAI calls.
- API routes.
- Deterministic game loop.
- Multiplayer.
- Payments.

## Next task

Implement issue #33 for Supabase schema, anonymous sessions, and refresh-safe persistence before adding OpenAI integration or public deployment.
