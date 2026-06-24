# 2026-06-23: Issue #4 OpenAI Game Director

## What changed

Replaced static discussion and question-response dialogue in the persisted game flow with a server-only OpenAI Game Director.

## Implementation

- Added the official `openai` SDK and `zod`.
- Added a server-only Responses API provider using `OPENAI_API_KEY` and optional `OPENAI_MODEL`.
- Added strict Game Director input/output schemas and compact prompt constraints.
- Added one-call orchestration for day discussions and non-empty human questions.
- Added runtime validation for living speakers, word limits, player references, unsafe content, and direct named-player role/team attribution.
- Added a deterministic `MockAIProvider` fallback for provider failures or invalid output.
- Updated the state machine to accept only public speaker/text/intent lines after validation.
- Kept memory updates, suspicion deltas, and suggested votes advisory; issue #4 does not apply them.

## Game-truth boundary

Model output cannot set roles, teams, alive state, phases, eliminations, votes, or winners. Strict schemas reject extra truth-changing fields, and the deterministic engine remains the only state-transition authority.

## Hidden-state boundary

Hidden roles and compact private context are included only in the server-side Game Director input. Existing `VisibleGameState` filtering still removes AI role/team fields and non-recipient private messages before game over.

The review hardening rejects direct assertions such as `Riya is Mafia`, negated role claims, investigation-style claims, and team attribution for every named player and every Classic role/team. Behavioral suspicion such as `Riya feels suspicious` remains valid.

## Verification

- `npm run typecheck`
- `npm test` (34 tests)
- `npm run build`
- No live OpenAI request was required; provider behavior is covered with mock and invalid-output tests.

## Not included

- Persisting memory or suspicion updates.
- Using model-suggested votes.
- One-call-per-agent mode.
- Non-OpenAI providers.
- Voice, payments, auth, multiplayer, public feed, custom characters, or new roles.

## Next task

Finish the result/share-text experience, then prepare Vercel deployment with environment variables, rate limits, and AI usage monitoring.
