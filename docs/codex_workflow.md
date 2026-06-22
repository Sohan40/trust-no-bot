# Codex Workflow

This repo is designed to be implemented issue-by-issue with Codex.

## Recommended flow

1. Pick one GitHub issue.
2. Ask Codex to read:
   - `README.md`
   - `AGENTS.md`
   - relevant docs under `docs/`
   - the issue body
3. Create a focused branch.
4. Implement only that issue.
5. Run checks.
6. Open a PR referencing the issue.

## Good Codex prompt template

```text
You are working in the Sohan40/trust-no-bot repo.

Read AGENTS.md first.
Then read the issue body for issue #X.
Then read the relevant docs under docs/.

Implement only the scope of issue #X.
Do not jump to later phases.
Keep deterministic game rules separate from AI dialogue.
Add tests for game-rule changes.
Update docs if behavior changes.
```

## Branch naming

Use:

```text
issue-2-app-foundation
phase-1-classic-loop
phase-2-game-director
```

## PR checklist

Each PR should answer:

- What issue does this close?
- What changed?
- What is intentionally out of scope?
- How was it tested?
- Did any docs change?
- Could hidden role data leak before reveal?
- Does this change affect API, DB, AI prompt, or game rules?

## Implementation order

Start with:

1. Phase 0 app scaffold
2. Phase 1 classic loop with mock AI
3. Phase 2 OpenAI Game Director
4. Phase 3 memory/suspicion/personality
5. UI polish
6. Persistence

Do not start with:

- real-time multiplayer
- payments
- custom characters
- public feed
- voice mode

## Code quality rules

- Keep game logic testable outside React.
- Keep route handlers thin.
- Use TypeScript types for game state.
- Validate all model output.
- Use mock AI provider for tests.
- Never commit secrets.

## Useful Codex task style

Good:

```text
Implement Phase 1 Classic single-player loop using mock AI responses only. Add tests for role assignment, voting, and win conditions.
```

Bad:

```text
Build the whole game with all modes and payments.
```

## When Codex should stop and ask

Codex should stop when:

- issue scope conflicts with docs
- a required secret/API key is missing
- schema migration would destroy data
- implementation requires choosing a payment provider
- public safety/moderation behavior is unclear

## Review focus

When reviewing Codex PRs, check:

- Did it overbuild beyond the issue?
- Did it put game rules in UI components?
- Did it trust AI output too much?
- Did it leak hidden role data?
- Did it skip tests for state-machine changes?
- Did it introduce secrets or hardcoded keys?