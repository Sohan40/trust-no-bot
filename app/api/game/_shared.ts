import { NextResponse } from "next/server";
import { GameOwnershipError } from "@/lib/db/repositories";
import { GameRuleError } from "@/lib/game/voting";
import { getAnonymousSessionId } from "@/lib/session/anonymous-session";

export async function requireAnonymousSession(): Promise<
  | { ok: true; sessionId: string }
  | { ok: false; response: NextResponse }
> {
  const sessionId = await getAnonymousSessionId();

  if (!sessionId) {
    return {
      ok: false,
      response: errorResponse(
        "MISSING_SESSION",
        "Start a game before loading or changing game state.",
        401,
      ),
    };
  }

  return { ok: true, sessionId };
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function handleGameRouteError(error: unknown): NextResponse {
  if (error instanceof GameOwnershipError) {
    return errorResponse("GAME_NOT_FOUND", error.message, 404);
  }

  if (error instanceof GameRuleError) {
    return errorResponse(error.code, error.message, 400);
  }

  if (error instanceof Error) {
    return errorResponse("INVALID_ACTION", error.message, 400);
  }

  return errorResponse("UNKNOWN_ERROR", "Something went wrong.", 500);
}
