import "server-only";

import {
  appendGameMessages,
  loadGameStateForSession,
  recordGameVotes,
  recordNightActions,
  saveGameResult,
  updateGameForSession,
  updateGamePlayerForSession,
} from "@/lib/db/repositories";
import {
  messagesToInserts,
  nightActionsToInserts,
  persistedStateToGame,
  resultToInsert,
  votesToInserts,
} from "@/lib/game/persistence";
import { toVisibleGameState } from "@/lib/game/public-state";
import type { GameTransition } from "@/lib/game/state-machine";
import type { VisibleGameState } from "@/lib/game/types";

export async function loadVisibleGameForSession(
  gameId: string,
  anonymousSessionId: string,
): Promise<VisibleGameState | null> {
  const persisted = await loadGameStateForSession(gameId, anonymousSessionId);

  if (!persisted) {
    return null;
  }

  const game = persistedStateToGame(persisted);
  return toVisibleGameState(game, game.humanPlayerId);
}

export async function persistTransitionForSession(
  gameId: string,
  anonymousSessionId: string,
  transition: GameTransition,
): Promise<VisibleGameState | null> {
  await updateGameForSession(gameId, anonymousSessionId, {
    current_phase: transition.game.phase,
    day_number: transition.game.dayNumber,
    status: transition.game.status,
    winner: transition.game.winner,
    completed_at:
      transition.game.status === "completed" ? new Date().toISOString() : null,
  });

  for (const player of transition.changedPlayers ?? []) {
    await updateGamePlayerForSession(gameId, anonymousSessionId, player.id, {
      is_alive: player.isAlive,
    });
  }

  await recordNightActions(
    nightActionsToInserts(gameId, transition.newNightActions ?? []),
  );
  await recordGameVotes(votesToInserts(gameId, transition.newVotes ?? []));
  await appendGameMessages(
    messagesToInserts(gameId, transition.newMessages, transition.game.dayNumber),
  );

  if (transition.result) {
    await saveGameResult(
      resultToInsert(gameId, transition.game, transition.result),
    );
  }

  return loadVisibleGameForSession(gameId, anonymousSessionId);
}
