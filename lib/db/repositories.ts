import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@/lib/db/client";
import type {
  AIUsageEventRow,
  AnonymousSessionRow,
  Database,
  GameMessageRow,
  GamePlayerRow,
  GameResultRow,
  GameRow,
  GameVoteRow,
  NightActionRow,
  PersistedGameState,
} from "@/lib/db/types";

type DbClient = SupabaseClient<Database>;

function getClient(client?: DbClient): DbClient {
  return client ?? createSupabaseServiceClient();
}

export class GameOwnershipError extends Error {
  constructor(gameId: string) {
    super(`Game ${gameId} was not found for this anonymous session.`);
    this.name = "GameOwnershipError";
  }
}

export async function upsertAnonymousSession(
  sessionId: string,
  client?: DbClient,
): Promise<AnonymousSessionRow> {
  const db = getClient(client);

  const { data: existingSession, error: existingSessionError } = await db
    .from("anonymous_sessions")
    .select()
    .eq("id", sessionId)
    .maybeSingle();

  if (existingSessionError) {
    throw existingSessionError;
  }

  if (existingSession) {
    const { data, error } = await db
      .from("anonymous_sessions")
      .update({
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await db
    .from("anonymous_sessions")
    .insert({
      id: sessionId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function incrementAnonymousSessionGameCount(
  sessionId: string,
  client?: DbClient,
): Promise<AnonymousSessionRow> {
  const db = getClient(client);
  const session = await upsertAnonymousSession(sessionId, db);
  const today = new Date().toISOString().slice(0, 10);
  const gamesStartedToday =
    session.usage_date === today ? session.games_started_today + 1 : 1;

  const { data, error } = await db
    .from("anonymous_sessions")
    .update({
      games_started_today: gamesStartedToday,
      usage_date: today,
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export type CreateGameInput = Pick<
  Database["public"]["Tables"]["games"]["Insert"],
  "anonymous_session_id" | "mode" | "current_phase" | "day_number" | "seed"
> &
  Partial<
    Pick<
      Database["public"]["Tables"]["games"]["Insert"],
      "difficulty" | "theme" | "status"
    >
  >;

export type UpdateGameInput = Omit<
  Database["public"]["Tables"]["games"]["Update"],
  "id" | "anonymous_session_id" | "created_at"
>;

export type UpdateGamePlayerInput = Omit<
  Database["public"]["Tables"]["game_players"]["Update"],
  "id" | "game_id" | "created_at"
>;

export async function createGame(
  input: CreateGameInput,
  client?: DbClient,
): Promise<GameRow> {
  const db = getClient(client);

  const { data, error } = await db.from("games").insert(input).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function assertGameBelongsToSession(
  gameId: string,
  anonymousSessionId: string,
  client?: DbClient,
): Promise<GameRow> {
  const db = getClient(client);

  const { data, error } = await db
    .from("games")
    .select()
    .eq("id", gameId)
    .eq("anonymous_session_id", anonymousSessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new GameOwnershipError(gameId);
  }

  return data;
}

export async function updateGameForSession(
  gameId: string,
  anonymousSessionId: string,
  update: UpdateGameInput,
  client?: DbClient,
): Promise<GameRow> {
  const db = getClient(client);

  const { data, error } = await db
    .from("games")
    .update(update)
    .eq("id", gameId)
    .eq("anonymous_session_id", anonymousSessionId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new GameOwnershipError(gameId);
  }

  return data;
}

export async function insertGamePlayers(
  players: Database["public"]["Tables"]["game_players"]["Insert"][],
  client?: DbClient,
): Promise<GamePlayerRow[]> {
  if (players.length === 0) {
    return [];
  }

  const db = getClient(client);
  const { data, error } = await db.from("game_players").insert(players).select();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGamePlayerForSession(
  gameId: string,
  anonymousSessionId: string,
  playerId: string,
  update: UpdateGamePlayerInput,
  client?: DbClient,
): Promise<GamePlayerRow> {
  const db = getClient(client);

  await assertGameBelongsToSession(gameId, anonymousSessionId, db);

  const { data, error } = await db
    .from("game_players")
    .update(update)
    .eq("game_id", gameId)
    .eq("id", playerId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new GameOwnershipError(gameId);
  }

  return data;
}

export async function appendGameMessages(
  messages: Database["public"]["Tables"]["game_messages"]["Insert"][],
  client?: DbClient,
): Promise<GameMessageRow[]> {
  if (messages.length === 0) {
    return [];
  }

  const db = getClient(client);
  const { data, error } = await db
    .from("game_messages")
    .insert(messages)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function recordGameVotes(
  votes: Database["public"]["Tables"]["game_votes"]["Insert"][],
  client?: DbClient,
): Promise<GameVoteRow[]> {
  if (votes.length === 0) {
    return [];
  }

  const db = getClient(client);
  const { data, error } = await db
    .from("game_votes")
    .upsert(votes, { onConflict: "game_id,day_number,voter_player_id" })
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function recordNightActions(
  actions: Database["public"]["Tables"]["night_actions"]["Insert"][],
  client?: DbClient,
): Promise<NightActionRow[]> {
  if (actions.length === 0) {
    return [];
  }

  const db = getClient(client);
  const { data, error } = await db
    .from("night_actions")
    .upsert(actions, {
      onConflict: "game_id,night_number,actor_player_id,action_type",
    })
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveGameResult(
  result: Database["public"]["Tables"]["game_results"]["Insert"],
  client?: DbClient,
): Promise<GameResultRow> {
  const db = getClient(client);

  const { data, error } = await db
    .from("game_results")
    .upsert(result, { onConflict: "game_id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function recordAIUsageEvent(
  event: Database["public"]["Tables"]["ai_usage_events"]["Insert"],
  client?: DbClient,
): Promise<AIUsageEventRow> {
  const db = getClient(client);

  const { data, error } = await db
    .from("ai_usage_events")
    .insert(event)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function loadGameState(
  gameId: string,
  client?: DbClient,
): Promise<PersistedGameState | null> {
  const db = getClient(client);

  const { data: game, error: gameError } = await db
    .from("games")
    .select()
    .eq("id", gameId)
    .maybeSingle();

  if (gameError) {
    throw gameError;
  }

  if (!game) {
    return null;
  }

  const [
    { data: players, error: playersError },
    { data: messages, error: messagesError },
    { data: votes, error: votesError },
    { data: nightActions, error: nightActionsError },
    { data: result, error: resultError },
  ] = await Promise.all([
    db.from("game_players").select().eq("game_id", gameId).order("created_at"),
    db.from("game_messages").select().eq("game_id", gameId).order("created_at"),
    db.from("game_votes").select().eq("game_id", gameId).order("created_at"),
    db.from("night_actions").select().eq("game_id", gameId).order("created_at"),
    db.from("game_results").select().eq("game_id", gameId).maybeSingle(),
  ]);

  const error =
    playersError ??
    messagesError ??
    votesError ??
    nightActionsError ??
    resultError;

  if (error) {
    throw error;
  }

  return {
    game,
    players: players ?? [],
    messages: messages ?? [],
    votes: votes ?? [],
    nightActions: nightActions ?? [],
    result: result ?? null,
  };
}

export async function loadGameStateForSession(
  gameId: string,
  anonymousSessionId: string,
  client?: DbClient,
): Promise<PersistedGameState | null> {
  const db = getClient(client);

  await assertGameBelongsToSession(gameId, anonymousSessionId, db);

  return loadGameState(gameId, db);
}

export async function listActiveGamesForSession(
  anonymousSessionId: string,
  client?: DbClient,
): Promise<GameRow[]> {
  const db = getClient(client);

  const { data, error } = await db
    .from("games")
    .select()
    .eq("anonymous_session_id", anonymousSessionId)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
