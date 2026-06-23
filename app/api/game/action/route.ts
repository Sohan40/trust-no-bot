import { NextResponse } from "next/server";
import {
  handleGameRouteError,
  requireAnonymousSession,
} from "@/app/api/game/_shared";
import { loadGameStateForSession } from "@/lib/db/repositories";
import { isSafeUserQuestion } from "@/lib/ai/safety";
import { persistedStateToGame } from "@/lib/game/persistence";
import { persistTransitionForSession } from "@/lib/game/server-persistence";
import {
  advanceGamePhaseWithDirector,
  submitPlayerQuestionWithDirector,
} from "@/lib/game/server-transitions";

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

    const question =
      typeof body.payload?.question === "string"
        ? body.payload.question.slice(0, 500)
        : "";

    if (
      body.actionType === "ASK_QUESTION" &&
      question.trim() &&
      !isSafeUserQuestion(question)
    ) {
      return invalidBody(
        "Keep questions fictional, safe, and focused on the game.",
      );
    }

    const persisted = await loadGameStateForSession(body.gameId, session.sessionId);

    if (!persisted) {
      return invalidBody("Game not found.", 404);
    }

    const game = persistedStateToGame(persisted);
    const transition =
      body.actionType === "ADVANCE_PHASE"
        ? await advanceGamePhaseWithDirector(game)
        : await submitPlayerQuestionWithDirector(
            game,
            question,
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
