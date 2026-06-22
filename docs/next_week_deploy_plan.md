# Next-week Deploy Plan

This plan overrides the slower prototype roadmap when the goal is to deploy a usable MVP quickly.

## Deployment target

A public Vercel deployment where a user can:

1. open the landing page
2. start a Classic Mode game
3. play through a basic day/night/vote loop
4. refresh without losing the game
5. see a result page
6. share a simple text result

## Required stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres
- OpenAI API through server-side provider
- Anonymous session cookie
- Vercel deployment

## Fast-track milestones

## Milestone 1: App scaffold

Deliver:

- landing page
- `/game` shell
- mobile-first layout
- mock players
- mock transcript
- basic game types

Do not include:

- OpenAI
- payments
- multiplayer

## Milestone 2: Supabase persistence

Deliver:

- Supabase setup docs
- database migrations
- `games`
- `game_players`
- `game_messages`
- `game_votes`
- `night_actions`
- `game_results`
- `anonymous_sessions`
- basic repository functions in `lib/db`

Reason:

Public deploy must not lose active games on refresh.

## Milestone 3: Classic game engine

Deliver:

- role assignment
- night resolution
- vote validation
- elimination
- win/loss logic
- deterministic tests

The game engine must work without OpenAI.

## Milestone 4: Game UI connected to state

Deliver:

- phase header
- player cards
- transcript
- action panel
- vote panel
- result route

## Milestone 5: OpenAI Game Director

Deliver:

- `AIProvider` interface
- `MockAIProvider`
- `OpenAIProvider`
- structured output schema
- safe fallback on model failure

The model generates dialogue only. It does not own game truth.

## Milestone 6: Vercel deployment

Deliver:

- `.env.example` updated
- Vercel env checklist
- Supabase env checklist
- OpenAI key setup note
- basic rate limits
- smoke test after deploy

## Hard scope limits

Do not build before first deploy:

- real-time multiplayer
- payments
- voice mode
- public feed
- accounts/login
- leaderboards
- custom characters
- multiple AI providers
- advanced analytics

## Launch acceptance criteria

The MVP is deployable only when:

- game state survives refresh
- no API key is exposed in client bundle
- secret role data is not leaked early
- game can finish with a result
- AI failure does not corrupt game state
- mobile UI is usable
- basic daily usage limit exists or is clearly planned before wider sharing