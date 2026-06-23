import type {
  AvailableAction,
  VisibleGameState,
} from "@/lib/game/types";

type ActionPayload = {
  question?: string;
  targetPlayerId?: string;
};

export async function startClassicGame(): Promise<VisibleGameState> {
  return requestVisibleGame("/api/game/start", {
    method: "POST",
    body: JSON.stringify({
      mode: "classic",
      difficulty: "normal",
      theme: "classic",
    }),
  });
}

export async function loadVisibleGame(
  gameId: string,
  signal?: AbortSignal,
): Promise<VisibleGameState> {
  return requestVisibleGame(
    `/api/game/${encodeURIComponent(gameId)}`,
    {
      method: "GET",
      signal,
    },
  );
}

export async function submitGameAction(
  gameId: string,
  actionType: Exclude<AvailableAction, "VOTE">,
  payload?: ActionPayload,
): Promise<VisibleGameState> {
  return requestVisibleGame("/api/game/action", {
    method: "POST",
    body: JSON.stringify({
      gameId,
      actionType,
      payload,
    }),
  });
}

export async function submitGameVote(
  gameId: string,
  targetPlayerId: string,
): Promise<VisibleGameState> {
  return requestVisibleGame("/api/game/vote", {
    method: "POST",
    body: JSON.stringify({
      gameId,
      targetPlayerId,
    }),
  });
}

async function requestVisibleGame(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<VisibleGameState> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload));
  }

  if (!isVisibleGameState(payload)) {
    throw new Error("The game server returned an invalid response.");
  }

  return payload;
}

function getApiErrorMessage(payload: unknown): string {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return "The game request failed. Please try again.";
  }

  return typeof payload.error.message === "string"
    ? payload.error.message
    : "The game request failed. Please try again.";
}

function isVisibleGameState(value: unknown): value is VisibleGameState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.game) &&
    typeof value.game.id === "string" &&
    Array.isArray(value.publicPlayers) &&
    Array.isArray(value.messages) &&
    Array.isArray(value.availableActions) &&
    isRecord(value.privateInfo)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}