# Codex Persistent Memory

This file is the repo-owned memory for Codex and other AI coding agents.

Codex should read this file before every task.

## Project identity

Trust No Bot is an AI-powered single-player-first Mafia/social deduction web game.

The core hook:

> Can you catch the hidden AI opponent?

The user plays against AI characters in a group-chat-style game. Some characters have secret roles. The user asks questions, reads behavior, votes, and sees a post-game reveal.

## Current MVP target

Deploy a usable Classic Mode MVP by next week.

MVP means:

- user can start a game
- user can see role reveal
- user can play day/night/voting loop
- game state survives refresh
- OpenAI generates dialogue
- deterministic code owns official rules
- user can see result page
- app can be deployed to Vercel

## Backend decision

Use Next.js API routes/server actions first.

Use Supabase Postgres for deployed MVP persistence.

Do not use a separate Express/FastAPI backend yet.

Do not rely on in-memory game state for public deployment.

## AI decision

Use OpenAI through an `AIProvider` interface.

The AI provider may generate:

- character dialogue
- compact memory updates
- suspicion reasoning
- suggested AI votes
- result explanation

The AI provider must not decide official game truth.

The deterministic game engine owns:

- roles
- phase transitions
- night actions
- saves
- investigations
- votes
- eliminations
- win/loss

## First deployed mode

Classic Mode only.

Initial setup:

- 1 human
- 6 AI players
- 1 hidden opponent role
- 1 Detective
- 1 Doctor
- 4 Villagers

Other modes are later.

## Current priorities

1. App scaffold.
2. Supabase schema and persistence.
3. Classic deterministic game loop.
4. Mobile-first game UI.
5. OpenAI Game Director.
6. Result page and simple sharing.
7. Vercel deployment.

## Do not build yet

- real-time multiplayer
- payments
- voice mode
- public feed
- comments
- leaderboards
- custom character creator
- multiple AI providers
- one-call-per-agent mode
- complex auth

## Coding rules

- Keep game logic in `lib/game`, not inside React components.
- Keep route handlers thin.
- Validate all generated output before use.
- Use mock AI provider for tests.
- Keep UI mobile-first.
- Add tests for rule changes.
- Update docs when behavior changes.
- Never commit secrets.

## End-of-task requirement

After every Codex task, update:

- `docs/current_state.md`
- relevant decision record if architecture changed
- relevant implementation log entry

Add the exact next recommended task.