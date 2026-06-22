# Phase-wise Implementation Plan

This document is the main build roadmap. Each phase should map to one or more GitHub issues and small PRs.

## Phase 0: Repo scaffold and app foundation

Goal: create the basic app shell.

Tasks:

- Set up Next.js + TypeScript.
- Add Tailwind CSS.
- Create landing page.
- Create `/game` page shell.
- Add basic game layout: players, transcript, action panel.
- Add initial TypeScript types.
- Add mock game state.

Done when:

- app runs locally
- user can open landing page and game page
- no real AI or database required

## Phase 1: Classic single-player loop

Goal: playable local game loop.

Game setup:

- 1 human
- 6 AI players
- roles: Mafia, Detective, Doctor, Villagers

Tasks:

- deterministic role assignment
- night actions
- day discussion placeholder
- human question input placeholder
- voting
- elimination
- win/loss check
- result screen

Done when:

- one full game can be completed without AI API
- tests cover win conditions and voting

## Phase 2: OpenAI Game Director

Goal: replace placeholder discussion with model-generated dialogue.

Tasks:

- add AI provider interface
- add OpenAI provider
- add mock provider for tests
- create Game Director service
- validate JSON output
- fallback on invalid output

Rules:

- model never changes game truth
- model only generates dialogue, memory notes, and public reasoning

## Phase 3: Memory, suspicion, and personalities

Goal: make AI players feel consistent.

Tasks:

- character templates
- personality traits
- compact memory summaries
- suspicion map
- public suspicion meter
- behavior knobs by difficulty

Done when:

- characters remember past accusations
- different personalities speak differently
- suspicion affects votes

## Phase 4: Detective Mode

Goal: human plays as Detective.

Tasks:

- mode selection
- human night investigation
- private clue log
- AI response to public claims

Done when:

- human can investigate one target per night
- private clues stay private until user reveals them

## Phase 5: Hidden Role Mode

Goal: human plays as the hidden Mafia role.

Tasks:

- human chooses night target
- AI characters interrogate human
- human responses affect suspicion
- AI voting can eliminate human

Done when:

- human can win as hidden role
- AI players can win by voting human out

## Phase 6: Chaos roles

Goal: add replayability.

Roles to add gradually:

- Jester
- Lawyer
- Influencer
- Ghost
- Framer
- Hacker-like role for message effects in Chaos Mode

Done when:

- Classic Mode remains stable
- each new role has tests

## Phase 7: Daily challenge and share cards

Goal: create viral loop.

Tasks:

- deterministic daily seed
- result analysis
- share text
- share image/card component
- result URL

Done when:

- daily challenge is replayable and comparable
- user can share result

## Phase 8: Persistence and limits

Goal: persist games and control cost.

Tasks:

- database schema
- anonymous session cookie
- save active game
- free daily limit
- basic analytics

Done when:

- refresh does not lose current game
- usage limits exist

## Phase 9: Monetization

Goal: add premium features after product validation.

Possible paid features:

- unlimited games
- Detective Mode
- Hidden Role Mode
- Chaos Mode
- custom themes
- no-watermark share cards

Do not build payment first.

## Phase 10: Multiplayer foundation

Goal: prepare architecture for multiplayer, not full launch.

Tasks:

- room model
- event log
- server-authoritative state
- async turn-based prototype

Do not build real-time rooms until the single-player game is fun.

## Phase 11: Safety and moderation

Goal: keep the game safe and not abusive.

Tasks:

- input filtering
- output filtering
- safe fallback state
- report flow later
- public sharing controls

## Phase 12: Testing and quality gates

Goal: prevent Codex changes from breaking rules.

Tasks:

- unit tests for game engine
- mocked AI tests
- smoke tests
- CI commands
- PR checklist

## Post-MVP ideas

Only after validation:

- public feed
- comments/reactions
- voice mode
- PWA packaging
- custom characters
- leaderboards
- replay viewer
- provider comparison
- real-time multiplayer