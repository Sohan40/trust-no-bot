import { NextResponse } from "next/server";
import {
  handleGameRouteError,
  requireAnonymousSession,
} from "@/app/api/game/_shared";
import { loadGameStateForSession } from "@/lib/db/repositories";
import { persistedStateToGame } from "@/lib/game/persistence";
import { persistTransitionForSession } from "@/lib/game/server-persistence";
import {
  advanceGamePhase,
  submitPlayerQuestion,
} from "@/lib/game/state-machine";

type ActionBody = {
  gameId?: unknown;
  actionType?: unknown;
  payload?: {
    question?: unknown;
    targetPlayerId?: unknown;
  };
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireAnonymousSession();

    if (!session.ok) {
      return session.response;
    }

    const body = (await request.json()) as ActionBody;

    if (typeof body.gameId !== "string") {
      return invalidBody("A gameId is required.");
    }

    if (body.actionType !== "ADVANCE_PHASE" && body.actionType !== "ASK_QUESTION") {
      return invalidBody("Unsupported actionType.");
    }

    const persisted = await loadGameStateForSession(body.gameId, session.sessionId);

    if (!persisted) {
      return invalidBody("Game not found.", 404);
    }

    const game = persistedStateToGame(persisted);
    const transition =
      body.actionType === "ADVANCE_PHASE"
        ? advanceGamePhase(game)
        : submitPlayerQuestion(
            game,
            typeof body.payload?.question === "string"
              ? body.payload.question.slice(0, 500)
              : "",
            typeof body.payload?.targetPlayerId === "string"
              ? body.payload.targetPlayerId
              : undefined,
          );
    const visible = await persistTransitionForSession(
      body.gameId,
      session.sessionId,
      transition,
    );

    return NextResponse.json(visible);
  } catch (error) {
    return handleGameRouteError(error);
  }
}

function invalidBody(message: string, status = 400): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "INVALID_REQUEST",
        message,
      },
    },
    { status },
  );
}
