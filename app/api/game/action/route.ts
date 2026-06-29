import { NextResponse } from "next/server";
import {
  handleGameRouteError,
  requireAnonymousSession,
} from "@/app/api/game/_shared";
import {
  claimAnonymousSessionAIAction,
  loadGameStateForSession,
} from "@/lib/db/repositories";
import { isSafeUserQuestion } from "@/lib/ai/safety";
import { getServerGameDirectorUsageMetadata } from "@/lib/ai/server-director";
import { persistedStateToGame } from "@/lib/game/persistence";
import { persistTransitionForSession } from "@/lib/game/server-persistence";
import {
  advanceGamePhaseWithDirector,
  submitPlayerQuestionWithDirector,
} from "@/lib/game/server-transitions";
import {
  assertUsageClaimAllowed,
  getAIUsagePurpose,
} from "@/lib/usage/limits";
import { getServerUsageLimits } from "@/lib/usage/server";

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
    const usagePurpose = getAIUsagePurpose({
      actionType: body.actionType,
      phase: game.phase,
      question,
    });

    if (usagePurpose) {
      const limits = getServerUsageLimits();
      const provider = getServerGameDirectorUsageMetadata();
      const usageClaim = await claimAnonymousSessionAIAction({
        sessionId: session.sessionId,
        gameId: body.gameId,
        purpose: usagePurpose,
        provider: provider.provider,
        model: provider.model,
        dailyLimit: limits.aiActionsPerDay,
        questionLimit: limits.questionsPerGame,
      });
      assertUsageClaimAllowed(usageClaim);
    }

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
