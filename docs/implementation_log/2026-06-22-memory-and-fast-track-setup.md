# 2026-06-22: Memory and Fast-track Setup

## What changed

Added repo-owned persistent memory for Codex and documented the next-week deployment fast track.

## Files added

- `docs/current_state.md`
- `docs/codex_memory.md`
- `docs/decisions/0001-backend-choice.md`
- `docs/decisions/0002-next-week-deployment-fast-track.md`
- `docs/implementation_log/2026-06-22-memory-and-fast-track-setup.md`

## Why

Codex should not depend on chat history. Project memory must live in committed repo files.

The user wants deployment next week, so the project must move Supabase persistence earlier than the original long-term phase plan.

## Current recommendation

Start Codex with GitHub issue #2 for app scaffolding, but make sure Codex reads:

- `AGENTS.md`
- `docs/current_state.md`
- `docs/codex_memory.md`
- `docs/decisions/0002-next-week-deployment-fast-track.md`

## Next task

Update `AGENTS.md` and `README.md` to point Codex and humans to these memory files.