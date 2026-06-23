import { NextResponse } from "next/server";
import {
  handleGameRouteError,
  requireAnonymousSession,
} from "@/app/api/game/_shared";
import { loadGameStateForSession } from "@/lib/db/repositories";
import { persistedStateToGame } from "@/lib/game/persistence";
import { persistTransitionForSession } from "@/lib/game/server-persistence";
import { submitHumanVote } from "@/lib/game/state-machine";

type VoteBody = {
  gameId?: unknown;
  targetPlayerId?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireAnonymousSession();

    if (!session.ok) {
      return session.response;
    }

    const body = (await request.json()) as VoteBody;

    if (typeof body.gameId !== "string") {
      return invalidBody("A gameId is required.");
    }

    if (typeof body.targetPlayerId !== "string") {
      return invalidBody("A targetPlayerId is required.");
    }

    const persisted = await loadGameStateForSession(body.gameId, session.sessionId);

    if (!persisted) {
      return invalidBody("Game not found.", 404);
    }

    const game = persistedStateToGame(persisted);
    const transition = submitHumanVote(game, body.targetPlayerId);
    const visible = await persistTransitionForSession(
      body.gameId,
      session.sessionId,
      transition,
    );

    return NextResponse.json({
      voteAccepted: true,
      ...visible,
    });
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
