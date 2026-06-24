import "server-only";

import { getServerGameDirector } from "@/lib/ai/server-director";
import {
  advanceGamePhase,
  submitPlayerQuestion,
  type GameTransition,
} from "@/lib/game/state-machine";
import type { Game, PlayerId } from "@/lib/game/types";

export async function advanceGamePhaseWithDirector(
  game: Game,
): Promise<GameTransition> {
  if (game.phase !== "DAY_DISCUSSION") {
    return advanceGamePhase(game);
  }

  const output = await getServerGameDirector().generateDayDiscussion(game);
  return advanceGamePhase(game, output.publicMessages);
}

export async function submitPlayerQuestionWithDirector(
  game: Game,
  question: string,
  targetPlayerId?: PlayerId,
): Promise<GameTransition> {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return submitPlayerQuestion(game, null, targetPlayerId);
  }

  const output = await getServerGameDirector().generateQuestionResponses(
    game,
    trimmedQuestion,
    targetPlayerId,
  );

  return submitPlayerQuestion(
    game,
    trimmedQuestion,
    targetPlayerId,
    output.publicMessages,
  );
}
