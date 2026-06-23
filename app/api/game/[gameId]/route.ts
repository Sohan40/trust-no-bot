import { NextResponse } from "next/server";
import {
  handleGameRouteError,
  requireAnonymousSession,
} from "@/app/api/game/_shared";
import { loadVisibleGameForSession } from "@/lib/game/server-persistence";

type RouteContext = {
  params: Promise<{
    gameId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const session = await requireAnonymousSession();

    if (!session.ok) {
      return session.response;
    }

    const { gameId } = await context.params;
    const visibleGame = await loadVisibleGameForSession(gameId, session.sessionId);

    if (!visibleGame) {
      return NextResponse.json(
        {
          error: {
            code: "GAME_NOT_FOUND",
            message: "Game not found.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(visibleGame);
  } catch (error) {
    return handleGameRouteError(error);
  }
}
