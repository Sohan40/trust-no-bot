import { NextResponse } from "next/server";
import {
  appendGameMessages,
  createGame,
  incrementAnonymousSessionGameCount,
  insertGamePlayers,
} from "@/lib/db/repositories";
import {
  messagesToInserts,
  playersToInserts,
} from "@/lib/game/persistence";
import { toVisibleGameState } from "@/lib/game/public-state";
import { createClassicGame } from "@/lib/game/state-machine";
import { getOrCreateAnonymousSessionId } from "@/lib/session/anonymous-session";
import { errorResponse, handleGameRouteError } from "@/app/api/game/_shared";

const originalClassicPlayerIds = [
  "human",
  "arjun",
  "riya",
  "kabir",
  "meera",
  "tara",
  "dev",
];

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await parseJsonBody(request);

    if (body.mode && body.mode !== "classic") {
      return errorResponse("UNSUPPORTED_MODE", "Only Classic Mode is available.", 400);
    }

    if (body.difficulty && body.difficulty !== "normal") {
      return errorResponse(
        "UNSUPPORTED_DIFFICULTY",
        "Only normal difficulty is available.",
        400,
      );
    }

    if (body.theme && body.theme !== "classic") {
      return errorResponse("UNSUPPORTED_THEME", "Only the classic theme is available.", 400);
    }

    const sessionId = await getOrCreateAnonymousSessionId();
    const seed = createSeed();

    await incrementAnonymousSessionGameCount(sessionId);

    const row = await createGame({
      anonymous_session_id: sessionId,
      mode: "classic",
      difficulty: "normal",
      theme: "classic",
      current_phase: "ROLE_REVEAL",
      day_number: 1,
      seed,
      status: "active",
    });
    const idsByOriginalId = Object.fromEntries(
      originalClassicPlayerIds.map((playerId) => [playerId, crypto.randomUUID()]),
    );
    const transition = createClassicGame({
      gameId: row.id,
      seed,
      playerIdsByOriginalId: idsByOriginalId,
    });

    await insertGamePlayers(playersToInserts(row.id, transition.game.players));
    await appendGameMessages(
      messagesToInserts(row.id, transition.newMessages, transition.game.dayNumber),
    );

    return NextResponse.json(
      toVisibleGameState(transition.game, transition.game.humanPlayerId),
      { status: 201 },
    );
  } catch (error) {
    return handleGameRouteError(error);
  }
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function createSeed(): string {
  return `classic-${new Date().toISOString()}-${crypto.randomUUID()}`;
}
